package org.egov.custom.mapper.billing.impl;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeterReading {
	
    @JsonProperty("connectionno")
    private String connectionno;
	 
    @JsonProperty("lastReading")
    private BigDecimal lastReading;

    @JsonProperty("lastReadingDate")
    private Long lastReadingDate;

    @JsonProperty("currentReading")
    private BigDecimal currentReading;

    @JsonProperty("currentReadingDate")
    private Long currentReadingDate;

    @JsonProperty("consumption")
    private BigDecimal consumption;

    @JsonProperty("meterStatus")
    private String meterStatus;

    @JsonProperty("billingPeriod")
    private String billingPeriod;

}
