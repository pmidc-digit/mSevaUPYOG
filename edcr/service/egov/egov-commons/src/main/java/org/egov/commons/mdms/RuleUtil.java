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
    public static <T> RuleResult<T> getRule(JsonNode mdmsData, String path, RuleContext context, Class<T> targetType) {
        if (mdmsData == null || mdmsData.isMissingNode() || path == null || path.isEmpty()) {
            return new RuleResult<>(null, false);
        }

        String[] parts = path.split("\\.");
        JsonNode currentNode = mdmsData;
        boolean mandatory = false;

        for (int i = 0; i < parts.length; i++) {
            currentNode = currentNode.path(parts[i]);
            if (currentNode.isMissingNode()) return new RuleResult<>(null, false);

            if (currentNode.has("type")) {
                mandatory = currentNode.path("mandatory").asBoolean(mandatory);
                currentNode = resolveRuleNode(currentNode, context);
            }
        }
        return new RuleResult<>(cast(currentNode, targetType), mandatory);
    }

    private static JsonNode resolveRuleNode(JsonNode ruleNode, RuleContext context) {
        String type = ruleNode.path("type").asText("SIMPLE");
        JsonNode valueNode = ruleNode.path("value");

        switch (type) {
            case "RANGE":
                // Returns the {min: x, max: y} object directly
                return valueNode;

            case "SLAB":
                JsonNode matchedSlab = findSlab(valueNode, context != null ? context.getNumericInput() : null);
                if (matchedSlab != null && matchedSlab.has("value") && !matchedSlab.path("value").isArray()) {
                    return matchedSlab.path("value");
                }
                return matchedSlab;

            case "MATH_MAX":
                return calculateMathMax(valueNode, context);

            case "FORMULA":
                return evaluateFormula(valueNode.asText(), context);

            case "MULTI":
                return resolveMulti(valueNode, context);

            default:
                return valueNode;
        }
    }

    /**
     * Specialized Java Logic for MAX(Height/Divisor, DefaultValue)
     */
    private static JsonNode calculateMathMax(JsonNode mathNode, RuleContext context) {
        try {
            if (context == null || context.getFormulaVariables() == null) return null;
            Object bhObj = context.getFormulaVariables().get("buildingHeight");
            if (bhObj == null) return null;
            BigDecimal buildingHeight = (bhObj instanceof BigDecimal) ? (BigDecimal) bhObj : new BigDecimal(bhObj.toString());
            BigDecimal divisor = new BigDecimal(mathNode.path("divisor").asText("1"));
            BigDecimal defaultValue = new BigDecimal(mathNode.path("default").asText("0"));
            BigDecimal divisionResult = buildingHeight.divide(divisor, 2, RoundingMode.HALF_UP);
            return mapper.valueToTree(divisionResult.max(defaultValue));
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

    private static JsonNode resolveMulti(JsonNode node, RuleContext context) {
        if (context != null && Boolean.TRUE.equals(context.getWithStilt()) && node.has("withStilt")) return node.path("withStilt");
        return node.path("fixed");
    }

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