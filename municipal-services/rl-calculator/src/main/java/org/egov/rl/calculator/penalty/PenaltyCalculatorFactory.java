package org.egov.rl.calculator.penalty;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Spring-managed Factory for resolving {@link PenaltyCalculator} strategies dynamically.
 *
 * <p>Spring automatically injects all {@link PenaltyCalculator} beans into this factory.
 * Adding a new strategy requires only creating a new class annotated with {@link Component}
 * implementing {@link PenaltyCalculator} — no code changes in this factory or callers.
 */
@Component
@Slf4j
public class PenaltyCalculatorFactory {

    private final Map<String, PenaltyCalculator> calculatorMap;

    @Autowired
    public PenaltyCalculatorFactory(List<PenaltyCalculator> calculators) {
        this.calculatorMap = calculators.stream()
                .collect(Collectors.toMap(
                        c -> c.getPenaltyType().toUpperCase(),
                        Function.identity()
                ));
        log.info("Registered Penalty Calculators: {}", calculatorMap.keySet());
    }

    /**
     * Resolves the matching {@link PenaltyCalculator} for a given penalty type.
     *
     * @param penaltyType Strategy identifier (e.g. "SIMPLE_INTEREST", "FIXED", "NONE").
     * @return Matching {@link PenaltyCalculator}, or defaults to {@link AnnualSimpleInterestCalculator}.
     */
    public PenaltyCalculator getCalculator(String penaltyType) {
        String key = (penaltyType != null && !penaltyType.trim().isEmpty())
                ? penaltyType.toUpperCase()
                : AnnualSimpleInterestCalculator.PENALTY_TYPE;

        PenaltyCalculator calculator = calculatorMap.get(key);
        if (calculator == null) {
            log.warn("Penalty strategy '{}' not found in registry. Falling back to default SIMPLE_INTEREST.", penaltyType);
            return calculatorMap.get(AnnualSimpleInterestCalculator.PENALTY_TYPE);
        }

        return calculator;
    }
}
