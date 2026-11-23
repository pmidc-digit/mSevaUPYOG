package org.egov.pg.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pg.config.AppProperties;
import org.egov.pg.models.Bill;
import org.egov.pg.models.BillResponse;
import org.egov.pg.web.models.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;

@Repository
@Slf4j
public class BillingRepository {

    private final RestTemplate restTemplate;
    private final AppProperties appProperties;

    @Autowired
    public BillingRepository(RestTemplate restTemplate, AppProperties appProperties) {
        this.restTemplate = restTemplate;
        this.appProperties = appProperties;
    }

    /**
     * Calls billing-service _reconcile API to reconcile bills for a failed transaction that succeeded at the gateway.
     * The billing-service handles expiring conflicting active bills and activating / extending the target bill.
     *
     * @param requestInfo RequestInfo
     * @param tenantId Tenant ID
     * @param consumerCode Consumer Code
     * @param businessService Business Service / Module
     * @param billId Target Bill ID to activate/extend
     * @return List of reconciled Bill objects
     */
    public List<Bill> reconcileBill(RequestInfo requestInfo, String tenantId, String consumerCode,
                                   String businessService, String billId) {
        try {
            MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
            queryParams.add("tenantId", tenantId);
            queryParams.add("consumerCode", consumerCode);
            if (businessService != null && !businessService.isEmpty()) {
                queryParams.add("businessService", businessService);
            }
            queryParams.add("billId", billId);

            String uri = UriComponentsBuilder
                    .fromHttpUrl(appProperties.getBillingServiceHost())
                    .path(appProperties.getBillingServiceReconcilePath())
                    .queryParams(queryParams)
                    .build()
                    .toUriString();

            log.info("Calling billing-service reconcileBill API: {}", uri);
            RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper(requestInfo);
            BillResponse response = restTemplate.postForObject(uri, requestInfoWrapper, BillResponse.class);

            if (response != null && response.getBill() != null) {
                log.info("reconcileBill returned {} bills for consumerCode: {}, billId: {}",
                        response.getBill().size(), consumerCode, billId);
                return response.getBill();
            }
        } catch (Exception e) {
            log.error("Failed to reconcile bill via billing service for tenantId: {}, consumerCode: {}, businessService: {}, billId: {}",
                    tenantId, consumerCode, businessService, billId, e);
        }
        return Collections.emptyList();
    }

    /**
     * Calls billing-service _fetchbill API to find the current active bill for the given criteria.
     *
     * @param requestInfo RequestInfo
     * @param tenantId Tenant ID
     * @param consumerCode Consumer Code
     * @param businessService Business Service / Module
     * @return List of active Bill objects
     */
    public List<Bill> fetchBill(RequestInfo requestInfo, String tenantId, String consumerCode, String businessService) {
        try {
            MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
            queryParams.add("tenantId", tenantId);
            queryParams.add("consumerCode", consumerCode);
            if (businessService != null && !businessService.isEmpty()) {
                queryParams.add("businessService", businessService);
            }

            String uri = UriComponentsBuilder
                    .fromHttpUrl(appProperties.getBillingServiceHost())
                    .path(appProperties.getBillingServiceFetchBillPath())
                    .queryParams(queryParams)
                    .build()
                    .toUriString();

            log.info("Calling fetchBill API: {}", uri);
            RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper(requestInfo);
            BillResponse response = restTemplate.postForObject(uri, requestInfoWrapper, BillResponse.class);

            if (response != null && response.getBill() != null) {
                log.info("fetchBill returned {} bills for consumerCode: {}", response.getBill().size(), consumerCode);
                return response.getBill();
            }
        } catch (Exception e) {
            log.error("Failed to fetch bill from billing service for tenantId: {}, consumerCode: {}, businessService: {}",
                    tenantId, consumerCode, businessService, e);
        }
        return Collections.emptyList();
    }
}
