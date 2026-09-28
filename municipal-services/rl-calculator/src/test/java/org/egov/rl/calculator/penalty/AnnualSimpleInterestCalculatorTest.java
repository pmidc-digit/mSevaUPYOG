package org.egov.rl.calculator.penalty;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class AnnualSimpleInterestCalculatorTest {

    private AnnualSimpleInterestCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new AnnualSimpleInterestCalculator();
    }

    @Test
    @DisplayName("Should return 0 penalty for on-time payment (paymentDate == dueDate)")
    void testOnTimePayment() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 1, 7);

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .penaltyType("SIMPLE_INTEREST")
                .build();

        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, config);
        assertEquals(0, BigDecimal.ZERO.compareTo(penalty));
    }

    @Test
    @DisplayName("Should return 0 penalty when paymentDate is before dueDate")
    void testPaymentBeforeDueDate() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 1, 5);

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .penaltyType("SIMPLE_INTEREST")
                .build();

        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, config);
        assertEquals(0, BigDecimal.ZERO.compareTo(penalty));
    }

    @Test
    @DisplayName("Should calculate correct penalty for 1 day late")
    void testOneDayLate() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 1, 8); // 1 day late

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .penaltyType("SIMPLE_INTEREST")
                .build();

        // Formula: 1000 * 0.19 * (1 / 365) = 0.5205479... -> 0.52
        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, config);
        assertEquals(new BigDecimal("0.52"), penalty);
    }

    @Test
    @DisplayName("Should calculate exact penalty ₹98.90 for ₹1000 rent @ 19% rate over 190 days late")
    void test190DaysLateSpecificationExample() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 7, 16); // 190 days late (Jan 7 to Jul 16)

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .penaltyType("SIMPLE_INTEREST")
                .build();

        // Formula: 1000 * (19 / 100) * (190 / 365) = 98.904109589... -> 98.90
        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, config);
        assertEquals(new BigDecimal("98.90"), penalty);

        BigDecimal totalPayable = rentAmount.add(penalty);
        assertEquals(new BigDecimal("1098.90"), totalPayable);
    }

    @Test
    @DisplayName("Should return 0 when paymentDate is null")
    void testNullPaymentDate() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .build();

        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, null, config);
        assertEquals(0, BigDecimal.ZERO.compareTo(penalty));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when rentAmount <= 0")
    void testInvalidZeroOrNegativeRentAmount() {
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 7, 15);
        PenaltyConfig config = PenaltyConfig.builder().annualRate(new BigDecimal("19")).build();

        assertThrows(IllegalArgumentException.class, () ->
                calculator.calculatePenalty(BigDecimal.ZERO, dueDate, paymentDate, config));

        assertThrows(IllegalArgumentException.class, () ->
                calculator.calculatePenalty(new BigDecimal("-500"), dueDate, paymentDate, config));
    }

    @Test
    @DisplayName("Should respect grace period days")
    void testGracePeriod() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 1, 10); // 3 days late

        PenaltyConfig configWithGrace = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .graceDays(5) // 5 grace days -> 3 days late falls within grace
                .build();

        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, configWithGrace);
        assertEquals(0, BigDecimal.ZERO.compareTo(penalty));
    }

    @Test
    @DisplayName("Should enforce minimum and maximum penalty caps")
    void testMinAndMaxPenaltyCaps() {
        BigDecimal rentAmount = new BigDecimal("1000");
        LocalDate dueDate = LocalDate.of(2026, 1, 7);
        LocalDate paymentDate = LocalDate.of(2026, 7, 15); // Normal penalty = 98.90

        PenaltyConfig configWithMinCap = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .minAmount(new BigDecimal("150.00")) // Cap minimum at 150
                .build();

        BigDecimal penaltyMin = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, configWithMinCap);
        assertEquals(new BigDecimal("150.00"), penaltyMin);

        PenaltyConfig configWithMaxCap = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .maxAmount(new BigDecimal("50.00")) // Cap maximum at 50
                .build();

        BigDecimal penaltyMax = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, configWithMaxCap);
        assertEquals(new BigDecimal("50.00"), penaltyMax);
    }
}
