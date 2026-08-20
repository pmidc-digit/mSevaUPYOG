package org.egov.commons.mdms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.commons.edcr.mdms.filter.MdmsFilter;
import java.math.BigDecimal;
import javax.script.Bindings;

public class MdmsRuleEngine {
    private final JsonNode root;
    private static final ObjectMapper mapper = new ObjectMapper();

    public MdmsRuleEngine(JsonNode root) {
        if (root == null || root.isMissingNode()) throw new RuntimeException("Invalid MDMS Node");
        this.root = root;
    }

    public <T> RuleResult<T> fetch(String path, RuleContext context, Class<T> targetClass) {
        JsonNode ruleNode = resolvePath(path);
        if (ruleNode.isMissingNode()) return new RuleResult<>(null, false);

        boolean isMandatory = ruleNode.path("mandatory").asBoolean(false);
        JsonNode resolvedValue = resolveRuleValue(ruleNode, context);

        return new RuleResult<>(cast(resolvedValue, targetClass), isMandatory);
    }

    private JsonNode resolvePath(String path) {
        JsonNode current = root;
        for (String part : path.split("\\.")) {
            current = current.path(part);
        }
        return current;
    }

    private JsonNode resolveRuleValue(JsonNode ruleNode, RuleContext context) {
        String type = ruleNode.path("type").asText("SIMPLE");
        JsonNode valueNode = ruleNode.path(MdmsFilter.GET_VALUE_KEY);

        switch (type) {
            case "SLAB": return findSlab(valueNode, context.getNumericInput());
            case "FORMULA": return evaluateFormula(valueNode.asText(), context);
            case "MULTI": return resolveMulti(valueNode, context);
            default: return valueNode; 
        }
    }

    private JsonNode findSlab(JsonNode slabs, BigDecimal input) {
        if (input == null || !slabs.isArray()) return null;
        for (int i = 0; i < slabs.size(); i++) {
            JsonNode slab = slabs.get(i);
            BigDecimal min = slab.path("min").decimalValue();
            BigDecimal max = slab.path("max").decimalValue();
            if (input.compareTo(min) >= 0 && input.compareTo(max) <= 0) return slab;
        }
        return null;
    }

    private JsonNode resolveMulti(JsonNode node, RuleContext context) {
        if (context.getWithStilt() != null && context.getWithStilt() && node.has("withStilt")) 
            return node.path("withStilt");
        return node.path("fixed");
    }

    private JsonNode evaluateFormula(String formula, RuleContext context) {
        try {
            Bindings bindings = MdmsResponseUtil.JS_ENGINE.createBindings();
            bindings.putAll(context.getFormulaVariables());
            Object result = MdmsResponseUtil.JS_ENGINE.eval(formula, bindings);
            return mapper.valueToTree(result);
        } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    private <T> T cast(JsonNode node, Class<T> clazz) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;
        if (clazz == BigDecimal.class) return (T) node.decimalValue();
        if (clazz == Integer.class) return (T) Integer.valueOf(node.asInt());
        if (clazz == Boolean.class) return (T) Boolean.valueOf(node.asBoolean());
        if (clazz == String.class) return (T) node.asText();
        return (T) node;
    }
}

