package org.egov.rl.calculator.penalty;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Strategy implementation for No Penalty / Penalty Waiver.
 */
@Component
public class NoPenaltyCalculator implements PenaltyCalculator {

    public static final String PENALTY_TYPE = "NONE";

    @Override
    public String getPenaltyType() {
        return PENALTY_TYPE;
    }

    @Override
    public BigDecimal calculatePenalty(
            BigDecimal rentAmount,
            LocalDate dueDate,
            LocalDate paymentDate,
            PenaltyConfig config
    ) {
        return BigDecimal.ZERO;
    }
}
