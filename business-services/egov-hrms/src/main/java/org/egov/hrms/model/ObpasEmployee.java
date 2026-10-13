package org.egov.hrms.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObpasEmployee {
    private String uuid;

    private String tenantId;
    private String userUUID;
    private String category;
    private String subcategory;
    private String zone;
    private String assignedTenantId;

    @JsonProperty("modulename")
    @JsonAlias({"modulename", "moduleName"})
    private String modulename;
    private String roles;
    private AuditDetails auditDetails;

    public String getModulename() {
        return modulename;
    }

    public void setModulename(String modulename) {
        this.modulename = modulename;
    }

}
