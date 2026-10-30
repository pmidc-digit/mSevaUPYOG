package org.egov.wscalculation.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantDemandSummary {
    private String tenantId;
    private String cityName;
    private String billingCycle;
    private Long taxPeriodFrom;
    private Long taxPeriodTo;
    private int connectionCount;
    private String status;
}
