package org.egov.search.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import org.egov.custom.mapper.billing.impl.Bill;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Connection {
    // Service-specific lists
    private List<Bill> waterDetails;
    private List<Bill> sewerageDetails;

    // Aggregated Totals
    private BigDecimal totalWaterAmount;
    private BigDecimal totalSewerageAmount;
    private BigDecimal propertyTotalAmount;
}