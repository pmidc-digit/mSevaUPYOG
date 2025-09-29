package org.egov.ptr.util;

import org.egov.ptr.models.AdditionalFeeRate;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Utility class for calculating additional fees with comprehensive business rules
 * Handles ServiceCharge, PenaltyFee, and InterestAmount calculations
 */
@Slf4j
@Component
public class FeeCalculationUtil {

    /**
     * Calculates individual fee amount based on business rules
     * 
     * @param feeConfig Fee configuration from MDMS
     * @param baseAmount Base amount for rate calculation
     * @param daysElapsed Days elapsed since application (for penalty/interest)
     * @param currentFY Current financial year
     * @return Calculated fee amount after applying all constraints
     */
    public BigDecimal calculateFeeAmount(AdditionalFeeRate feeConfig, BigDecimal baseAmount, 
                                       int daysElapsed, String currentFY) {
        
        // Step 1: Validate business rules
        if (!isFeeApplicable(feeConfig, daysElapsed, currentFY)) {
            log.info("Fee {} not applicable - Active: {}, FromFY: {}, DaysElapsed: {}, ApplicableAfterDays: {}", 
                    feeConfig.getFeeType(), feeConfig.getActive(), feeConfig.getFromFY(), 
                    daysElapsed, feeConfig.getApplicableAfterDays());
            return BigDecimal.ZERO;
        }

        // Step 2: Determine base amount (flatAmount vs rate calculation)
        BigDecimal calculatedAmount = determineBaseAmount(feeConfig, baseAmount);
        
        // Step 3: Apply min/max constraints
        BigDecimal finalAmount = applyMinMaxConstraints(calculatedAmount, feeConfig);
        
        return finalAmount;
    }

    /**
     * Validates if fee is applicable based on business rules
     * This method is flexible and handles various MDMS configuration changes
     */
    private boolean isFeeApplicable(AdditionalFeeRate feeConfig, int daysElapsed, String currentFY) {
        // Check if fee is active (flexible handling of boolean/string values)
        if (!isActive(feeConfig)) {
            return false;
        }
        
        // Check financial year (flexible matching)
        if (!isFinancialYearApplicable(feeConfig, currentFY)) {
            return false;
        }
        
        // Check applicable after days (flexible parsing)
        if (!isDaysElapsedApplicable(feeConfig, daysElapsed)) {
            return false;
        }
        
        return true;
    }

    /**
     * Flexible active check - handles both boolean and string values
     */
    private boolean isActive(AdditionalFeeRate feeConfig) {
        if (feeConfig.getActive() == null) {
            return false;
        }
        
        String activeValue = feeConfig.getActive().toString().toLowerCase();
        return "true".equals(activeValue) || "1".equals(activeValue) || "yes".equals(activeValue);
    }

    /**
     * Flexible financial year check - handles various formats
     */
    private boolean isFinancialYearApplicable(AdditionalFeeRate feeConfig, String currentFY) {
        if (feeConfig.getFromFY() == null || feeConfig.getFromFY().trim().isEmpty()) {
            return true; // No FY restriction
        }
        
        String configFY = feeConfig.getFromFY().trim();
        String normalizedCurrentFY = currentFY.trim();
        
        // Direct match
        if (configFY.equals(normalizedCurrentFY)) {
            return true;
        }
        
        // Flexible matching for different formats
        // Handle cases like "2025-26" vs "2025-2026" vs "2025-26" vs "2025-26"
        return normalizeFinancialYear(configFY).equals(normalizeFinancialYear(normalizedCurrentFY));
    }

    /**
     * Normalizes financial year format for comparison
     */
    private String normalizeFinancialYear(String fy) {
        if (fy == null) return "";
        
        // Remove any extra spaces and convert to lowercase
        fy = fy.trim().toLowerCase();
        
        // Handle different formats: "2025-26", "2025-2026", "25-26", etc.
        if (fy.contains("-")) {
            String[] parts = fy.split("-");
            if (parts.length == 2) {
                String startYear = parts[0].trim();
                String endYear = parts[1].trim();
                
                // Normalize to 4-digit years
                if (startYear.length() == 2) {
                    startYear = "20" + startYear;
                }
                if (endYear.length() == 2) {
                    endYear = "20" + endYear;
                }
                
                return startYear + "-" + endYear.substring(2); // Return as "2025-26"
            }
        }
        
        return fy;
    }

    /**
     * Flexible days elapsed check - handles various formats
     */
    private boolean isDaysElapsedApplicable(AdditionalFeeRate feeConfig, int daysElapsed) {
        if (feeConfig.getApplicableAfterDays() == null || feeConfig.getApplicableAfterDays().trim().isEmpty()) {
            return true; // No days restriction
        }
        
        try {
            int requiredDays = Integer.parseInt(feeConfig.getApplicableAfterDays().trim());
            return daysElapsed >= requiredDays;
        } catch (NumberFormatException e) {
            return true; // If invalid, treat as no restriction
        }
    }

