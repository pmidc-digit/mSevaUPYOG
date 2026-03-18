package org.egov.commons.mdms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

public class RuleUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    /**
     * The Intelligent Resolver: Handles nested Rules within MAPs and specialized MATH_MAX logic.
     */
//    public static <T> RuleResult<T> getRule(JsonNode mdmsData, String path, RuleContext context, Class<T> targetType) {
//        if (mdmsData == null || mdmsData.isMissingNode() || path == null || path.isEmpty()) {
//            return new RuleResult<>(null, false);
//        }
//
//        String[] parts = path.split("\\.");
//        JsonNode currentNode = mdmsData;
//        boolean mandatory = false;
//
//        for (int i = 0; i < parts.length; i++) {
//            currentNode = currentNode.path(parts[i]);
//            if (currentNode.isMissingNode()) return new RuleResult<>(null, false);
//
//            if (currentNode.has("type")) {
//                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
//                currentNode = resolveRuleNode(currentNode, context);
//            }
//        }
//        return new RuleResult<>(cast(currentNode, targetType), mandatory);
//    }
    
    public static <T> RuleResult<T> getRule(JsonNode mdmsData, String path, RuleContext context, Class<T> targetType) {
        if (mdmsData == null || mdmsData.isMissingNode() || path == null || path.isEmpty()) {
            return new RuleResult<>(null, false);
        }

        String[] parts = path.split("\\.");
        JsonNode currentNode = mdmsData;
        boolean mandatory = false;

        for (int i = 0; i < parts.length; i++) {
            String currentPart = parts[i];
            currentNode = currentNode.path(currentPart);

            if (currentNode.isMissingNode()) return new RuleResult<>(null, false);

            // If we hit a Rule Node (has 'type'), resolve it
            if (currentNode.has("type")) {
                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
                
                // Determine the next part of the path to use as a 'sub-field' or 'column'
                String nextPart = (i < parts.length - 1) ? parts[i + 1] : null;
                
                // Resolve the rule logic
                JsonNode resolved = resolveRuleNode(currentNode, context, nextPart);
                
                // CRITICAL FIX: Only consume the next path part if the resolution actually used it
                // (e.g., SLAB_PROGRESSIVE used 'normal' or SLAB used 'percentage')
                if (nextPart != null && isPathConsumed(currentNode, nextPart, resolved)) {
                    i++; 
                }
                currentNode = resolved;
            }
        }
        return new RuleResult<>(cast(currentNode, targetType), mandatory);
    }
    
    private static boolean isPathConsumed(JsonNode ruleNode, String nextPart, JsonNode resolvedNode) {
        String type = ruleNode.path("type").asText("");
     // MULTI consumes path if the specific key exists in its value map
        if ("MULTI".equals(type)) {
            return ruleNode.path("value").has(nextPart);
        }
        // If it's progressive or a slab that successfully looked up a specific column, it's consumed
        return "SLAB_PROGRESSIVE".equals(type) || "SLAB".equals(type);
    }
    
    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context, String subPath) {
        String type = ruleNode.path("type").asText("SIMPLE");
        JsonNode valueNode = ruleNode.path("value");

        switch (type) {
            case "SLAB_PROGRESSIVE":
                // Calculate cumulative value (Effective Ratio)
                //return calculateProgressiveSlab(valueNode, context != null ? context.getNumericInput() : null, subPath);
                return calculateProgressiveSlab(ruleNode, context.getNumericInput(), subPath);

            case "SLAB":
                JsonNode matchedSlab = findSlab(valueNode, context != null ? context.getNumericInput() : null);
                if (matchedSlab != null && subPath != null && matchedSlab.has(subPath)) {
                    return matchedSlab.path(subPath);
                }
                return (matchedSlab != null && matchedSlab.has("value")) ? matchedSlab.path("value") : matchedSlab;

            case "MATH_MAX":
                return calculateMathMax(valueNode, context);

//            case "MULTI":
//                return resolveMulti(valueNode, context);
            case "MULTI":
                // Pass the subPath to the multi resolver
            	return resolveMulti(ruleNode, context, subPath);
            	
            case "RANGE":
            case "MAP":
            case "SIMPLE":
            default:
                return valueNode;
        }
    }

