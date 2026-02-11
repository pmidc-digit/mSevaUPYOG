package org.egov.search.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyBasedBill {
    // Property Metadata
    private String propertyId;
    private String tenantId;
    private String ledgerNo;
    private String plotSize;
    private String usageType;
    private String ownerName;
    private String guardianName;
    private String mobileNo;
    private String locality;
    private String address;

    // The Aggregated Connection Object
    private Connection connection;
}