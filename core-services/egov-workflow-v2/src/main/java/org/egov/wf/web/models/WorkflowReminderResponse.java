package org.egov.wf.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowReminderResponse {

    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("status")
    private String status;

    @JsonProperty("message")
    private String message;

    @JsonProperty("totalProcessed")
    private Integer totalProcessed;

    @JsonProperty("totalApplications")
    private Integer totalApplications;

    @JsonProperty("totalUnderSla")
    private Integer totalUnderSla;

    @JsonProperty("totalCompletingSla")
    private Integer totalCompletingSla;

    @JsonProperty("totalOverSla")
    private Integer totalOverSla;
}
