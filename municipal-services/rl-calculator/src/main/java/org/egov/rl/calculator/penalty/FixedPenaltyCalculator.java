package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Strategy implementation for One-Time Fixed Late Payment Penalty.
 *
 * <p>Applies a single flat amount when payment is late past the due date (and grace period).
 */
@Component
@Slf4j
public class FixedPenaltyCalculator implements PenaltyCalculator {

    public static final String PENALTY_TYPE = "FIXED";

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
        if (rentAmount == null || rentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Rent amount must be greater than zero for penalty calculation.");
        }

        if (paymentDate == null || dueDate == null || !paymentDate.isAfter(dueDate)) {
            return BigDecimal.ZERO;
        }

        long lateDays = ChronoUnit.DAYS.between(dueDate, paymentDate);
        int graceDays = (config != null) ? config.effectiveGraceDays() : 0;

        if (lateDays <= graceDays) {
            return BigDecimal.ZERO;
        }

        BigDecimal penalty = (config != null && config.getFlatAmount() != null)
                ? config.getFlatAmount()
                : BigDecimal.ZERO;

        if (config != null) {
            if (config.getMinAmount() != null && penalty.compareTo(config.getMinAmount()) < 0) {
                penalty = config.getMinAmount();
            }
            if (config.getMaxAmount() != null && penalty.compareTo(config.getMaxAmount()) > 0) {
                penalty = config.getMaxAmount();
            }
        }

        return penalty;
    }
}
