package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import lombok.*;
import org.egov.common.contract.response.ResponseInfo;
import java.util.ArrayList;
import java.util.List;

/**
 * CalculationRes
 */

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalculationRes   {
	
        @JsonProperty("ResponseInfo")
        private ResponseInfo responseInfo;

        @JsonProperty("Calculation")
        @Valid
        private List<Calculation> calculation;


        public CalculationRes addCalculationItem(Calculation calculationItem) {
            if (this.calculation == null) {
            this.calculation = new ArrayList<>();
            }
        this.calculation.add(calculationItem);
        return this;
        }

}

