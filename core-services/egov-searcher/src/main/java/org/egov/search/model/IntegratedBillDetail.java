package org.egov.search.model;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegratedBillDetail {
    private Long fromPeriod;
    private Long toPeriod;
    
    @Builder.Default
    private BigDecimal charge = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal arrears = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal penalty = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal interest = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal advance = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;
}