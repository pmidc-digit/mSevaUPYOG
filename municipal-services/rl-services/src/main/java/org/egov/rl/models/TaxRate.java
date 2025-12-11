package org.egov.rl.models;


import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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