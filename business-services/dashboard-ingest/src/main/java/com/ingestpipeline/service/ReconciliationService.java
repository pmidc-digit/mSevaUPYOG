package com.ingestpipeline.service;

import com.ingestpipeline.model.ReconciliationRequest;
import com.ingestpipeline.model.ReconciliationResponse;

/**
 * Service interface for reconciling collection payments from collection-services into DSS Elasticsearch.
 */
public interface ReconciliationService {

	/**
	 * Reconciles payments by querying collection-services search API (or provided payment payloads)
	 * and pushing them into the ingestion pipeline.
	 *
	 * @param request reconciliation criteria (tenantId, fromDate, toDate, etc.)
	 * @return ReconciliationResponse containing status and counts
	 */
	ReconciliationResponse reconcile(ReconciliationRequest request);

}
