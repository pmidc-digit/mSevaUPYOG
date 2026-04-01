package org.egov.commons.mdms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

public class RuleUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

//    public static <T> RuleResult<T> getRule(JsonNode mdmsData, String path, RuleContext context, Class<T> targetType) {
//        if (mdmsData == null || mdmsData.isMissingNode() || path == null || path.isEmpty()) {
//            return new RuleResult<>(null, false);
//        }
//
//        String[] parts = path.split("\\.");
//        JsonNode currentNode = mdmsData;
//        String finalUnit = null; 
//        boolean mandatory = false;
//
//        for (int i = 0; i < parts.length; i++) {
//            String currentPart = parts[i];
//            currentNode = currentNode.path(currentPart);
//
//            if (currentNode.isMissingNode()) return new RuleResult<>(null, false);
//
//            if (currentNode.has("type")) {
//                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
//                
//                // Initial unit capture (e.g., from top-level 'front' node)
//                if (currentNode.has("unit")) {
//                    finalUnit = currentNode.path("unit").asText();
//                }
//
//                String nextPart = (i < parts.length - 1) ? parts[i + 1] : null;
//                
//                // Resolve returns the SLAB object with the unit inherited
//                currentNode = resolveRuleNode(currentNode, context, nextPart);
//
//                // Now this check will SUCCEED because resolveRuleNode injected the unit
//                if (currentNode != null && currentNode.has("unit")) {
//                    finalUnit = currentNode.path("unit").asText();
//                }
//
//                if (nextPart != null && isPathConsumed(mdmsData.path(currentPart), nextPart, currentNode)) {
//                    i++; 
//                }
//            }
//        }
//
//        return new RuleResult<>(cast(currentNode, targetType), mandatory, finalUnit);
//    }

