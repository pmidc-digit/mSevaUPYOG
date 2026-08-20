package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Strategy implementation for a fixed monthly late-payment penalty that accumulates
 * linearly with the number of months overdue.
 *
 * <p>Supports three configurable modes (resolved in priority order):
 * <ol>
 *   <li><b>Flat amount</b> ({@code flatAmount}): a fixed ₹ amount charged per month of lateness.</li>
 *   <li><b>Monthly percentage</b> ({@code monthlyRate}): a percentage of rent per month.
 *       {@code rent × monthlyRate / 100}.</li>
 *   <li><b>Annual percentage</b> ({@code annualRate} or {@code rate}): a percentage of rent per year.
 *       The monthly penalty is {@code rent × annualRate / 1200}.</li>
 * </ol>
 *
 * <p>Business rule:
 * <pre>
 *   penalty = monthlyPenalty × monthsLate
 * </pre>
 *
 * <p>Any partial month counts as a full month (ceil). Even 1 day past due
 * (and beyond grace) already incurs one month's penalty.
 *
 * <p>Example (flatAmount = 150):
 *   Aug demand, due Aug 10, evaluated Aug 11 (1 day late) → 1 month → 150.
 *   Feb demand, due Feb 10, evaluated Aug → 6 months late → 150 × 6 = 900.
 *
 * <p>Rules:
 * <ul>
 *   <li>If {@code paymentDate} is null or not after {@code dueDate}, penalty is 0.</li>
 *   <li>If the number of late days is within the grace period, penalty is 0.</li>
 *   <li>Months late is computed as calendar months rounded UP (minimum 1 once overdue).</li>
 *   <li>Enforces {@code minAmount} floor and {@code maxAmount} ceiling if configured.</li>
 * </ul>
 */
@Component
@Slf4j
public class MonthlyFixedPenaltyCalculator implements PenaltyCalculator {

    public static final String PENALTY_TYPE = "MONTHLY_FIXED";

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

        BigDecimal monthlyPenalty;
        if (config != null && config.getFlatAmount() != null && config.getFlatAmount().compareTo(BigDecimal.ZERO) > 0) {
            // Mode 1: flat ₹ per month
            monthlyPenalty = config.getFlatAmount();
        } else if (config != null && config.getMonthlyRate() != null && config.getMonthlyRate().compareTo(BigDecimal.ZERO) > 0) {
            // Mode 2: monthly percentage of rent
            monthlyPenalty = rentAmount.multiply(config.getMonthlyRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            // Mode 3: annual percentage of rent (annualRate / 12, falls back to rate)
            BigDecimal annualRate = (config != null) ? config.effectiveAnnualRate() : BigDecimal.ZERO;
            if (annualRate.compareTo(BigDecimal.ZERO) <= 0) {
                return BigDecimal.ZERO;
            }
            // monthly penalty = rent × annualRate / 1200  (annual % ÷ 12 months ÷ 100)
            monthlyPenalty = rentAmount.multiply(annualRate)
                    .divide(BigDecimal.valueOf(1200), 2, RoundingMode.HALF_UP);
        }

        // Months late rounded UP: even 1 day past due counts as a full month.
        long monthsLate = ChronoUnit.MONTHS.between(dueDate, paymentDate);
        if (dueDate.plusMonths(monthsLate).isBefore(paymentDate)) {
            monthsLate++;
        }

        BigDecimal penalty = monthlyPenalty.multiply(BigDecimal.valueOf(monthsLate));

        if (config != null) {
            if (config.getMinAmount() != null && penalty.compareTo(config.getMinAmount()) < 0) {
                penalty = config.getMinAmount();
            }
            if (config.getMaxAmount() != null && penalty.compareTo(config.getMaxAmount()) > 0) {
                penalty = config.getMaxAmount();
            }
        }

        return penalty.setScale(2, RoundingMode.HALF_UP);
    }
}
