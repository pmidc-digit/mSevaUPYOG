package org.egov.ndc.web.model.ndc;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import org.egov.ndc.web.model.Workflow;

@Data
@Builder
public class ApplicantRequest {
    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("firstname")
    private String firstname;

    @JsonProperty("lastname")
    private String lastname;

    @JsonProperty("mobile")
    private String mobile;

    @JsonProperty("email")
    private String email;

    @JsonProperty("address")
    private String address;

    @JsonProperty("applicationStatus")
    private String applicationStatus;

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("workFlowCode")
    private Boolean workFlowCode;

    @JsonProperty("status")
    private Boolean status;

    @JsonProperty("action")
    private Boolean action;

    @JsonProperty("createdby")
    private String createdby;

    @JsonProperty("lastmodifiedby")
    private String lastmodifiedby;

    @JsonProperty("createdtime")
    private Long createdtime;

    @JsonProperty("lastmodifiedtime")
    private Long lastmodifiedtime;

    @JsonProperty("workflow")
    private Workflow workflow = null;
}