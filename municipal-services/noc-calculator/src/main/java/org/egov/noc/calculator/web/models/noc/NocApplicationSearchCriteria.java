package org.egov.noc.calculator.web.models.noc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NocApplicationSearchCriteria {
    private String uuid;
    private String tenantId;
    private String status;
    private String mobileNumber;
    private String name;
    private Boolean active;

}