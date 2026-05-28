package org.upyog.chb.web.models;

import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Details of booking cancellation and policy
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CancellationPolicyDetails   {
        @JsonProperty("id")
        private Integer id = null;

        @JsonProperty("cancelFrom")
        private Integer cancelFrom = null;

        @JsonProperty("cancelTo")
        private Integer cancelTo = null;

        @JsonProperty("percentageDeduction")
        private Integer percentageDeduction = null;


}

