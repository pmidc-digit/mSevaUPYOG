package org.egov.rl.services.models;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

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
