package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class Category {

    @JsonProperty("id")
    private String id;

    @JsonProperty("label")
    private String label;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(id, category.id) && Objects.equals(label, category.label) && Objects.equals(isActive, category.isActive) && Objects.equals(tenantId, category.tenantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, label, isActive, tenantId);
    }
}