//    public static <T> RuleResult<T> getRule(JsonNode mdmsData, String path, RuleContext context, Class<T> targetType) {
//        if (mdmsData == null || mdmsData.isMissingNode() || path == null || path.isEmpty()) {
//            return new RuleResult<>(null, false);
//        }
//
//        String[] parts = path.split("\\.");
//        JsonNode currentNode = mdmsData;
//        String finalUnit = null; 
//        boolean mandatory = false;
//
//        for (int i = 0; i < parts.length; i++) {
//            String currentPart = parts[i];
//            currentNode = currentNode.path(currentPart);
//
//            if (currentNode.isMissingNode()) return new RuleResult<>(null, false);
//
//            if (currentNode.has("type")) {
//                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
//                
//                if (currentNode.has("unit")) finalUnit = currentNode.path("unit").asText();
//
//                String nextPart = (i < parts.length - 1) ? parts[i + 1] : null;
//                
//                // resolveRuleNode returns the full Slab Object to preserve metadata
//                currentNode = resolveRuleNode(currentNode, context, nextPart);
//
//                if (currentNode != null && currentNode.has("unit")) {
//                    finalUnit = currentNode.path("unit").asText();
//                }
//
//                if (nextPart != null && isPathConsumed(mdmsData.path(currentPart), nextPart, currentNode)) {
//                    i++; 
//                }
//            }
//        }
//
//        // --- SMART UNWRAP LOGIC ---
//        JsonNode valueToReturn = currentNode;
//
//        // Check if the user is expecting a Number (Setbacks) or a JSON Object (Parking)
//        boolean isNumericTarget = (targetType == BigDecimal.class || targetType == Double.class || targetType == Integer.class);
//
//        if (isNumericTarget && currentNode != null && currentNode.isObject() && !currentNode.has("type")) {
//            // Only unwrap if we are looking for a simple numeric result
//            if (currentNode.has("value")) {
//                valueToReturn = currentNode.get("value");
//            } else if (currentNode.has("percentage")) {
//                valueToReturn = currentNode.get("percentage");
//            }
//            // NOTE: We don't unwrap "ECS" here because Parking logic needs 
//            // the WHOLE slab to read both ECS and denominator.
//        }
//
//        return new RuleResult<>(cast(valueToReturn, targetType), mandatory, finalUnit);
//    }
    public static <T> RuleResult<T> getRule(JsonNode mdmsData, String path, RuleContext context, Class<T> targetType) {
        if (mdmsData == null || mdmsData.isMissingNode() || path == null || path.isEmpty()) {
            return new RuleResult<>(null, false);
        }

        String[] parts = path.split("\\.");
        JsonNode currentNode = mdmsData;
        String finalUnit = null; 
        boolean mandatory = false;
        String lastRuleType = ""; // TRACKING: To prevent unwrapping progressive results

        for (int i = 0; i < parts.length; i++) {
            String currentPart = parts[i];
            currentNode = currentNode.path(currentPart);

            if (currentNode.isMissingNode()) return new RuleResult<>(null, false);

            if (currentNode.has("type")) {
                lastRuleType = currentNode.path("type").asText(""); 
                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
                
                if (currentNode.has("unit")) finalUnit = currentNode.path("unit").asText();

                String nextPart = (i < parts.length - 1) ? parts[i + 1] : null;
                
                // Resolve the node
                currentNode = resolveRuleNode(currentNode, context, nextPart);

                if (currentNode != null && currentNode.has("unit")) {
                    finalUnit = currentNode.path("unit").asText();
                }

                // FIX 1: Consumption check now knows about SLAB_PROGRESSIVE
                if (nextPart != null && isPathConsumed(mdmsData.path(currentPart), nextPart, currentNode)) {
                    i++; 
                }
            }
        }

        // --- SMART UNWRAP LOGIC ---
        JsonNode valueToReturn = currentNode;
        boolean isNumericTarget = (targetType == BigDecimal.class || targetType == Double.class || targetType == Integer.class);
        
        // FIX 2: Only unwrap standard SLAB objects. 
        // SLAB_PROGRESSIVE results are already raw numbers; unwrapping them would return null.
        if (isNumericTarget && !"SLAB_PROGRESSIVE".equals(lastRuleType) && 
            currentNode != null && currentNode.isObject() && !currentNode.has("type")) {
            
            if (currentNode.has("value")) {
                valueToReturn = currentNode.get("value");
            } else if (currentNode.has("percentage")) {
                valueToReturn = currentNode.get("percentage");
            }
        }

        return new RuleResult<>(cast(valueToReturn, targetType), mandatory, finalUnit);
    }

    private static boolean isPathConsumed(JsonNode ruleNode, String nextPart, JsonNode resolvedNode) {
        if (resolvedNode == null || resolvedNode.isMissingNode()) return false;
        String type = ruleNode.path("type").asText("");
        
        if ("MULTI".equals(type)) {
            return ruleNode.path("value").has(nextPart);
        }
        
        // FIX 3: If SLAB_PROGRESSIVE was called with a sub-path (like .normal), 
        // calculateProgressiveSlab already used that 'nextPart' to pick the field.
        // We must return true so the loop doesn't try to find 'normal' inside the result number.
        if ("SLAB_PROGRESSIVE".equals(type) && nextPart != null) {
            return true; 
        }
        
        return false; 
    }
    
    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context, String subPath) {
        String type = ruleNode.path("type").asText("SIMPLE");
        // Capture unit at this specific rule level (e.g., from the 'plotArea' SLAB)
        String currentUnit = ruleNode.path("unit").asText(null);

        switch (type) {
            case "SLAB":
                JsonNode matchedSlab = findSlab(ruleNode, context);
                if (matchedSlab == null || matchedSlab.isMissingNode()) return null;

                // INHERITANCE FIX: If the matched slab doesn't have a unit, inject parent's unit
                if (!matchedSlab.has("unit") && currentUnit != null) {
                    ((ObjectNode) matchedSlab).put("unit", currentUnit);
                }

                JsonNode resultValue = matchedSlab.path("value");

                // RECURSION: Dig deeper if the value is another Rule
                if (resultValue.isObject() && resultValue.has("type")) {
                    return resolveRuleNode(resultValue, context, subPath);
                }

                // Return the matched slab (carrying its unit and value/percentage/ECS)
                return matchedSlab;

            case "SLAB_PROGRESSIVE":
                return calculateProgressiveSlab(ruleNode, context != null ? context.getNumericInput() : null, subPath);

            case "MATH_MAX":
                return calculateMathMax(ruleNode, context);

            case "MULTI":
                return resolveMulti(ruleNode, context, subPath);

            default:
                return ruleNode.path("value");
        }
    }

    private static JsonNode findSlab(JsonNode ruleNode, RuleContext context) {
        JsonNode slabs = ruleNode.path("value");
        if (context == null || !slabs.isArray()) return null;

        String varName = ruleNode.path("useVariable").asText("plotArea");
        BigDecimal input = context.getNumericInput(); 

        if (context.getFormulaVariables() != null && context.getFormulaVariables().containsKey(varName)) {
            Object val = context.getFormulaVariables().get(varName);
            if (val != null) {
                input = (val instanceof BigDecimal) ? (BigDecimal) val : new BigDecimal(val.toString());
            }
        }

        if (input == null) return null;

        for (JsonNode slab : slabs) {
            JsonNode minNode = slab.path("min");
            JsonNode maxNode = slab.path("max");

            boolean minMatched = minNode.isMissingNode() || input.compareTo(minNode.decimalValue()) >= 0;
            boolean maxMatched = maxNode.isMissingNode() || input.compareTo(maxNode.decimalValue()) <= 0;

            if (minMatched && maxMatched) return slab;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static <T> T cast(JsonNode node, Class<T> clazz) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;

        // Safety: If somehow an ObjectNode still reaches here, unwrap it again
        if (node.isObject() && (clazz == BigDecimal.class || clazz == Double.class)) {
            if (node.has("value")) return cast(node.get("value"), clazz);
            if (node.has("percentage")) return cast(node.get("percentage"), clazz);
        }

        try {
            if (clazz == JsonNode.class) return (T) node;
            
            String textValue = node.asText();
            // Handle empty strings for non-string types
            if ((textValue == null || textValue.isEmpty()) && clazz != String.class) return null;

            if (clazz == BigDecimal.class) return (T) new BigDecimal(textValue);
            if (clazz == String.class) return (T) textValue;
            if (clazz == Boolean.class) return (T) (Boolean) node.asBoolean();
            if (clazz == Double.class) return (T) (Double) node.asDouble();
            if (clazz == Integer.class) return (T) (Integer) node.asInt();

            return mapper.treeToValue(node, clazz);
        } catch (Exception e) {
            return null;
        }
    }

//    private static boolean isPathConsumed(JsonNode ruleNode, String nextPart, JsonNode resolvedNode) {
//        if (resolvedNode == null || resolvedNode.isMissingNode()) return false;
//        String type = ruleNode.path("type").asText("");
//        if ("MULTI".equals(type)) {
//            return ruleNode.path("value").has(nextPart);
//        }
//        return false; 
//    }

    private static JsonNode calculateProgressiveSlab(JsonNode ruleNode, BigDecimal totalInput, String targetField) {
        JsonNode slabs = ruleNode.path("value");
        String unit = ruleNode.path("unit").asText("");
        if (totalInput == null || totalInput.compareTo(BigDecimal.ZERO) <= 0 || !slabs.isArray()) return mapper.valueToTree(BigDecimal.ZERO);

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

        if (unit.equalsIgnoreCase("ratio")) {
            return mapper.valueToTree(totalAccumulatedValue.divide(totalInput, 4, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP));
        }
        return mapper.valueToTree(totalAccumulatedValue.setScale(2, RoundingMode.HALF_UP));
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
}