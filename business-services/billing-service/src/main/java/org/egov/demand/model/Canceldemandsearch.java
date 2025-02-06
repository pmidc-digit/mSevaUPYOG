package org.egov.demand.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Canceldemandsearch {

    @JsonProperty("demandid")
    private String demandid;

    @JsonProperty("consumercode")
    private String consumercode;

    @JsonProperty("businessservice")
    private String businessservice;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("taxPeriodFrom")
    private String taxPeriodFrom;

    @JsonProperty("taxPeriodTo")
    private String taxPeriodTo;

   
    public String getDemandid() {
        return demandid;
    }

    public void setDemandid(String demandid) {
        this.demandid = demandid;
    }

    
    public String getConsumercode() {
        return consumercode;
    }

    public void setConsumercode(String consumercode) {
        this.consumercode = consumercode;
    }

    
    public String getBusinessservice() {
        return businessservice;
    }

    public void setBusinessservice(String businessservice) {
        this.businessservice = businessservice;
    }

    
    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    
    public String getTaxPeriodFrom() {
        return taxPeriodFrom;
    }

    public void setTaxPeriodFrom(String taxPeriodFrom) {
        this.taxPeriodFrom = taxPeriodFrom;
    }

    
    public String getTaxPeriodTo() {
        return taxPeriodTo;
    }

    public void setTaxPeriodTo(String taxPeriodTo) {
        this.taxPeriodTo = taxPeriodTo;
    }
}
