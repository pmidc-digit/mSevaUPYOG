package org.egov.hrms.model;

import lombok.*;
import org.egov.common.contract.response.ResponseInfo;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class DailyDigestReport {
    private ResponseInfo responseInfo;
    private int totalEmployeesWithPendingTasks;
    private int totalEmailsDispatched;
    private int totalSkippedWithoutEmail;
    private long executionTimeMillis;
    private String status;
    private String message;
}