//    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context) {
//        String type = ruleNode.path("type").asText("SIMPLE");
//        JsonNode valueNode = ruleNode.path("value");
//
//        switch (type) {
//            case "RANGE":
//                // Returns the {min: x, max: y} object directly
//                return valueNode;
//
//            case "SLAB":
//                JsonNode matchedSlab = findSlab(valueNode, context != null ? context.getNumericInput() : null);
//                if (matchedSlab != null && matchedSlab.has("value") && !matchedSlab.path("value").isArray()) {
//                    return matchedSlab.path("value");
//                }
//                return matchedSlab;
//
//            case "MATH_MAX":
//                return calculateMathMax(valueNode, context);
//
//            case "FORMULA":
//                return evaluateFormula(valueNode.asText(), context);
//
//            case "MULTI":
//                return resolveMulti(valueNode, context);
//            case "SLAB_PROGRESSIVE":
//                // We pass the whole rule node so the calculator knows which sub-path/field to use
//                return calculateProgressiveSlab(ruleNode, context, subPath);
//
//            default:
//                return valueNode;
//        }
//    }
    
//    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context, String subPath) {
//        String type = ruleNode.path("type").asText("SIMPLE");
//        JsonNode valueNode = ruleNode.path("value");
//
//        switch (type) {
//            case "SLAB_PROGRESSIVE":
//                return calculateProgressiveSlab(valueNode, context.getNumericInput(), subPath);
//
//            case "SLAB":
//                JsonNode matchedSlab = findSlab(valueNode, context != null ? context.getNumericInput() : null);
//                if (matchedSlab != null && subPath != null && matchedSlab.has(subPath)) {
//                    return matchedSlab.path(subPath);
//                }
//                return (matchedSlab != null && matchedSlab.has("value")) ? matchedSlab.path("value") : matchedSlab;
//
//            case "MATH_MAX":
//                return calculateMathMax(valueNode, context);
//
//            case "MULTI":
//                return resolveMulti(valueNode, context);
//
//            case "RANGE":
//            default:
//                return valueNode;
//        }
//    }
    
