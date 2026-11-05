package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Strategy implementation for One-Time Percentage late payment penalty.
 *
 * <p>Formula:
 * <pre>
 *   if isPerDayPenaltyApplied is true:
 *     penalty = rentAmount × (rate / 100) × (lateDays / 365)
 *   else:
 *     penalty = rentAmount × (rate / 100)
 * </pre>
 */
@Component
@Slf4j
public class OneTimePercentageCalculator implements PenaltyCalculator {

    public static final String PENALTY_TYPE = "ONE_TIME_PERCENTAGE";

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

        long totalLateDays = ChronoUnit.DAYS.between(dueDate, paymentDate);
        int graceDays = (config != null) ? config.effectiveGraceDays() : 0;

        if (totalLateDays <= graceDays) {
            return BigDecimal.ZERO;
        }

        BigDecimal rate = (config != null) ? config.effectiveAnnualRate() : BigDecimal.ZERO;
        if (rate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal penalty;
        if (config != null && Boolean.TRUE.equals(config.getIsPerDayPenaltyApplied())) {
            // Pro-rated per day if explicitly requested
            penalty = rentAmount
                    .multiply(rate)
                    .multiply(BigDecimal.valueOf(totalLateDays))
                    .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);
        } else {
            // Flat percentage (default for one-time percentage): rentAmount * rate / 100
            penalty = rentAmount
                    .multiply(rate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        // Apply Min / Max limits
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
