package org.egov.collection.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.egov.collection.config.ApplicationProperties;
import org.egov.collection.model.Payment;
import org.egov.collection.model.PaymentAutoResettleCriteria;
import org.egov.collection.model.PaymentDetail;
import org.egov.collection.model.PaymentRequest;
import org.egov.collection.model.PaymentResettleBatchAudit;
import org.egov.collection.model.PaymentResettleCriteria;
import org.egov.collection.model.PaymentResettleDetailAudit;
import org.egov.collection.model.PaymentSearchCriteria;
import org.egov.collection.producer.CollectionProducer;
import org.egov.collection.repository.BillingServiceRepository;
import org.egov.collection.repository.PaymentRepository;
import org.egov.collection.web.contract.Bill;
import org.egov.collection.web.contract.PaymentAutoResettleRequest;
import org.egov.collection.web.contract.PaymentAutoResettleResponse;
import org.egov.collection.web.contract.PaymentResettleRequest;
import org.egov.collection.web.contract.PaymentResettleResponse;
import org.egov.collection.web.contract.factory.ResponseInfoFactory;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentResettleService {

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private BillingServiceRepository billingServiceRepository;

	@Autowired
	private CollectionProducer producer;

	@Autowired
	private ApplicationProperties applicationProperties;

	public PaymentResettleResponse resettlePayment(PaymentResettleRequest resettleRequest) {
		if (resettleRequest == null || resettleRequest.getResettleCriteria() == null) {
			throw new CustomException("INVALID_REQUEST", "Resettle criteria cannot be null");
		}

		PaymentResettleCriteria criteria = resettleRequest.getResettleCriteria();
		if (StringUtils.isEmpty(criteria.getTenantId())) {
			throw new CustomException("INVALID_TENANT_ID", "TenantId is mandatory for resettlement");
		}

		if (StringUtils.isEmpty(criteria.getPaymentId()) && StringUtils.isEmpty(criteria.getReceiptNumber())
				&& StringUtils.isEmpty(criteria.getConsumerCode()) && StringUtils.isEmpty(criteria.getBillId())) {
			throw new CustomException("INVALID_CRITERIA",
					"At least one of paymentId, receiptNumber, consumerCode, or billId must be provided");
		}

		// 1. Fetch payment from collection-services repository
		PaymentSearchCriteria searchCriteria = PaymentSearchCriteria.builder()
				.tenantId(criteria.getTenantId())
				.offset(0)
				.limit(applicationProperties.getReceiptsSearchDefaultLimit())
				.build();

		if (!StringUtils.isEmpty(criteria.getPaymentId())) {
			Set<String> ids = new HashSet<>();
			ids.add(criteria.getPaymentId());
			searchCriteria.setIds(ids);
		}
		if (!StringUtils.isEmpty(criteria.getReceiptNumber())) {
			Set<String> receiptNumbers = new HashSet<>();
			receiptNumbers.add(criteria.getReceiptNumber());
			searchCriteria.setReceiptNumbers(receiptNumbers);
		}
		if (!StringUtils.isEmpty(criteria.getConsumerCode())) {
			Set<String> consumerCodes = new HashSet<>();
			consumerCodes.add(criteria.getConsumerCode());
			searchCriteria.setConsumerCodes(consumerCodes);
		}
		if (!StringUtils.isEmpty(criteria.getBillId())) {
			Set<String> billIds = new HashSet<>();
			billIds.add(criteria.getBillId());
			searchCriteria.setBillIds(billIds);
		}
		if (!StringUtils.isEmpty(criteria.getBusinessService())) {
			searchCriteria.setBusinessService(criteria.getBusinessService());
		}

		List<Payment> payments = paymentRepository.fetchPayments(searchCriteria);
		if (CollectionUtils.isEmpty(payments)) {
			throw new CustomException("PAYMENT_NOT_FOUND", "No payment found matching given resettle criteria");
		}

		Payment payment = payments.get(0);
		if (CollectionUtils.isEmpty(payment.getPaymentDetails())) {
			throw new CustomException("INVALID_PAYMENT_DETAILS", "Payment does not contain any payment details");
		}

		PaymentDetail primaryDetail = payment.getPaymentDetails().get(0);
		String originalBillId = primaryDetail.getBillId();
		if (StringUtils.isEmpty(originalBillId)) {
			throw new CustomException("INVALID_BILL_ID", "Payment detail does not have an associated bill ID");
		}

		String consumerCode = (primaryDetail.getBill() != null && !StringUtils.isEmpty(primaryDetail.getBill().getConsumerCode()))
				? primaryDetail.getBill().getConsumerCode()
				: criteria.getConsumerCode();

		String businessService = primaryDetail.getBusinessService();
		if (StringUtils.isEmpty(businessService)) {
			businessService = criteria.getBusinessService();
		}

		// 2. Check for phantom ACTIVE bill in billing-service and cancel it if present
		String cancelledActiveBillId = null;
		if (!StringUtils.isEmpty(consumerCode) && !StringUtils.isEmpty(businessService)) {
			try {
				List<Bill> activeBills = billingServiceRepository.searchBills(resettleRequest.getRequestInfo(),
						payment.getTenantId(), consumerCode, businessService, "ACTIVE");

				if (!CollectionUtils.isEmpty(activeBills)) {
					for (Bill activeBill : activeBills) {
						if (activeBill.getId() != null && !activeBill.getId().equals(originalBillId)) {
							log.info("Found phantom active bill {} for consumerCode {}, cancelling it", activeBill.getId(), consumerCode);
							billingServiceRepository.cancelBill(resettleRequest.getRequestInfo(), payment.getTenantId(),
									consumerCode, businessService);
							cancelledActiveBillId = activeBill.getId();
							break;
						}
					}
				}
			} catch (Exception e) {
				log.warn("Error while inspecting or cancelling phantom active bill for consumerCode {}: {}", consumerCode, e.getMessage());
			}
		}

		// 3. Reactivate original bill in billing-service so it can be settled
		try {
			log.info("Reactivating original bill {} in billing-service", originalBillId);
			billingServiceRepository.reactivateBill(resettleRequest.getRequestInfo(), originalBillId);
		} catch (Exception e) {
			log.warn("Error while reactivating original bill {}: {}", originalBillId, e.getMessage());
		}

		// 4. Trigger demand settlement by publishing to Kafka payment create topic
		PaymentRequest paymentRequest = new PaymentRequest(resettleRequest.getRequestInfo(), payment);
		String key = payment.getMobileNumber() + payment.getId();
		producer.producer(applicationProperties.getCreatePaymentTopicName(), key, paymentRequest);
		log.info("Payment settlement event successfully re-produced to Kafka topic {} for payment ID {}",
				applicationProperties.getCreatePaymentTopicName(), payment.getId());

		// 5. Audit the manual resettlement
		String userUuid = (resettleRequest.getRequestInfo() != null && resettleRequest.getRequestInfo().getUserInfo() != null)
				? resettleRequest.getRequestInfo().getUserInfo().getUuid()
				: "SYSTEM";
		String manualBatchId = "MANUAL-" + UUID.randomUUID().toString().substring(0, 8);

		PaymentResettleBatchAudit manualBatchAudit = PaymentResettleBatchAudit.builder()
				.id(UUID.randomUUID().toString())
				.batchId(manualBatchId)
				.tenantId(payment.getTenantId())
				.businessService(businessService)
				.fromTime(System.currentTimeMillis())
				.toTime(System.currentTimeMillis())
				.totalFound(1)
				.totalSettled(1)
				.totalSkipped(0)
				.totalFailed(0)
				.status("COMPLETED")
				.createdTime(System.currentTimeMillis())
				.createdBy(userUuid)
				.build();
		paymentRepository.saveResettleBatchAudit(manualBatchAudit);

		PaymentResettleDetailAudit manualAudit = PaymentResettleDetailAudit.builder()
				.id(UUID.randomUUID().toString())
				.batchId(manualBatchId)
				.paymentId(payment.getId())
				.consumerCode(consumerCode)
				.businessService(businessService)
				.billId(originalBillId)
				.tenantId(payment.getTenantId())
				.resettleStatus("SETTLED")
				.failureReason("Manual resettlement initiated" + (cancelledActiveBillId != null ? ", cancelled active bill: " + cancelledActiveBillId : ""))
				.createdTime(System.currentTimeMillis())
				.createdBy(userUuid)
				.build();
		paymentRepository.saveResettleDetailAudit(Collections.singletonList(manualAudit));

		// 6. Build and return response
		ResponseInfo responseInfo = ResponseInfoFactory.createResponseInfoFromRequestInfo(resettleRequest.getRequestInfo(), true);
		String message = "Payment resettlement initiated successfully for Payment ID: " + payment.getId()
				+ ", Original Bill ID: " + originalBillId
				+ (cancelledActiveBillId != null ? ", Cancelled Phantom Active Bill ID: " + cancelledActiveBillId : "")
				+ ". Demand and bill settlement event produced to Kafka.";

		return PaymentResettleResponse.builder()
				.responseInfo(responseInfo)
				.payment(payment)
				.originalBillId(originalBillId)
				.cancelledActiveBillId(cancelledActiveBillId)
				.resettleStatus("SUCCESS")
				.message(message)
				.build();
	}

	public PaymentAutoResettleResponse autoResettlePayments(PaymentAutoResettleRequest request) {
		if (request == null) {
			throw new CustomException("INVALID_REQUEST", "Request cannot be null");
		}
		RequestInfo requestInfo = request.getRequestInfo();
		PaymentAutoResettleCriteria criteria = request.getCriteria();
		if (criteria == null) {
			criteria = new PaymentAutoResettleCriteria();
		}

		long bufferMinutes = (criteria.getBufferMinutes() != null && criteria.getBufferMinutes() >= 0)
				? criteria.getBufferMinutes() : 30L;
		long lookbackHours = (criteria.getLookbackHours() != null && criteria.getLookbackHours() > 0)
				? criteria.getLookbackHours() : 24L;

		long toTime = (criteria.getToTime() != null)
				? criteria.getToTime()
				: System.currentTimeMillis() - (bufferMinutes * 60 * 1000L);

		long fromTime = (criteria.getFromTime() != null)
				? criteria.getFromTime()
				: toTime - (lookbackHours * 3600 * 1000L);

		int limit = (criteria.getLimit() != null && criteria.getLimit() > 0)
				? criteria.getLimit() : 50;

		log.info("Starting auto-resettlement check for payments created between {} and {}, limit={}",
				fromTime, toTime, limit);

		List<String> candidateIds = paymentRepository.fetchCandidatePaymentIdsForAutoResettle(
				fromTime, toTime, criteria.getTenantId(), criteria.getBusinessService(), limit);

		int totalFound = (candidateIds != null) ? candidateIds.size() : 0;
		int resettled = 0;
		int skipped = 0;
		int failed = 0;
		List<String> resettledIds = new ArrayList<>();
		List<String> failedIds = new ArrayList<>();
		List<String> messages = new ArrayList<>();

		String batchId = UUID.randomUUID().toString();
		String userUuid = (requestInfo != null && requestInfo.getUserInfo() != null)
				? requestInfo.getUserInfo().getUuid()
				: "CRON_SYSTEM";
		List<PaymentResettleDetailAudit> detailAudits = new ArrayList<>();

		if (totalFound > 0) {
			PaymentSearchCriteria searchCriteria = PaymentSearchCriteria.builder()
					.ids(new HashSet<>(candidateIds))
					.tenantId(criteria.getTenantId())
					.offset(0)
					.limit(totalFound)
					.build();

			List<Payment> payments = paymentRepository.fetchPayments(searchCriteria);

			for (Payment payment : payments) {
				String paymentId = payment.getId();
				String originalBillId = null;
				String consumerCode = null;
				String businessService = null;
				try {
					boolean needsResettle = false;

					if (!CollectionUtils.isEmpty(payment.getPaymentDetails())) {
						for (PaymentDetail detail : payment.getPaymentDetails()) {
							String billId = detail.getBillId();
							if (StringUtils.isEmpty(billId)) {
								continue;
							}
							originalBillId = billId;
							businessService = detail.getBusinessService();
							if (detail.getBill() != null) {
								consumerCode = detail.getBill().getConsumerCode();
							}

							// Check bill status in billing-service
							try {
								List<Bill> bills = billingServiceRepository.fetchBill(requestInfo, payment.getTenantId(),
										Collections.singletonList(billId));
								if (!CollectionUtils.isEmpty(bills)) {
									Bill bill = bills.get(0);
									if (bill.getStatus() != null && !"PAID".equalsIgnoreCase(bill.getStatus().toString())) {
										log.info("Payment {} has bill {} with status {} (not PAID), needs resettlement",
												paymentId, billId, bill.getStatus());
										needsResettle = true;
										break;
									}
								} else {
									log.warn("Bill {} not found in billing-service for payment {}, attempting resettle", billId, paymentId);
									needsResettle = true;
									break;
								}
							} catch (Exception e) {
								log.warn("Error fetching bill {} from billing-service for payment {}: {}", billId, paymentId, e.getMessage());
							}
						}
					}

					if (!needsResettle) {
						skipped++;
						detailAudits.add(PaymentResettleDetailAudit.builder()
								.id(UUID.randomUUID().toString())
								.batchId(batchId)
								.paymentId(paymentId)
								.consumerCode(consumerCode)
								.businessService(businessService)
								.billId(originalBillId)
								.tenantId(payment.getTenantId())
								.resettleStatus("SKIPPED")
								.failureReason("Bill already settled/PAID in billing-service")
								.createdTime(System.currentTimeMillis())
								.createdBy(userUuid)
								.build());
						continue;
					}

					// Resettle payment
					// 1. Cancel phantom active bill if present
					String cancelledActiveBillId = null;
					if (!StringUtils.isEmpty(consumerCode) && !StringUtils.isEmpty(businessService)) {
						try {
							List<Bill> activeBills = billingServiceRepository.searchBills(requestInfo,
									payment.getTenantId(), consumerCode, businessService, "ACTIVE");
							if (!CollectionUtils.isEmpty(activeBills)) {
								for (Bill activeBill : activeBills) {
									if (activeBill.getId() != null && !activeBill.getId().equals(originalBillId)) {
										log.info("Auto-resettle: cancelling phantom active bill {} for consumerCode {}",
												activeBill.getId(), consumerCode);
										billingServiceRepository.cancelBill(requestInfo, payment.getTenantId(),
												consumerCode, businessService);
										cancelledActiveBillId = activeBill.getId();
										break;
									}
								}
							}
						} catch (Exception e) {
							log.warn("Auto-resettle: error searching/cancelling active bill for consumerCode {}: {}",
									consumerCode, e.getMessage());
						}
					}

					// 2. Reactivate original bill
					if (!StringUtils.isEmpty(originalBillId)) {
						try {
							billingServiceRepository.reactivateBill(requestInfo, originalBillId);
						} catch (Exception e) {
							log.warn("Auto-resettle: error reactivating bill {}: {}", originalBillId, e.getMessage());
						}
					}

					// 3. Produce to Kafka
					PaymentRequest paymentRequest = new PaymentRequest(requestInfo, payment);
					String key = payment.getMobileNumber() + payment.getId();
					producer.producer(applicationProperties.getCreatePaymentTopicName(), key, paymentRequest);

					resettled++;
					resettledIds.add(paymentId);
					String msg = "Successfully resettled payment " + paymentId
							+ " (originalBillId: " + originalBillId
							+ (cancelledActiveBillId != null ? ", cancelledActiveBillId: " + cancelledActiveBillId : "")
							+ ")";
					messages.add(msg);
					log.info(msg);

					detailAudits.add(PaymentResettleDetailAudit.builder()
							.id(UUID.randomUUID().toString())
							.batchId(batchId)
							.paymentId(paymentId)
							.consumerCode(consumerCode)
							.businessService(businessService)
							.billId(originalBillId)
							.tenantId(payment.getTenantId())
							.resettleStatus("SETTLED")
							.failureReason(msg)
							.createdTime(System.currentTimeMillis())
							.createdBy(userUuid)
							.build());

				} catch (Exception e) {
					log.error("Failed to auto-resettle payment " + paymentId, e);
					failed++;
					failedIds.add(paymentId);
					String errorMsg = "Failed to resettle payment " + paymentId + ": " + e.getMessage();
					messages.add(errorMsg);

					detailAudits.add(PaymentResettleDetailAudit.builder()
							.id(UUID.randomUUID().toString())
							.batchId(batchId)
							.paymentId(paymentId)
							.consumerCode(consumerCode)
							.businessService(businessService)
							.billId(originalBillId)
							.tenantId(payment.getTenantId())
							.resettleStatus("FAILED")
							.failureReason(e.getMessage() != null ? e.getMessage() : e.toString())
							.createdTime(System.currentTimeMillis())
							.createdBy(userUuid)
							.build());
				}
			}
		}

		// Save batch audit summary and detail audits
		PaymentResettleBatchAudit batchAudit = PaymentResettleBatchAudit.builder()
				.id(UUID.randomUUID().toString())
				.batchId(batchId)
				.tenantId(criteria.getTenantId())
				.businessService(criteria.getBusinessService())
				.fromTime(fromTime)
				.toTime(toTime)
				.totalFound(totalFound)
				.totalSettled(resettled)
				.totalSkipped(skipped)
				.totalFailed(failed)
				.status(failed == 0 ? "COMPLETED" : (resettled > 0 ? "PARTIAL" : "FAILED"))
				.createdTime(System.currentTimeMillis())
				.createdBy(userUuid)
				.build();

		paymentRepository.saveResettleBatchAudit(batchAudit);
		paymentRepository.saveResettleDetailAudit(detailAudits);

		ResponseInfo responseInfo = ResponseInfoFactory.createResponseInfoFromRequestInfo(requestInfo, true);
		return PaymentAutoResettleResponse.builder()
				.responseInfo(responseInfo)
				.batchId(batchId)
				.totalFound(totalFound)
				.resettled(resettled)
				.skipped(skipped)
				.failed(failed)
				.resettledPaymentIds(resettledIds)
				.failedPaymentIds(failedIds)
				.messages(messages)
				.build();
	}

	public List<PaymentResettleBatchAudit> getResettleBatchAudits(String tenantId, Integer limit) {
		return paymentRepository.fetchResettleBatchAudits(tenantId, limit);
	}

	public List<PaymentResettleDetailAudit> getResettleDetailAudits(String batchId, String paymentId, String status, Integer limit) {
		return paymentRepository.fetchResettleDetailAudits(batchId, paymentId, status, limit);
	}
}
