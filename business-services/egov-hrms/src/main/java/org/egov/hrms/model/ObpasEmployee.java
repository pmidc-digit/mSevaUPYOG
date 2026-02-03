package org.egov.hrms.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

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
    
    private AuditDetails auditDetails; // add this field

}