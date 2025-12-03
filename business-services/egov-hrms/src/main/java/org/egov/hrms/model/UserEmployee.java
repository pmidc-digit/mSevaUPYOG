
package org.egov.hrms.model;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.validator.constraints.SafeHtml;
import org.springframework.validation.annotation.Validated;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Validated
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
@ToString
@Builder
public class UserEmployee {

    @NotNull
    @JsonProperty("id")
    private Long id;

    /** New field (replaces earlier 'ward') */
    @SafeHtml
    @Size(min = 1, max = 256)
    @JsonProperty("category")
    private String category;

    /** New field */
    @SafeHtml
    @Size(min = 1, max = 256)
    @JsonProperty("subcategory")
    private String subcategory;

    /** Kept as requested */
    @SafeHtml
    @Size(min = 1, max = 256)
    @JsonProperty("zone")
    private String zone;

    @SafeHtml
    @NotNull
    @Size(min = 1, max = 250)
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
}