//    private static JsonNode calculateProgressiveSlab(JsonNode slabs, BigDecimal totalInput, String targetField) {
//        // 1. Validation
//        if (totalInput == null || totalInput.compareTo(BigDecimal.ZERO) <= 0 || !slabs.isArray()) {
//            return mapper.valueToTree(BigDecimal.ZERO);
//        }
//
//        BigDecimal totalAccumulatedValue = BigDecimal.ZERO;
//        BigDecimal remainingInput = totalInput;
//
//        // 2. Identify the target field (normal, purchasable, percentage, etc.)
//        String field = (targetField != null) ? targetField : 
//                       (slabs.get(0).has("percentage") ? "percentage" : "value");
//
//        // 3. Progressive Calculation Loop
//        for (int i = 0; i < slabs.size(); i++) {
//            if (remainingInput.compareTo(BigDecimal.ZERO) <= 0) break;
//
//            JsonNode slab = slabs.get(i);
//            BigDecimal min = slab.path("min").decimalValue();
//            BigDecimal max = slab.path("max").decimalValue();
//            BigDecimal rate = slab.path(field).decimalValue();
//
//            // Calculate width of the current bucket (e.g., 350 - 250 = 100)
//            BigDecimal slabWidth = max.subtract(min);
//            
//            // Determine how much of the plot area fits in this specific bucket
//            BigDecimal amountInThisSlab = remainingInput.min(slabWidth);
//            
//            BigDecimal contribution;
//            if (field.equals("percentage")) {
//                // For Coverage: Area * (65 / 100)
//                contribution = amountInThisSlab.multiply(rate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
//            } else {
//                // For FAR: Area * 2.6
//                contribution = amountInThisSlab.multiply(rate);
//            }
//
//            totalAccumulatedValue = totalAccumulatedValue.add(contribution);
//            remainingInput = remainingInput.subtract(amountInThisSlab);
//        }
//
//        // 4. Calculate EFFECTIVE VALUE (Total Result / Total Input)
//        // This matches your 'effectiveFar' logic in the previous method
//        BigDecimal effectiveValue = totalAccumulatedValue.divide(totalInput, 4, RoundingMode.HALF_UP);
//
//        // Return as a rounded JsonNode (e.g., 2.44)
//        return mapper.valueToTree(effectiveValue.setScale(2, RoundingMode.HALF_UP));
//    }
    
    private static JsonNode calculateProgressiveSlab(JsonNode ruleNode, BigDecimal totalInput, String targetField) {
        JsonNode slabs = ruleNode.path("value");
        String unit = ruleNode.path("unit").asText(""); // Get unit (e.g., "percent" or "ratio")

        if (totalInput == null || totalInput.compareTo(BigDecimal.ZERO) <= 0 || !slabs.isArray()) {
            return mapper.valueToTree(BigDecimal.ZERO);
        }

        BigDecimal totalAccumulatedValue = BigDecimal.ZERO;
        BigDecimal remainingInput = totalInput;

        String field = (targetField != null) ? targetField : 
                       (slabs.get(0).has("percentage") ? "percentage" : "value");

        for (int i = 0; i < slabs.size(); i++) {
            if (remainingInput.compareTo(BigDecimal.ZERO) <= 0) break;

            JsonNode slab = slabs.get(i);
            BigDecimal min = slab.path("min").decimalValue();
            BigDecimal max = slab.path("max").decimalValue();
            BigDecimal rate = slab.path(field).decimalValue();

            BigDecimal slabWidth = max.subtract(min);
            BigDecimal amountInThisSlab = remainingInput.min(slabWidth);
            
            BigDecimal contribution;
            if (field.equals("percentage") || unit.equalsIgnoreCase("percent")) {
                // Formula: Area * (Rate / 100)
                contribution = amountInThisSlab.multiply(rate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            } else {
                // Formula: Area * Rate (for FAR)
                contribution = amountInThisSlab.multiply(rate);
            }

            totalAccumulatedValue = totalAccumulatedValue.add(contribution);
            remainingInput = remainingInput.subtract(amountInThisSlab);
        }

        // --- LOGIC SWITCH BASED ON UNIT ---
        // If it's Coverage (sq.m), we want the absolute sum (224.78)
        // If it's FAR (ratio), we want the effective ratio (e.g. 2.15)
        
        // Check if the rule is intended to return a ratio or an absolute area
        // Usually, Site Coverage has unit="percent" but we want the "Allowed Area"
        // FAR has unit="ratio"
        
        if (unit.equalsIgnoreCase("percent") || unit.toLowerCase().contains("sq")) {
            // Return absolute area (e.g., 224.78)
            return mapper.valueToTree(totalAccumulatedValue.setScale(2, RoundingMode.HALF_UP));
        } else {
            // Return Effective Value for FAR (Total / Input)
            BigDecimal effectiveValue = totalAccumulatedValue.divide(totalInput, 4, RoundingMode.HALF_UP);
            return mapper.valueToTree(effectiveValue.setScale(2, RoundingMode.HALF_UP));
        }
    }
    
//    
//    private static JsonNode calculateProgressiveSlab(JsonNode ruleNode, BigDecimal totalInput, String targetField) {
//        JsonNode slabs = ruleNode.path("value");
//        String unit = ruleNode.path("unit").asText("");
//
//        if (totalInput == null || totalInput.compareTo(BigDecimal.ZERO) <= 0 || !slabs.isArray()) {
//            return mapper.valueToTree(BigDecimal.ZERO);
//        }
//
//        BigDecimal totalAccumulatedValue = BigDecimal.ZERO;
//        BigDecimal remainingInput = totalInput;
//
//        // Use percentage as default for coverage, or provided field
//        String field = (targetField != null) ? targetField : 
//                       (slabs.get(0).has("percentage") ? "percentage" : "value");
//
//        for (int i = 0; i < slabs.size(); i++) {
//            if (remainingInput.compareTo(BigDecimal.ZERO) <= 0) break;
//
//            JsonNode slab = slabs.get(i);
//            BigDecimal min = slab.path("min").decimalValue();
//            BigDecimal max = slab.path("max").decimalValue();
//            BigDecimal rate = slab.path(field).decimalValue();
//
//            BigDecimal slabWidth = max.subtract(min);
//            BigDecimal amountInThisSlab = remainingInput.min(slabWidth);
//            
//            BigDecimal contribution;
//            if (slab.has("percentage") || field.equals("percentage")) {
//                // matches your (areaToUse * percent) logic
//                // Note: If MDMS percentage is 65, we divide by 100
//                contribution = amountInThisSlab.multiply(rate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
//            } else {
//                contribution = amountInThisSlab.multiply(rate);
//            }
//
//            totalAccumulatedValue = totalAccumulatedValue.add(contribution);
//            remainingInput = remainingInput.subtract(amountInThisSlab);
//        }
//
//        // Logic Switch: 
//        // If unit is sq.mt -> Return Total Area (like your method)
//        // If unit is ratio/percent -> Return Effective Ratio (like your FAR method)
//        if (unit.equalsIgnoreCase("sq.mt") || unit.equalsIgnoreCase("m2")) {
//            return mapper.valueToTree(totalAccumulatedValue.setScale(2, RoundingMode.HALF_UP));
//        } else {
//            BigDecimal effectiveValue = totalAccumulatedValue.divide(totalInput, 4, RoundingMode.HALF_UP);
//            return mapper.valueToTree(effectiveValue.setScale(2, RoundingMode.HALF_UP));
//        }
//    }

    /**
     * Specialized Java Logic for MAX(Height/Divisor, DefaultValue)
     */
//    private static JsonNode calculateMathMax(JsonNode mathNode, RuleContext context) {
//        try {
//            if (context == null || context.getFormulaVariables() == null) return null;
//            Object bhObj = context.getFormulaVariables().get("buildingHeight");
//            if (bhObj == null) return null;
//            BigDecimal buildingHeight = (bhObj instanceof BigDecimal) ? (BigDecimal) bhObj : new BigDecimal(bhObj.toString());
//            BigDecimal divisor = new BigDecimal(mathNode.path("divisor").asText("1"));
//            BigDecimal defaultValue = new BigDecimal(mathNode.path("default").asText("0"));
//            BigDecimal divisionResult = buildingHeight.divide(divisor, 2, RoundingMode.HALF_UP);
//            return mapper.valueToTree(divisionResult.max(defaultValue));
//        } catch (Exception e) { return null; }
//    }
//
//    private static JsonNode findSlab(JsonNode slabs, BigDecimal input) {
//        if (input == null || !slabs.isArray()) return null;
//        for (int i = 0; i < slabs.size(); i++) {
//            JsonNode slab = slabs.get(i);
//            BigDecimal min = slab.path("min").decimalValue();
//            BigDecimal max = slab.path("max").decimalValue();
//            if (input.compareTo(min) >= 0 && input.compareTo(max) <= 0) return slab;
//        }
//        return null;
//    }
    
    private static JsonNode calculateMathMax(JsonNode mathNode, RuleContext context) {
        try {
            if (context == null || context.getFormulaVariables() == null) return null;
            Object bhObj = context.getFormulaVariables().get("buildingHeight");
            if (bhObj == null) return null;
            BigDecimal bh = (bhObj instanceof BigDecimal) ? (BigDecimal) bhObj : new BigDecimal(bhObj.toString());
            BigDecimal div = new BigDecimal(mathNode.path("divisor").asText("1"));
            BigDecimal def = new BigDecimal(mathNode.path("default").asText("0"));
            return mapper.valueToTree(bh.divide(div, 2, RoundingMode.HALF_UP).max(def));
        } catch (Exception e) { return null; }
    }

    private static JsonNode findSlab(JsonNode slabs, BigDecimal input) {
        if (input == null || !slabs.isArray()) return null;
        for (int i = 0; i < slabs.size(); i++) {
            JsonNode slab = slabs.get(i);
            BigDecimal min = slab.path("min").decimalValue();
            BigDecimal max = slab.path("max").decimalValue();
            if (input.compareTo(min) >= 0 && input.compareTo(max) <= 0) return slab;
        }
        return null;
    }

    private static JsonNode evaluateFormula(String formula, RuleContext context) {
        try {
            javax.script.Bindings b = MdmsResponseUtil.JS_ENGINE.createBindings();
            if (context != null && context.getFormulaVariables() != null) b.putAll(context.getFormulaVariables());
            Object res = MdmsResponseUtil.JS_ENGINE.eval(formula, b);
            return mapper.valueToTree(res);
        } catch (Exception e) { return null; }
    }

//    private static JsonNode resolveMulti(JsonNode node, RuleContext context) {
//        if (context != null && Boolean.TRUE.equals(context.getWithStilt()) && node.has("withStilt")) return node.path("withStilt");
//        return node.path("fixed");
//    }
//    private static JsonNode resolveMulti(JsonNode node, RuleContext context) {
//        if (context != null && Boolean.TRUE.equals(context.getWithStilt()) && node.has("withStilt")) return node.path("withStilt");
//        return node.path("fixed");
//    }
    
    private static JsonNode resolveMulti(JsonNode ruleNode, RuleContext context, String subPath) {
        JsonNode valueNode = ruleNode.path("value");

        // 1. Check if the user is targeting a specific key inside the MULTI (like "mumty")
        if (subPath != null && valueNode.has(subPath)) {
            return valueNode.path(subPath);
        }

        // 2. Default logic: withStilt vs fixed
        if (context != null && Boolean.TRUE.equals(context.getWithStilt()) && valueNode.has("withStilt")) {
            return valueNode.path("withStilt");
        }
        
        return valueNode.path("fixed");
    }

//    @SuppressWarnings("unchecked")
//    private static <T> T cast(JsonNode node, Class<T> clazz) {
//        if (node == null || node.isMissingNode() || node.isNull()) return null;
//        try {
//            if (clazz == BigDecimal.class) return (T) new BigDecimal(node.asText());
//            if (clazz == Double.class) return (T) (Double) node.asDouble();
//            if (clazz == Integer.class) return (T) (Integer) node.asInt();
//            if (clazz == Long.class) return (T) (Long) node.asLong();
//            if (clazz == String.class) return (T) node.asText();
//            if (clazz == Boolean.class) return (T) (Boolean) node.asBoolean();
//            if (clazz == JsonNode.class) return (T) node;
//            return mapper.treeToValue(node, clazz);
//        } catch (Exception e) { return null; }
//    }
    
    @SuppressWarnings("unchecked")
    private static <T> T cast(JsonNode node, Class<T> clazz) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;
        try {
            if (clazz == BigDecimal.class) return (T) new BigDecimal(node.asText());
            if (clazz == Double.class) return (T) (Double) node.asDouble();
            if (clazz == Integer.class) return (T) (Integer) node.asInt();
            if (clazz == Long.class) return (T) (Long) node.asLong();
            if (clazz == String.class) return (T) node.asText();
            if (clazz == Boolean.class) return (T) (Boolean) node.asBoolean();
            if (clazz == JsonNode.class) return (T) node;
            return mapper.treeToValue(node, clazz);
        } catch (Exception e) { return null; }
    }
}