package org.egov.wf.web.models;


import java.util.List;

import javax.validation.constraints.NotNull;

import org.egov.common.contract.request.RequestInfo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessServiceSearchCriteria {

	 @JsonProperty("RequestInfo")
	    private RequestInfo requestInfo;

    @NotNull
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("businessServices")
    private List<String> businessServices;

    @JsonIgnore
    private List<String> stateUuids;

    @JsonIgnore
    private List<String> actionUuids;


    public BusinessServiceSearchCriteria(BusinessServiceSearchCriteria criteria) {
        this.tenantId = criteria.getTenantId();
        this.businessServices = criteria.getBusinessServices();
        this.stateUuids = criteria.getStateUuids();
        this.actionUuids = criteria.getActionUuids();
        this.requestInfo = criteria.getRequestInfo();
    }
}
