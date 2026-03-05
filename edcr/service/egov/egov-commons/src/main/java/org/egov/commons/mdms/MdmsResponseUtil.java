package org.egov.commons.mdms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.util.Iterator;
import java.util.Map;

public class MdmsResponseUtil {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    public static final ScriptEngine JS_ENGINE =
            new ScriptEngineManager().getEngineByName("nashorn");

    /* ========================= PARSE ========================= */

    public static JsonNode parse(String json) {
        try {
            return MAPPER.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Invalid MDMS JSON", e);
        }
    }
    
    public static JsonNode toJsonNode(Object object) {
        return MAPPER.valueToTree(object);
    }

    /* ========================= ROOT ACCESS ========================= */

    public static JsonNode getOccupancyNode(JsonNode root) {

        JsonNode masterPlanArray = root.path("MdmsRes")
                .path("edcrRules")
                .path("MasterPlan");

        if (!masterPlanArray.isArray() || masterPlanArray.size() == 0) {
            throw new RuntimeException("MasterPlan not found in MDMS response");
        }

        return masterPlanArray.get(0);
    }

    /* ========================= GENERIC RULE FETCH ========================= */

    public static JsonNode getRule(JsonNode occupancyNode, String ruleName) {
        return occupancyNode.path(ruleName);
    }

    /* ========================= SLAB RESOLUTION ========================= */

    public static JsonNode resolveSlab(JsonNode slabNode, double input) {

        JsonNode slabs = slabNode.path("value");

        for (JsonNode slab : slabs) {

            double min = slab.path("min").asDouble();
            double max = slab.path("max").asDouble();

            if (input >= min && input <= max) {
                return slab;
            }
        }

        return null;
    }

    /* ========================= RANGE ========================= */

    public static boolean validateRange(JsonNode rangeNode, double input) {

        double min = rangeNode.path("value").path("min").asDouble();
        double max = rangeNode.path("value").path("max").asDouble();

        return input >= min && input <= max;
    }

    /* ========================= MULTI (HEIGHT example) ========================= */

    public static Double resolveHeight(JsonNode heightNode,
                                       double roadWidth,
                                       boolean withStilt) {

        JsonNode value = heightNode.path("value");

        if (withStilt && value.has("withStilt")) {
            return value.path("withStilt").asDouble();
        }

        if (value.has("byRoadWidth")) {
            JsonNode slabNode = value.path("byRoadWidth");
            JsonNode matched = resolveSlab(slabNode, roadWidth);
            if (matched != null) {
                return matched.path("value").asDouble();
            }
        }

        if (value.has("fixed")) {
            return value.path("fixed").asDouble();
        }

        return null;
    }

    /* ========================= FORMULA ========================= */

    public static Double evaluateFormula(String formula,
                                         Map<String, Object> context) {

        try {
            Bindings bindings = JS_ENGINE.createBindings();
            bindings.putAll(context);

            JS_ENGINE.eval("function MAX(a,b){return Math.max(a,b);}", bindings);

            Object result = JS_ENGINE.eval(formula, bindings);

            return ((Number) result).doubleValue();

        } catch (Exception e) {
            throw new RuntimeException("Formula evaluation failed: " + formula, e);
        }
    }
}
