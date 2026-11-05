package org.egov.hrms.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class PendingTaskSummary {
    private String businessService;
    private String status;
    private int pendingCount;
    private int overdueCount;
    private int dueSoonCount;
    private int withinSlaCount;
}
