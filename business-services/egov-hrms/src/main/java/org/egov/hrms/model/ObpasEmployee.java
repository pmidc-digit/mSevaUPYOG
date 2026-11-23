package org.egov.hrms.model;

import java.util.Objects;

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

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ObpasEmployee other = (ObpasEmployee) obj;
		return Objects.equals(assignedTenantId, other.assignedTenantId) && Objects.equals(category, other.category)
				&& Objects.equals(modulename, other.modulename) && Objects.equals(roles, other.roles)
				&& Objects.equals(subcategory, other.subcategory) && Objects.equals(tenantId, other.tenantId)
				&& Objects.equals(zone, other.zone);
	}

	@Override
	public int hashCode() {
		return Objects.hash(assignedTenantId, category, modulename, roles, subcategory, tenantId, zone);
	}

}
