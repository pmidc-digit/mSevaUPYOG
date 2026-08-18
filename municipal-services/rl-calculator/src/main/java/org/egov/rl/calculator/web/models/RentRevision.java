package org.egov.rl.calculator.web.models;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.rl.calculator.web.models.property.AuditDetails;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RentRevision {
    @JsonProperty("id")
    private String id;

    @JsonProperty("allotmentId")
    private String allotmentId;

    @JsonProperty("revisedRent")
    private BigDecimal revisedRent;

    @JsonProperty("revisionDate")
    private Long revisionDate;

    @JsonProperty("nextRevisionDate")
    private Long nextRevisionDate;

    @JsonProperty("incrementPercentage")
    private BigDecimal incrementPercentage;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
}
