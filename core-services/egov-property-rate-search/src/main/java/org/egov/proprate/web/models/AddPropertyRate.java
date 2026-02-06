package org.egov.proprate.web.models;

import java.math.BigDecimal;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddPropertyRate {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("propertyId")
    private String propertyId;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("districtId")
    private String districtId;

    @JsonProperty("tehsilId")
    private String tehsilId;

    @JsonProperty("villageId")
    private String villageId;

    @JsonProperty("isUrban")
    private Boolean isUrban;

    @JsonProperty("segmentId")
    private String segmentId;

    @JsonProperty("categoryId")
    private String categoryId;

    @JsonProperty("locality")
    private String locality;

    @JsonProperty("isVerified")
    private Boolean isVerified;

    @JsonProperty("unit")
    private String unit;

    // --- ADDED AUDIT FIELDS ---
    @JsonProperty("createdBy")
    private String createdBy;

    @JsonProperty("lastModifiedBy")
    private String lastModifiedBy;

    @JsonProperty("createdTime")
    private Long createdTime;

    @JsonProperty("lastModifiedTime")
    private Long lastModifiedTime;
}