package org.egov.ndc.web.model.ndc;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DuesDetails {
    private BigDecimal propertyDues;
    private BigDecimal waterDues;
    private BigDecimal sewerageDues;
}