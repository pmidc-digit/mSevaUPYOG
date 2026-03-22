package org.egov.commons.mdms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class RuleUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

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

            // If the current node is a Rule Definition (has 'type')
            if (currentNode.has("type")) {
                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
                
                // Determine if there's a sub-field in the path (e.g., "normal" in "FAR.normal")
                String nextPart = (i < parts.length - 1) ? parts[i + 1] : null;
                
                // Resolve the rule based on its type and context
                JsonNode resolved = resolveRuleNode(currentNode, context, nextPart);
                
                // If the resolution logic consumed the next part of the path, skip it in the loop
                if (nextPart != null && isPathConsumed(currentNode, nextPart, resolved)) {
                    i++; 
                }
                currentNode = resolved;
            }
        }
        return new RuleResult<>(cast(currentNode, targetType), mandatory);
    }

    private static boolean isPathConsumed(JsonNode ruleNode, String nextPart, JsonNode resolvedNode) {
        if (resolvedNode == null || resolvedNode.isMissingNode()) return false;
        String type = ruleNode.path("type").asText("");
        
        if ("MULTI".equals(type)) {
            return ruleNode.path("value").has(nextPart);
        }
        // Consumed if it's a Slab/Progressive rule and we've successfully reached a final value
        return "SLAB_PROGRESSIVE".equals(type) || "SLAB".equals(type);
    }

