package org.egov.wf.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.request.RequestInfo;

import javax.validation.Valid;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowReminderRequest {

    @Valid
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("businessService")
    private String businessService;

    @JsonProperty("businessServices")
    private List<String> businessServices;

    @JsonProperty("async")
    private Boolean async;

    @JsonProperty("maxPerUser")
    private Integer maxPerUser;

    @JsonProperty("assignee")
    private String assignee;

    @JsonProperty("force")
    private Boolean force;
}
