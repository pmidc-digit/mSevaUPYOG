package org.egov.wscalculation.web.models;

import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.NotNull;

import org.apache.coyote.RequestInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter

public class CancelList {


	
	
	
	
	@JsonProperty("consumercode")
	private String consumerCode;
    
	
	@JsonProperty("businessservice")
	private String businessService;

	public String getBusinessService() {
		
		return businessService;
	}

	public String getConsumerCode() {
		
		return consumerCode;
	}
	
	@NotNull
	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("demandid")
	private String demandid;

	public String gettenantId() {
		
		return tenantId;
	}

	public String getdemandid() {
		
		return demandid;
	}
	
	// New fields added for taxPeriodFrom and taxPeriodTo
    @JsonProperty("taxPeriodFrom")
    private Long taxPeriodFrom;

    @JsonProperty("taxPeriodTo")
    private Long taxPeriodTo;

    // Getter and Setter methods for taxPeriodFrom and taxPeriodTo
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


