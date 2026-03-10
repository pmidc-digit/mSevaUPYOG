package org.egov.rl.calculator.web.models;

import lombok.Data;

@Data
public class ReceiptSearchCriteria {

    private String tenantId;

    private String propertyId;

    private Long fromDate;

    private Long toDate;

}
