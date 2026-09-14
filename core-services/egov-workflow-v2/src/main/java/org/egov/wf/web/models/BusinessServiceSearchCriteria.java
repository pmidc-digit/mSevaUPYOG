package org.egov.wf.web.models;


import java.util.List;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BusinessServiceSearchCriteria {


    @NotNull
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("businessServices")
    private List<String> businessServices;

    @JsonIgnore
    private List<String> stateUuids;

    @JsonIgnore
    private List<String> actionUuids;

    /**
     * Pagination for the indexer's legacy-index backfill. The indexer pages by
     * incrementing offset until it receives an empty page, so these MUST be
     * honoured by the plain-search query.
     */
    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("limit")
    private Integer limit;

    /**
     * Kept with the original 4-arg signature (rather than Lombok's
     * {@code @AllArgsConstructor}) so existing callers and tests remain
     * source-compatible.
     */
    public BusinessServiceSearchCriteria(String tenantId, List<String> businessServices,
                                         List<String> stateUuids, List<String> actionUuids) {
        this.tenantId = tenantId;
        this.businessServices = businessServices;
        this.stateUuids = stateUuids;
        this.actionUuids = actionUuids;
    }


    public BusinessServiceSearchCriteria(BusinessServiceSearchCriteria criteria) {
        this.tenantId = criteria.getTenantId();
        this.businessServices = criteria.getBusinessServices();
        this.stateUuids = criteria.getStateUuids();
        this.actionUuids = criteria.getActionUuids();
    }
}
