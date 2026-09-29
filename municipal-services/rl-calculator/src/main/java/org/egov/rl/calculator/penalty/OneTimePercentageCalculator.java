package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Strategy implementation for a ONE-TIME percentage penalty.
 *
 * <p>A single percentage of the principal is charged once the demand is past its due date and then never
 * changes - being 1 day or 300 days late makes no difference, the amount is frozen.
 *
 * <pre>
 *   penalty = principal × rate / 100
 * </pre>
 *
 * <p>This is the simplest possible late-payment rule and the one most ULBs describe as "25% once the due date
 * passes". It replaces the need for a per-ULB {@code flatAmount}: the percentage applies to whatever the demand's
 * own principal is, so a ₹50,000 arrear and a ₹2,00,000 arrear are each charged their own 25%.
 *
 * <p>Rules:
 * <ul>
 *   <li>Returns 0 while {@code paymentDate} is on or before {@code dueDate} - the due day itself is not late.</li>
 *   <li>Returns 0 while the lateness is within {@code applicableAfterDays} / {@code graceDays}.</li>
 *   <li>The rate is taken from {@code rate}, falling back to {@code annualRate}; 0 or absent means no penalty.
 *       The name of the strategy is the only thing that makes the percentage "one time" - no day or month
 *       factor is ever applied.</li>
 *   <li>Honours {@code minAmount} and {@code maxAmount} when configured.</li>
 * </ul>
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
            BigDecimal principalAmount,
            LocalDate dueDate,
            LocalDate paymentDate,
            PenaltyConfig config
    ) {
        if (principalAmount == null || principalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (paymentDate == null || dueDate == null || !paymentDate.isAfter(dueDate)) {
            return BigDecimal.ZERO;
        }

        long lateDays = ChronoUnit.DAYS.between(dueDate, paymentDate);
        int graceDays = (config != null) ? config.effectiveGraceDays() : 0;
        if (lateDays <= graceDays) {
            return BigDecimal.ZERO;
        }

        // `rate` is the natural home for a one-time percentage; annualRate is accepted as a fallback so a tenant
        // can reuse the same number it configures for the annual strategies without duplicating it.
        BigDecimal percentage = (config != null && config.getRate() != null
                && config.getRate().compareTo(BigDecimal.ZERO) > 0)
                ? config.getRate()
                : ((config != null) ? config.effectiveAnnualRate() : BigDecimal.ZERO);

        if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("{} strategy selected but no percentage (rate/annualRate) is configured - no penalty charged.",
                    PENALTY_TYPE);
            return BigDecimal.ZERO;
        }

        // Deliberately no day/month factor: one time, one amount.
        BigDecimal penalty = principalAmount.multiply(percentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        if (config != null) {
            if (config.getMinAmount() != null && penalty.compareTo(config.getMinAmount()) < 0) {
                penalty = config.getMinAmount();
            }
            if (config.getMaxAmount() != null && penalty.compareTo(config.getMaxAmount()) > 0) {
                penalty = config.getMaxAmount();
            }
        }

        log.debug("One time penalty {} = {} × {}% (due {}, evaluated {}, {} late day(s))",
                penalty, principalAmount, percentage, dueDate, paymentDate, lateDays);
        return penalty;
    }
}
