package org.egov.ndc.web.model.ndc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NdcApplicationSearchCriteria {
    private List<String> uuid;
    private String tenantId;
    private String status;
    private String mobileNumber;
    private String name;
    private Boolean active;

}