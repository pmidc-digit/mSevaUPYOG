package com.ingestpipeline.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ingestpipeline.model.IncomingData;
import com.ingestpipeline.model.ReconciliationRequest;
import com.ingestpipeline.model.ReconciliationResponse;

@Service("reconciliationService")
public class ReconciliationServiceImpl implements ReconciliationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(ReconciliationServiceImpl.class);

	@Autowired
	private IngestService ingestService;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private ObjectMapper mapper;

	@Value("${egov.collection.service.host:http://localhost:8080}")
	private String collectionServiceHost;

	@Value("${egov.collection.service.search.endpoint:/collection-services/payments/_search}")
	private String collectionServiceSearchEndpoint;

	@Value("${egov.mdms.service.host:http://egov-mdms-service:8080}")
	private String mdmsHost;

	@Value("${egov.mdms.service.search.endpoint:/egov-mdms-service/v1/_search}")
	private String mdmsSearchEndpoint;

	private static final String DATA_CONTEXT_COLLECTION = "collection";
	private static final String DATA_CONTEXT_VERSION_V2 = "v2";

	@Override
	public ReconciliationResponse reconcile(ReconciliationRequest request) {
		ReconciliationResponse response = new ReconciliationResponse();
		response.setTenantId(request.getTenantId());

		List<Map<String, Object>> paymentsToProcess = new ArrayList<>();

		// 1. If caller directly provided payments list in payload, use it
		if (request.getPayments() != null && !request.getPayments().isEmpty()) {
			paymentsToProcess.addAll(request.getPayments());
			LOGGER.info("Using {} payments directly provided in request body", paymentsToProcess.size());
		} else {
			// 2. Otherwise query collection-services /payments/_search
			try {
				paymentsToProcess = fetchPaymentsFromCollectionService(request);
				LOGGER.info("Fetched {} payments from collection-services for reconciliation", paymentsToProcess.size());
			} catch (Exception e) {
				LOGGER.error("Failed to fetch payments from collection-services: {}", e.getMessage(), e);
				response.setStatus("FAILED");
				response.setMessage("Failed to fetch payments from collection-services: " + e.getMessage());
				return response;
			}
		}

		response.setTotalFetched(paymentsToProcess.size());

		if (paymentsToProcess.isEmpty()) {
			response.setStatus("SUCCESS");
			response.setMessage("No payments found for the specified criteria.");
			return response;
		}

		// 3. Process and ingest each payment into the pipeline
		int ingestedCount = 0;
		BigDecimal totalAmount = BigDecimal.ZERO;
		List<String> paymentIds = new ArrayList<>();

		for (Map<String, Object> paymentMap : paymentsToProcess) {
			try {
				// Normalize payer fields if missing as nested object
				normalizePaymentPayload(paymentMap);

				IncomingData incomingData = new IncomingData();
				incomingData.setDataContext(DATA_CONTEXT_COLLECTION);
				incomingData.setDataContextVersion(DATA_CONTEXT_VERSION_V2);
				incomingData.setDataObject(paymentMap);

				Boolean status = ingestService.ingestToPipeline(incomingData);
				if (Boolean.TRUE.equals(status)) {
					ingestedCount++;
					Object idObj = paymentMap.get("id");
					if (idObj != null) {
						paymentIds.add(idObj.toString());
					}

					Object amountObj = paymentMap.get("totalAmountPaid");
					if (amountObj instanceof Number) {
						totalAmount = totalAmount.add(BigDecimal.valueOf(((Number) amountObj).doubleValue()));
					} else if (amountObj != null) {
						try {
							totalAmount = totalAmount.add(new BigDecimal(amountObj.toString()));
						} catch (Exception ignored) {
						}
					}
				}
			} catch (Exception e) {
				LOGGER.error("Error ingesting payment during reconciliation: {}", e.getMessage(), e);
			}
		}

		response.setTotalIngested(ingestedCount);
		response.setTotalAmount(totalAmount);
		response.setReconciledPaymentIds(paymentIds);

		if (ingestedCount == paymentsToProcess.size()) {
			response.setStatus("SUCCESS");
			response.setMessage("Successfully reconciled and queued " + ingestedCount + " payments into DSS pipeline.");
		} else {
			response.setStatus("PARTIAL");
			response.setMessage("Partially reconciled " + ingestedCount + " of " + paymentsToProcess.size() + " payments.");
		}

		LOGGER.info("Reconciliation complete. Ingested: {} / {}, Total Amount: {}", ingestedCount, paymentsToProcess.size(), totalAmount);
		return response;
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> fetchPaymentsFromCollectionService(ReconciliationRequest request) {
		List<Map<String, Object>> allPayments = new ArrayList<>();

		// If offset is explicitly passed, fetch only that single page for specified tenant
		if (request.getOffset() != null) {
			int limit = (request.getLimit() != null && request.getLimit() > 0) ? request.getLimit() : 250;
			String singleTenant = (request.getTenantId() != null && !request.getTenantId().trim().isEmpty()) 
					? request.getTenantId().trim() : "pb.testing";
			return fetchPaymentsPage(request, singleTenant, request.getOffset(), limit);
		}

		// Auto-paginate through records (up to maxTotal or until exhausted)
		int pageSize = 200; // collection-services default max page size
		int maxTotal = (request.getLimit() != null && request.getLimit() > 0) ? request.getLimit() : 1000;
		if (maxTotal < pageSize) {
			pageSize = maxTotal;
		}

		List<String> targetTenants = resolveTargetTenants(request);
		LOGGER.info("Resolved target tenants for reconciliation: {}", targetTenants);

		for (String tenant : targetTenants) {
			if (allPayments.size() >= maxTotal) {
				break;
			}
			int currentOffset = 0;
			while (allPayments.size() < maxTotal) {
				int fetchLimit = Math.min(pageSize, maxTotal - allPayments.size());
				List<Map<String, Object>> page = fetchPaymentsPage(request, tenant, currentOffset, fetchLimit);
				if (page == null || page.isEmpty()) {
					break;
				}
				allPayments.addAll(page);
				LOGGER.info("Fetched batch of {} payments for tenant {} (total fetched so far: {})", page.size(), tenant, allPayments.size());
				if (page.size() < fetchLimit) {
					// Last page reached for this tenant
					break;
				}
				currentOffset += page.size();
			}
		}

		return allPayments;
	}

	private List<String> resolveTargetTenants(ReconciliationRequest request) {
		// 1. If explicit list of tenantIds is provided
		if (request.getTenantIds() != null && !request.getTenantIds().isEmpty()) {
			return new ArrayList<>(request.getTenantIds());
		}

		// 2. If single tenantId is provided and it's a specific ULB (contains a dot like "pb.testing")
		if (request.getTenantId() != null && !request.getTenantId().trim().isEmpty() 
				&& request.getTenantId().trim().contains(".")) {
			return Collections.singletonList(request.getTenantId().trim());
		}

		// 3. If tenantId is state-level "pb" or empty/null: fetch all active Punjab ULBs from MDMS
		List<String> mdmsTenants = fetchTenantsFromMDMS();
		if (mdmsTenants != null && !mdmsTenants.isEmpty()) {
			return mdmsTenants;
		}

		// 4. Fallback list of Punjab ULBs if MDMS is unreachable
		return Arrays.asList(
				"pb.testing", "pb.amritsar", "pb.jalandhar", "pb.ludhiana", 
				"pb.bathinda", "pb.mohali", "pb.patiala", "pb.hoshiarpur", 
				"pb.moga", "pb.pathankot", "pb.batala", "pb.abohar"
		);
	}

	@SuppressWarnings("unchecked")
	private List<String> fetchTenantsFromMDMS() {
		try {
			String url = mdmsHost + mdmsSearchEndpoint;
			Map<String, Object> reqBody = new HashMap<>();
			reqBody.put("RequestInfo", Collections.emptyMap());

			Map<String, Object> masterDetail = new HashMap<>();
			masterDetail.put("name", "tenants");

			Map<String, Object> moduleDetail = new HashMap<>();
			moduleDetail.put("moduleName", "tenant");
			moduleDetail.put("masterDetails", Collections.singletonList(masterDetail));

			Map<String, Object> mdmsCriteria = new HashMap<>();
			mdmsCriteria.put("tenantId", "pb");
			mdmsCriteria.put("moduleDetails", Collections.singletonList(moduleDetail));

			reqBody.put("MdmsCriteria", mdmsCriteria);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

			ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
			if (response.getBody() != null && response.getBody().containsKey("MdmsRes")) {
				Map<String, Object> mdmsRes = (Map<String, Object>) response.getBody().get("MdmsRes");
				if (mdmsRes != null && mdmsRes.containsKey("tenant")) {
					Map<String, Object> tenantMod = (Map<String, Object>) mdmsRes.get("tenant");
					if (tenantMod != null && tenantMod.containsKey("tenants")) {
						List<Map<String, Object>> tenantsList = (List<Map<String, Object>>) tenantMod.get("tenants");
						List<String> result = new ArrayList<>();
						for (Map<String, Object> t : tenantsList) {
							Object code = t.get("code");
							if (code != null && code.toString().contains(".")) {
								result.add(code.toString());
							}
						}
						if (!result.isEmpty()) {
							LOGGER.info("Successfully fetched {} ULB tenants from MDMS", result.size());
							return result;
						}
					}
				}
			}
		} catch (Exception e) {
			LOGGER.warn("Could not fetch tenants from MDMS (fallback will be used): {}", e.getMessage());
		}
		return Collections.emptyList();
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> fetchPaymentsPage(ReconciliationRequest request, String tenant, int offset, int limit) {
		StringBuilder urlBuilder = new StringBuilder(collectionServiceHost).append(collectionServiceSearchEndpoint);
		urlBuilder.append("?tenantId=").append(tenant);

		if (request.getFromDate() != null) {
			urlBuilder.append("&fromDate=").append(request.getFromDate());
		}
		if (request.getToDate() != null) {
			urlBuilder.append("&toDate=").append(request.getToDate());
		}
		if (request.getBusinessService() != null && !request.getBusinessService().isEmpty()) {
			urlBuilder.append("&businessService=").append(request.getBusinessService());
		}
		if (request.getBusinessServices() != null && !request.getBusinessServices().isEmpty()) {
			urlBuilder.append("&businessServices=").append(String.join(",", request.getBusinessServices()));
		}
		if (request.getTransactionNumber() != null && !request.getTransactionNumber().isEmpty()) {
			urlBuilder.append("&transactionNumber=").append(request.getTransactionNumber());
		}
		if (request.getPaymentId() != null && !request.getPaymentId().isEmpty()) {
			urlBuilder.append("&ids=").append(request.getPaymentId());
		}
		if (request.getConsumerCode() != null && !request.getConsumerCode().isEmpty()) {
			urlBuilder.append("&consumerCodes=").append(request.getConsumerCode());
		}

		urlBuilder.append("&limit=").append(limit);
		urlBuilder.append("&offset=").append(offset);

		LOGGER.info("Invoking collection-services search URL: {}", urlBuilder);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		Map<String, Object> requestBody = new HashMap<>();
		Map<String, Object> reqInfo = request.getRequestInfo() != null 
				? new HashMap<>(request.getRequestInfo()) 
				: new HashMap<>();

		if (!reqInfo.containsKey("apiId") || reqInfo.get("apiId") == null) {
			reqInfo.put("apiId", "dashboard-ingest-v2-reconciliation");
		}
		if (!reqInfo.containsKey("ver") || reqInfo.get("ver") == null) {
			reqInfo.put("ver", "1.0");
		}
		if (!reqInfo.containsKey("action") || reqInfo.get("action") == null) {
			reqInfo.put("action", "search");
		}
		if (!reqInfo.containsKey("msgId") || reqInfo.get("msgId") == null) {
			reqInfo.put("msgId", "reconciliation-" + System.currentTimeMillis());
		}

		// Ensure userInfo exists and has valid uuid and non-null type (required by PaymentValidator)
		Map<String, Object> userInfo = (Map<String, Object>) reqInfo.get("userInfo");
		if (userInfo == null) {
			userInfo = new HashMap<>();
			userInfo.put("uuid", "dss-reconciliation-system-user");
			userInfo.put("type", "SYSTEM");
			userInfo.put("name", "DSS Reconciliation System");
			userInfo.put("userName", "SYSTEM");
			userInfo.put("roles", Collections.emptyList());
			userInfo.put("tenantId", tenant);
			reqInfo.put("userInfo", userInfo);
		} else {
			if (!userInfo.containsKey("uuid") || userInfo.get("uuid") == null) {
				userInfo.put("uuid", "dss-reconciliation-system-user");
			}
			if (!userInfo.containsKey("type") || userInfo.get("type") == null) {
				userInfo.put("type", "SYSTEM");
			}
		}

		requestBody.put("RequestInfo", reqInfo);

		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

		ResponseEntity<Map> response = restTemplate.postForEntity(urlBuilder.toString(), entity, Map.class);
		if (response.getBody() != null && response.getBody().get("Payments") instanceof List) {
			return (List<Map<String, Object>>) response.getBody().get("Payments");
		}

		return new ArrayList<>();
	}

	private void normalizePaymentPayload(Map<String, Object> paymentMap) {
		// Ensure payer object exists if payerName or payerId are provided at top level
		if (!paymentMap.containsKey("payer") && (paymentMap.containsKey("payerName") || paymentMap.containsKey("payerId"))) {
			Map<String, Object> payer = new HashMap<>();
			payer.put("id", paymentMap.get("payerId"));
			payer.put("name", paymentMap.get("payerName"));
			paymentMap.put("payer", payer);
		}
		// Ensure @timestamp exists
		if (!paymentMap.containsKey("@timestamp")) {
			paymentMap.put("@timestamp", System.currentTimeMillis());
		}
	}
}
