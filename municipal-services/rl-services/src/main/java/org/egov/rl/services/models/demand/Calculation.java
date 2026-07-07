package org.egov.rl.services.models.demand;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

import java.math.BigDecimal;

/**
 * Calculation
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonPropertyOrder({"tenantId","totalAmount","taxAmount","penalty"})
public class Calculation   {
	
        @JsonProperty("serviceNumber")
        private String serviceNumber;

        @JsonProperty("fromDate")
        private Long fromDate;

        @JsonProperty("toDate")
        private Long toDate;

        @JsonProperty("tenantId")
        private String tenantId;
        
        @JsonProperty("totalAmount")
        private BigDecimal totalAmount;
        
        @JsonProperty("taxAmount")
        private BigDecimal taxAmount; 

        @JsonProperty("penalty")
        private BigDecimal penalty;
        
        @JsonProperty("cowCass")
        private BigDecimal cowCass;

   }

