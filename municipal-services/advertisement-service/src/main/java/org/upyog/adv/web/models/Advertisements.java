package org.upyog.adv.web.models;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.upyog.adv.enums.RentalType;
import org.upyog.adv.enums.ScheduleType;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@ToString
    public class Advertisements {
        private Integer id;
        private String poleNo;
        private String name;
        private String adType;
        private Integer width;
        private Integer height;
        private String imageSrc;
        private String light;
        /**
         * Primary booking amount. Meaning depends on {@code rentalType} + {@code scheduleType}:
         * <ul>
         *   <li>{@code FIXED} — rate per billing period (e.g. ₹3000/month)</li>
         *   <li>{@code DAILY}  — rate per day (e.g. ₹100/day)</li>
         *   <li>{@code null} (legacy) — daily rate unless period‑specific fields are populated</li>
         * </ul>
         */
        private BigDecimal amount;
        /** Legacy: per‑week booking amount. Ignored when {@code rentalType} is set. */
        private BigDecimal weeklyAmount;
        /** Legacy: per‑month booking amount. Ignored when {@code rentalType} is set. */
        private BigDecimal monthlyAmount;
        /** Legacy: per‑year booking amount. Ignored when {@code rentalType} is set. */
        private BigDecimal yearlyAmount;
        /** Legacy: biannual booking amount. Ignored when {@code rentalType} is set. */
        private BigDecimal biannualAmount;
        private Boolean available;
        private String locationCode;
        private String feeType;
        private boolean taxApplicable;
        /**
         * Billing schedule period — the unit by which the ULB charges for this ad.
         * Default: DAILY.
         */
        private ScheduleType scheduleType;
        /**
         * How the rate is applied.
         * {@code FIXED} = full period amount per complete billing period;
         * {@code DAILY}  = period amount ÷ days-in-period × booking days.
         * Default: DAILY (preserves existing behavior when absent from MDMS).
         */
        private RentalType rentalType;
    }
