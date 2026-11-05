package org.egov.swcalculation.web.models;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocalityBillSummary {
    private String localityOrGroup;
    private String tenantId;
    private String cityName;
    private int totalCount;
    private int successCount;
    private int failureCount;
    private BigDecimal totalAmount;
    private String status;
}
