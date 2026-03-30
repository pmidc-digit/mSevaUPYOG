package org.egov.tlcalculator.web.models;

import lombok.Data;

import jakarta.validation.constraints.NotNull;

@Data
public class CalculationSearchCriteria {

    @NotNull
    private String tenantId;

    private String aplicationNumber;

}
