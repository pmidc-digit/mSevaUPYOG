package org.egov.hrms.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

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
    
    @JsonProperty("roles")
    private List<String> roles;
    
    private AuditDetails auditDetails; // add this field

    public String getModulename() {
        return modulename;
    }

    public void setModulename(String modulename) {
        this.modulename = modulename;
    }

}