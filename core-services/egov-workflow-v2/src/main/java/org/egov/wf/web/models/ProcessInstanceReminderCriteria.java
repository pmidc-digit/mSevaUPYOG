package org.egov.wf.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessInstanceReminderCriteria {

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("businessService")
    private String businessService;

    @JsonProperty("businessServices")
    private List<String> businessServices;

    @JsonProperty("lastId")
    private String lastId;

    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("assignee")
    private String assignee;

    @JsonProperty("force")
    private Boolean force;
}
