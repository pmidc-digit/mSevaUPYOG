package org.egov.rl.services.models.demand;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.Builder.Default;

import org.egov.rl.services.models.AllotmentRequest;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * CalulationCriteria
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class CalculationCriteria   {

        @JsonProperty("AllotmentRequest")
        private AllotmentRequest allotmentRequest;

        @JsonProperty("applicationNumber")
        private String applicationNumber;

        @JsonProperty("oldApplicationNumber")
        private String oldApplicationNumber;
        
        @JsonProperty("isSecurityDeposite")
        @Default
        private boolean isSecurityDeposite=false;   
        
        @JsonProperty("isSatelment")
        @Default
        private boolean isSatelment=false;
        
        @JsonProperty("tenantId")
        private String tenantId;

        @JsonProperty("fromDate")
        private Long fromDate;

        @JsonProperty("toDate")
        private Long toDate;
        
        @JsonProperty("financialYear")
        private String financialYear;
}

