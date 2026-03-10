package org.egov.rl.calculator.web.models;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Builder
@Data
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TaxRate {

    @JsonProperty("id")
    private String id;

    @JsonProperty("taxType")
    private String taxType;

    @JsonProperty("type")
    private String type;

    @JsonProperty("amount")
    private double amount;
    
    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("description")
    private String description;

}