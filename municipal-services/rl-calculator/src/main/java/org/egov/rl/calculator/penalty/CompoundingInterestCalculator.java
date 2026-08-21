package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Strategy implementation for Compounding Interest late payment penalty.
 *
 * <p>Formula:
 * <pre>
 *   totalLateDays = max(0, DAYS_BETWEEN(dueDate, paymentDate))
 *   months        = totalLateDays / 30.4167
 *   monthlyRate   = annualRate / 1200.0
 *   penalty       = rentAmount × [ (1 + monthlyRate)^months - 1 ]
 * </pre>
 */
@Component
@Slf4j
public class CompoundingInterestCalculator implements PenaltyCalculator {

    public static final String PENALTY_TYPE = "COMPOUNDING";

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

        // Convert annual rate to monthly rate: r_monthly = (annualRate / 100) / 12
        double rMonthly = annualRate.doubleValue() / 1200.0;
        double months = (double) totalLateDays / 30.4167;

        // Compounding formula: rent * ((1 + r_monthly)^months - 1)
        double compoundFactor = Math.pow(1.0 + rMonthly, months) - 1.0;
        double penaltyVal = rentAmount.doubleValue() * compoundFactor;

        BigDecimal penalty = BigDecimal.valueOf(penaltyVal).setScale(2, RoundingMode.HALF_UP);

        // Apply Min / Max caps
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