//    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context, String subPath) {
//        String type = ruleNode.path("type").asText("SIMPLE");
//        JsonNode valueNode = ruleNode.path("value");
//
//        switch (type) {
//            case "SLAB_PROGRESSIVE":
//                return calculateProgressiveSlab(ruleNode, context != null ? context.getNumericInput() : null, subPath);
//
//            case "SLAB":
//                // Intelligent slab finding based on JSON hint 'useVariable'
//                JsonNode matchedSlab = findSlab(ruleNode, context);
//                if (matchedSlab != null && subPath != null && matchedSlab.has(subPath)) {
//                    return matchedSlab.path(subPath);
//                }
//                return (matchedSlab != null && matchedSlab.has("value")) ? matchedSlab.path("value") : matchedSlab;
//
//            case "MATH_MAX":
//                return calculateMathMax(ruleNode, context);
//
//            case "MULTI":
//                return resolveMulti(ruleNode, context, subPath);
//
//            case "RANGE":
//            case "MAP":
//            case "SIMPLE":
//            default:
//                return valueNode;
//        }
//    }
    
    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context, String subPath) {
        String type = ruleNode.path("type").asText("SIMPLE");
        JsonNode valueNode = ruleNode.path("value");

        switch (type) {
            case "SLAB":
                // 1. Find the correct slab based on 'useVariable' (roadWidth, plotArea, etc.)
                JsonNode matchedSlab = findSlab(ruleNode, context);
                if (matchedSlab == null) return null;

                JsonNode result = matchedSlab.path("value");

                // --- CRITICAL RECURSIVE UPDATE ---
                // If the value inside the slab is another Rule (has a 'type'), resolve it!
                if (result.isObject() && result.has("type")) {
                    return resolveRuleNode(result, context, subPath);
                }
                // ---------------------------------

                // Standard drill-down for specific keys (like .ECS)
                if (subPath != null && matchedSlab.has(subPath)) {
                    return matchedSlab.path(subPath);
                }
                return result;

            case "SLAB_PROGRESSIVE":
                return calculateProgressiveSlab(ruleNode, context != null ? context.getNumericInput() : null, subPath);

            case "MATH_MAX":
                return calculateMathMax(ruleNode, context);

            case "MULTI":
                return resolveMulti(ruleNode, context, subPath);

            default:
                return valueNode;
        }
    }

    private static JsonNode calculateProgressiveSlab(JsonNode ruleNode, BigDecimal totalInput, String targetField) {
        JsonNode slabs = ruleNode.path("value");
        String unit = ruleNode.path("unit").asText("");

        if (totalInput == null || totalInput.compareTo(BigDecimal.ZERO) <= 0 || !slabs.isArray()) {
            return mapper.valueToTree(BigDecimal.ZERO);
        }

        BigDecimal totalAccumulatedValue = BigDecimal.ZERO;
        BigDecimal remainingInput = totalInput;

        String field = (targetField != null && slabs.get(0).has(targetField)) ? targetField : 
                       (slabs.get(0).has("percentage") ? "percentage" : "value");

        for (JsonNode slab : slabs) {
            if (remainingInput.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal min = slab.path("min").decimalValue();
            BigDecimal max = slab.path("max").decimalValue();
            BigDecimal rate = slab.path(field).decimalValue();

            BigDecimal slabWidth = max.subtract(min);
            BigDecimal amountInThisSlab = remainingInput.min(slabWidth);
            
            BigDecimal contribution;
            if (field.equals("percentage") || unit.equalsIgnoreCase("percent")) {
                contribution = amountInThisSlab.multiply(rate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            } else {
                contribution = amountInThisSlab.multiply(rate);
            }

            totalAccumulatedValue = totalAccumulatedValue.add(contribution);
            remainingInput = remainingInput.subtract(amountInThisSlab);
        }

        // Return Area for Coverage (sq.mt), but Ratio for FAR
        if (unit.equalsIgnoreCase("ratio")) {
            return mapper.valueToTree(totalAccumulatedValue.divide(totalInput, 4, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP));
        }
        return mapper.valueToTree(totalAccumulatedValue.setScale(2, RoundingMode.HALF_UP));
    }

    private static JsonNode findSlab(JsonNode ruleNode, RuleContext context) {
        JsonNode slabs = ruleNode.path("value");
        if (context == null || !slabs.isArray()) return null;

        // Dynamic Variable Selection: Looks for 'useVariable' in JSON, else defaults to plotArea
        String varName = ruleNode.path("useVariable").asText("plotArea");
        BigDecimal input = context.getNumericInput(); 

        if (context.getFormulaVariables() != null && context.getFormulaVariables().containsKey(varName)) {
            Object val = context.getFormulaVariables().get(varName);
            input = (val instanceof BigDecimal) ? (BigDecimal) val : new BigDecimal(val.toString());
        }

        for (JsonNode slab : slabs) {
            BigDecimal min = slab.path("min").decimalValue();
            BigDecimal max = slab.path("max").decimalValue();
            if (input.compareTo(min) >= 0 && input.compareTo(max) <= 0) return slab;
        }
        return null;
    }

    private static JsonNode calculateMathMax(JsonNode ruleNode, RuleContext context) {
        try {
            JsonNode valNode = ruleNode.path("value");
            Object bhObj = context.getFormulaVariables().get("buildingHeight");
            BigDecimal bh = (bhObj instanceof BigDecimal) ? (BigDecimal) bhObj : new BigDecimal(bhObj.toString());
            BigDecimal div = new BigDecimal(valNode.path("divisor").asText("1"));
            BigDecimal def = new BigDecimal(valNode.path("default").asText("0"));
            return mapper.valueToTree(bh.divide(div, 2, RoundingMode.HALF_UP).max(def));
        } catch (Exception e) { return null; }
    }

    private static JsonNode resolveMulti(JsonNode ruleNode, RuleContext context, String subPath) {
        JsonNode valueNode = ruleNode.path("value");
        if (subPath != null && valueNode.has(subPath)) return valueNode.path(subPath);
        if (context != null && Boolean.TRUE.equals(context.getWithStilt()) && valueNode.has("withStilt")) return valueNode.path("withStilt");
        return valueNode.path("fixed");
    }

    @SuppressWarnings("unchecked")
    private static <T> T cast(JsonNode node, Class<T> clazz) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;
        try {
            if (clazz == BigDecimal.class) return (T) new BigDecimal(node.asText());
            if (clazz == JsonNode.class) return (T) node;
            if (clazz == String.class) return (T) node.asText();
            if (clazz == Boolean.class) return (T) (Boolean) node.asBoolean();
            return mapper.treeToValue(node, clazz);
        } catch (Exception e) { return null; }
    }
}