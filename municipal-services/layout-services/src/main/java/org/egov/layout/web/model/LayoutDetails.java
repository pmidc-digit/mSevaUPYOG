package org.egov.layout.web.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;

/**
 * Represents detailed information related to a NOC application.
 */
@ApiModel(description = "Represents detailed information related to a NOC application.")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LayoutDetails {

    @JsonProperty("id")
    @ApiModelProperty(value = "Unique identifier for NOC details")
    private String id;

    @JsonProperty("layoutId")
    @ApiModelProperty(value = "Reference to the NOC application ID")
    private String layoutId;

    @JsonProperty("additionalDetails")
    @ApiModelProperty(value = "Additional details provided for the NOC")
    private Object additionalDetails;

    @JsonProperty("auditDetails")
    @Valid
    @ApiModelProperty(value = "Audit details for tracking creation and modification")
    private AuditDetails auditDetails;

    @JsonProperty("tenantId")
    @ApiModelProperty(value = "Tenant ID associated with the NOC details")
    private String tenantId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLayoutId() {
        return layoutId;
    }

    public void setLayoutId(String layoutId) {
        this.layoutId = layoutId;
    }

    public Object getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(Object additionalDetails) {
        this.additionalDetails = additionalDetails;
    }

    public AuditDetails getAuditDetails() {
        return auditDetails;
    }

    public void setAuditDetails(AuditDetails auditDetails) {
        this.auditDetails = auditDetails;
    }
    public void setTenantId(String tenantId){
        this.tenantId = tenantId;
    }
    public String getTenantId(String tenantId){
       return tenantId;
    }






}



