package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Strategy implementation for Annual Simple Interest late payment penalty.
 *
 * <p>Formula:
 * <pre>
 *   lateDays = max(0, DAYS_BETWEEN(dueDate, paymentDate))
 *   penalty  = rentAmount × (annualRate / 100) × (lateDays / 365)
 * </pre>
 *
 * <p>Validation & Rules:
 * <ul>
 *   <li>If {@code paymentDate == null} or {@code paymentDate <= dueDate}, penalty is 0.
 *   <li>If {@code lateDays <= graceDays}, penalty is 0.
 *   <li>If {@code rentAmount <= 0}, throws {@link IllegalArgumentException}.
 *   <li>Enforces {@code minAmount} floor and {@code maxAmount} ceiling if configured.
 *   <li>Rounding policy: {@link RoundingMode#HALF_UP} to 2 decimal places.
 * </ul>
 */
@Component
@Slf4j
public class AnnualSimpleInterestCalculator implements PenaltyCalculator {

    public static final String PENALTY_TYPE = "SIMPLE_INTEREST";

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

        BigDecimal annualRate = (config != null) ? config.effectiveAnnualRate() : BigDecimal.ZERO;
        if (annualRate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Formula: rentAmount * annualRate * totalLateDays / (100 * 365)
        BigDecimal penalty = rentAmount
                .multiply(annualRate)
                .multiply(BigDecimal.valueOf(totalLateDays))
                .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);

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