//package org.egov.commons.mdms;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//import java.math.BigDecimal;
//
//import javax.script.Bindings;
//
//import org.egov.commons.edcr.mdms.filter.MdmsFilter;
//
//public class MdmsRuleEngine {
//
//    private final JsonNode occupancyNode;
//
//    public MdmsRuleEngine(JsonNode occupancyNode) {
//        if (occupancyNode == null || occupancyNode.isMissingNode()) {
//            throw new RuleResolutionException("Invalid MDMS occupancy node");
//        }
//        this.occupancyNode = occupancyNode;
//    }
//
//    /* ============================================================
//       PUBLIC API
//    ============================================================ */
//
//    public BigDecimal getBigDecimal(String ruleKey, RuleContext context) {
//        JsonNode node = resolve(ruleKey, context);
//        return node != null && node.isNumber()
//                ? node.decimalValue()
//                : null;
//    }
//
//    public String getString(String ruleKey) {
//        JsonNode node = resolve(ruleKey, null);
//        return node != null ? node.asText() : null;
//    }
//
//    public JsonNode getObject(String ruleKey, RuleContext context) {
//        return resolve(ruleKey, context);
//    }
//
//    public BigDecimal getSlabValue(String ruleKey,
//                                   String field,
//                                   RuleContext context) {
//
//        JsonNode slab = getObject(ruleKey, context);
//        JsonNode valueNode = slab.path(field);
//
//        return valueNode.isNumber()
//                ? valueNode.decimalValue()
//                : null;
//    }
//
//    public Boolean validateRange(String ruleKey, BigDecimal input) {
//
//        JsonNode ruleNode = getRuleNode(ruleKey);
//        JsonNode value = ruleNode.path(MdmsFilter.GET_VALUE_KEY);
//
//        BigDecimal min = value.path(MdmsFilter.GET_MIN_KEY).decimalValue();
//        BigDecimal max = value.path(MdmsFilter.GET_MAX_KEY).decimalValue();
//
//        return input.compareTo(min) >= 0 &&
//               input.compareTo(max) <= 0;
//    }
//
//    /* ============================================================
//       NESTED SLAB (like setbacks.front)
//    ============================================================ */
//
//    public BigDecimal getNestedSlabValue(String path,
//                                         String valueField,
//                                         RuleContext context) {
//
//        JsonNode slabNode = resolvePath(path);
//
//        if (slabNode == null || slabNode.isMissingNode()) {
//            throw new IllegalArgumentException("Invalid slab path: " + path);
//        }
//
//        JsonNode slabs = slabNode.path("value");
//
//        if (!slabs.isArray()) {
//            throw new IllegalStateException("Expected slab array at: " + path);
//        }
//
//        BigDecimal input = context.getNumericInput();
//
//        for (JsonNode slab : slabs) {
//
//            BigDecimal min = slab.path("min").decimalValue();
//            BigDecimal max = slab.path("max").decimalValue();
//
//            if (input.compareTo(min) >= 0 &&
//                input.compareTo(max) <= 0) {
//
//                return slab.path(valueField).decimalValue();
//            }
//        }
//
//        throw new IllegalStateException(
//                "No matching slab found for input: " + input);
//    }
//
//    private JsonNode resolvePath(String path) {
//
//        String[] parts = path.split("\\.");
//
//        JsonNode current = occupancyNode;   // ✅ FIXED HERE
//
//        for (String part : parts) {
//            current = current.path(part);
//        }
//
//        return current;
//    }
//
//    /* ============================================================
//       CORE RESOLUTION
//    ============================================================ */
//
//    private JsonNode resolve(String ruleKey, RuleContext context) {
//
//        JsonNode ruleNode = getRuleNode(ruleKey);
//        JsonNode valueNode = ruleNode.path(MdmsFilter.GET_VALUE_KEY);
//
//        RuleType type = detectRuleType(ruleNode, valueNode);
//
//        switch (type) {
//
//            case SIMPLE:
//                return valueNode;
//
//            case SLAB:
//                return resolveSlab(ruleNode, context);
//
//            case RANGE:
//                return valueNode;
//
//            case FORMULA:
//                return evaluateFormula(ruleNode, context);
//
//            case MULTI:
//                return resolveMulti(ruleNode, context);
//
//            case OBJECT:
//                return valueNode;
//
//            default:
//                throw new RuleResolutionException(
//                        "Unsupported rule type for: " + ruleKey);
//        }
//    }
//
//    /* ============================================================
//       TYPE DETECTION
//    ============================================================ */
//
//    private RuleType detectRuleType(JsonNode ruleNode,
//                                    JsonNode valueNode) {
//
//        if (ruleNode.has(MdmsFilter.GET_FORMULA_KEY)) {
//            return RuleType.FORMULA;
//        }
//
//        if (valueNode.isArray()) {
//            return RuleType.SLAB;
//        }
//
//        if (valueNode.has(MdmsFilter.GET_MIN_KEY)
//                && valueNode.has(MdmsFilter.GET_MAX_KEY)) {
//            return RuleType.RANGE;
//        }
//
//        if (valueNode.isNumber() || valueNode.isTextual()) {
//            return RuleType.SIMPLE;
//        }
//
//        if (valueNode.isObject()) {
//            return RuleType.MULTI;
//        }
//
//        return RuleType.OBJECT;
//    }
//
//    /* ============================================================
//       SLAB
//    ============================================================ */
//
//    private JsonNode resolveSlab(JsonNode ruleNode,
//                                 RuleContext context) {
//
//        if (context == null || context.getNumericInput() == null) {
//            throw new RuleResolutionException(
//                    "Numeric input required for slab rule");
//        }
//
//        JsonNode slabs = ruleNode.path(MdmsFilter.GET_VALUE_KEY);
//        BigDecimal input = context.getNumericInput();
//
//        for (JsonNode slab : slabs) {
//
//            BigDecimal min = slab.path("min").decimalValue();
//            BigDecimal max = slab.path("max").decimalValue();
//
//            if (input.compareTo(min) >= 0 &&
//                input.compareTo(max) <= 0) {
//                return slab;
//            }
//        }
//
//        throw new RuleResolutionException("No matching slab found");
//    }
//
//    /* ============================================================
//       MULTI
//    ============================================================ */
//
//    private JsonNode resolveMulti(JsonNode ruleNode,
//                                  RuleContext context) {
//
//        JsonNode value = ruleNode.path(MdmsFilter.GET_VALUE_KEY);
//
//        if (context != null
//                && Boolean.TRUE.equals(context.getWithStilt())
//                && value.has(MdmsFilter.GET_WITH_STILT_KEY)) {
//            return value.path(MdmsFilter.GET_WITH_STILT_KEY);
//        }
//
//        if (value.has(MdmsFilter.GET_FIXED_VALUE_KEY)) {
//            return value.path(MdmsFilter.GET_FIXED_VALUE_KEY);
//        }
//
//        return value;
//    }
//
//    /* ============================================================
//       FORMULA
//    ============================================================ */
//
//    private JsonNode evaluateFormula(JsonNode ruleNode,
//                                     RuleContext context) {
//
//        if (context == null
//                || context.getFormulaVariables() == null) {
//            throw new RuleResolutionException(
//                    "Formula variables required");
//        }
//
//        try {
//
//            Bindings bindings =
//                    MdmsResponseUtil.JS_ENGINE.createBindings();
//            bindings.putAll(context.getFormulaVariables());
//
//            Object result =
//                    MdmsResponseUtil.JS_ENGINE.eval(
//                            ruleNode.path(
//                                    MdmsFilter.GET_FORMULA_KEY)
//                                    .asText(),
//                            bindings);
//
//            return new ObjectMapper().valueToTree(result);
//
//        } catch (Exception e) {
//            throw new RuleResolutionException(
//                    "Formula evaluation failed", e);
//        }
//    }
//
//    /* ============================================================
//       UTIL
//    ============================================================ */
//
//    private JsonNode getRuleNode(String ruleKey) {
//
//        JsonNode node = occupancyNode.path(ruleKey);
//
//        if (node.isMissingNode()) {
//            throw new RuleResolutionException(
//                    "Rule not found: " + ruleKey);
//        }
//
//        return node;
//    }
//}
