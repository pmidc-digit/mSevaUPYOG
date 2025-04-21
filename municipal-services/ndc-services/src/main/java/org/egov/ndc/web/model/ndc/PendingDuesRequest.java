package org.egov.ndc.web.model.ndc;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
@Builder
public class PendingDuesRequest {
    private String propertyId;
    private String mobileNumber;
    private String fullName;
    @NotBlank
    private String tenantId;
}
