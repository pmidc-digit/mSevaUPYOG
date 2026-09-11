package org.egov.rl.calculator.penalty;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Strategy interface for late-payment penalty calculation.
 */
public interface PenaltyCalculator {

    BigDecimal calculatePenalty(
            BigDecimal rentAmount,
            LocalDate dueDate,
            LocalDate paymentDate,
            PenaltyConfig config
    );

    String getPenaltyType();
}