    /**
     * Determines base amount - flexible calculation based on MDMS configuration
     * Priority: flatAmount > rate calculation > amount field
     */
    private BigDecimal determineBaseAmount(AdditionalFeeRate feeConfig, BigDecimal baseAmount) {
        // Priority 1: Check for flatAmount first (highest priority)
        if (feeConfig.getFlatAmount() != null && feeConfig.getFlatAmount().compareTo(BigDecimal.ZERO) > 0) {
            return feeConfig.getFlatAmount();
        }
        
        // Priority 2: Calculate using rate
        if (feeConfig.getRate() != null && feeConfig.getRate().compareTo(BigDecimal.ZERO) > 0 && baseAmount != null) {
            return calculateRateBasedAmount(baseAmount, feeConfig.getRate());
        }
        
        // Priority 3: Use amount field as fallback
        if (feeConfig.getAmount() != null && feeConfig.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            return feeConfig.getAmount();
        }
        
        return BigDecimal.ZERO;
    }

    /**
     * Calculates amount based on rate percentage
     */
    private BigDecimal calculateRateBasedAmount(BigDecimal baseAmount, BigDecimal rate) {
        if (baseAmount == null || rate == null) {
            return BigDecimal.ZERO;
        }
        
        // Calculate fee as percentage of base amount
        BigDecimal calculatedAmount = baseAmount.multiply(rate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        // Round up to the next whole number (ceiling)
        return calculatedAmount.setScale(0, RoundingMode.CEILING);
    }

    /**
     * Applies min/max constraints to the calculated amount
     * Flexible handling of various constraint scenarios
     */
    private BigDecimal applyMinMaxConstraints(BigDecimal calculatedAmount, AdditionalFeeRate feeConfig) {
        if (calculatedAmount == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal finalAmount = calculatedAmount;
        BigDecimal minAmount = feeConfig.getMinAmount();
        BigDecimal maxAmount = feeConfig.getMaxAmount();
        
        // Validate min/max amounts
        if (minAmount != null && minAmount.compareTo(BigDecimal.ZERO) < 0) {
            minAmount = null;
        }
        
        if (maxAmount != null && maxAmount.compareTo(BigDecimal.ZERO) < 0) {
            maxAmount = null;
        }
        
        // Check for logical consistency
        if (minAmount != null && maxAmount != null && minAmount.compareTo(maxAmount) > 0) {
            minAmount = null;
            maxAmount = null;
        }
        
        // Apply constraints
        if (maxAmount != null && calculatedAmount.compareTo(maxAmount) > 0) {
            finalAmount = maxAmount;
        }
        
        if (minAmount != null && finalAmount.compareTo(minAmount) < 0) {
            finalAmount = minAmount;
        }
        
        return finalAmount;
    }

    /**
     * Calculates total additional fees for all fee types
     * 
     * @param feeConfigs List of fee configurations
     * @param baseAmount Base amount for rate calculations
     * @param daysElapsed Days elapsed since application
     * @param currentFY Current financial year
     * @return Total additional fees
     */
    public BigDecimal calculateTotalAdditionalFees(List<AdditionalFeeRate> feeConfigs, BigDecimal baseAmount, 
                                                  int daysElapsed, String currentFY) {
        BigDecimal totalFees = BigDecimal.ZERO;
        
        for (AdditionalFeeRate feeConfig : feeConfigs) {
            BigDecimal feeAmount = calculateFeeAmount(feeConfig, baseAmount, daysElapsed, currentFY);
            totalFees = totalFees.add(feeAmount);
        }
        
        return totalFees;
    }

    /**
     * Gets current financial year in MDMS format (e.g., "2025-26")
     */
    public String getCurrentFinancialYear() {
        LocalDate currentDate = LocalDate.now();
        int currentYear = currentDate.getYear();
        int currentMonth = currentDate.getMonthValue();
        
        // Financial year starts from April (month 4)
        if (currentMonth >= 4) {
            return currentYear + "-" + String.valueOf(currentYear + 1).substring(2);
        } else {
            return (currentYear - 1) + "-" + String.valueOf(currentYear).substring(2);
        }
    }

    /**
     * Calculates days elapsed since a given date
     */
    public int calculateDaysElapsed(long applicationDateMillis) {
        long currentTimeMillis = System.currentTimeMillis();
        long elapsedMillis = currentTimeMillis - applicationDateMillis;
        return (int) (elapsedMillis / (24 * 60 * 60 * 1000));
    }
}
