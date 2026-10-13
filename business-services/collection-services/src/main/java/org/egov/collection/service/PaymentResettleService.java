package org.egov.collection.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.egov.collection.config.ApplicationProperties;
import org.egov.collection.model.Payment;
import org.egov.collection.model.PaymentDetail;
import org.egov.collection.model.PaymentRequest;
import org.egov.collection.model.PaymentResettleCriteria;
import org.egov.collection.model.PaymentSearchCriteria;
import org.egov.collection.producer.CollectionProducer;
import org.egov.collection.repository.BillingServiceRepository;
import org.egov.collection.repository.PaymentRepository;
import org.egov.collection.web.contract.Bill;
import org.egov.collection.web.contract.PaymentResettleRequest;
import org.egov.collection.web.contract.PaymentResettleResponse;
import org.egov.collection.web.contract.factory.ResponseInfoFactory;
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

		// 5. Build and return response
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
}
