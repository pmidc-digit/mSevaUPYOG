package org.egov.rl.calculator.penalty;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class CompoundingInterestCalculatorTest {

    private CompoundingInterestCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new CompoundingInterestCalculator();
    }

    @Test
    @DisplayName("Should return 0 penalty for on-time payment")
    void testOnTimePayment() {
        BigDecimal rentAmount = new BigDecimal("2004");
        LocalDate dueDate = LocalDate.of(2026, 2, 15);
        LocalDate paymentDate = LocalDate.of(2026, 2, 15);

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .penaltyType("COMPOUNDING")
                .minAmount(BigDecimal.ZERO)
                .build();

        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, config);
        assertEquals(0, BigDecimal.ZERO.compareTo(penalty));
    }

    @Test
    @DisplayName("Should calculate compounding penalty with minAmount = 0")
    void testCompoundingPenaltyMinCapZero() {
        BigDecimal rentAmount = new BigDecimal("2004");
        LocalDate dueDate = LocalDate.of(2026, 2, 15);
        LocalDate paymentDate = LocalDate.of(2026, 8, 7); // ~173 days late (5.687 months)

        PenaltyConfig config = PenaltyConfig.builder()
                .annualRate(new BigDecimal("19"))
                .penaltyType("COMPOUNDING")
                .minAmount(BigDecimal.ZERO)
                .build();

        BigDecimal penalty = calculator.calculatePenalty(rentAmount, dueDate, paymentDate, config);
        assertNotNull(penalty);
        assertTrue(penalty.compareTo(BigDecimal.ZERO) > 0);
        // Verified compounding value for 173 days late @ 19% annual rate: 187.30
        assertEquals(new BigDecimal("187.30"), penalty);
    }
}
