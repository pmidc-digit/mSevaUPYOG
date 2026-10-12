package com.ingestpipeline.service;

import java.math.BigDecimal;
import java.util.ArrayList;
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
		StringBuilder urlBuilder = new StringBuilder(collectionServiceHost).append(collectionServiceSearchEndpoint);
		urlBuilder.append("?tenantId=").append(request.getTenantId() != null ? request.getTenantId() : "pb");

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

		int limit = (request.getLimit() != null && request.getLimit() > 0) ? request.getLimit() : 250;
		urlBuilder.append("&limit=").append(limit);

		if (request.getOffset() != null) {
			urlBuilder.append("&offset=").append(request.getOffset());
		}

		LOGGER.info("Invoking collection-services search URL: {}", urlBuilder);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		Map<String, Object> requestBody = new HashMap<>();
		Map<String, Object> requestInfo = new HashMap<>();
		requestInfo.put("apiId", "dashboard-ingest-v2-reconciliation");
		requestInfo.put("ver", "1.0");
		requestInfo.put("action", "search");
		requestInfo.put("msgId", "reconciliation-" + System.currentTimeMillis());
		requestBody.put("RequestInfo", requestInfo);

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
