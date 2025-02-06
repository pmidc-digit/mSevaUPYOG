package org.egov.demand.model;

import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.NotNull;

import org.egov.common.contract.request.RequestInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CancelDemand {
    
    @JsonProperty("RequestInfo")
    @NotNull
    private RequestInfo requestInfo;

    @JsonProperty("CancelList") 
    private List<CancelList> cancelList = new ArrayList<>();

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("taxPeriodFrom")
    private Long taxPeriodFrom;

    @JsonProperty("taxPeriodTo")
    private Long taxPeriodTo;

  
    public List<CancelList> getCancelList() {
        return cancelList;
    }

    
    public void setCancelList(List<CancelList> cancelList) {
        this.cancelList = cancelList;
    }

   
    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Long getTaxPeriodFrom() {
        return taxPeriodFrom;
    }

    public void setTaxPeriodFrom(Long taxPeriodFrom) {
        this.taxPeriodFrom = taxPeriodFrom;
    }

    public Long getTaxPeriodTo() {
        return taxPeriodTo;
    }

    public void setTaxPeriodTo(Long taxPeriodTo) {
        this.taxPeriodTo = taxPeriodTo;
    }
}
