package org.egov.commons.mdms;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;

public class BuildingRuleService {
    private final MdmsRuleEngine engine;
    private final RuleContext context;

    public BuildingRuleService(JsonNode masterData, RuleContext context) {
        this.engine = new MdmsRuleEngine(masterData);
        this.context = context;
    }

    // --- FAR ---
    public RuleResult<BigDecimal> getNormalFAR() {
        RuleResult<JsonNode> res = engine.fetch("FAR", context, JsonNode.class);
        BigDecimal val = (res.getValue() != null) ? res.getValue().path("normal").decimalValue() : null;
        return new RuleResult<>(val, res.isMandatory());
    }

    // --- ROAD WIDTH ---
    public RuleResult<BigDecimal> getMinRoadWidth() {
        RuleResult<JsonNode> res = engine.fetch("roadWidth", context, JsonNode.class);
        BigDecimal val = (res.getValue() != null) ? res.getValue().path("min").decimalValue() : null;
        return new RuleResult<>(val, res.isMandatory());
    }

    // --- HEIGHT ---
    public RuleResult<BigDecimal> getMaxHeight() {
        return engine.fetch("height", context, BigDecimal.class);
    }

    // --- SETBACKS ---
    public RuleResult<BigDecimal> getFrontSetback() { return engine.fetch("setbacks.value.front", context, BigDecimal.class); }
    public RuleResult<BigDecimal> getRearSetback() { return engine.fetch("setbacks.value.rear", context, BigDecimal.class); }
    public RuleResult<BigDecimal> getSide1Setback() { return engine.fetch("setbacks.value.side1", context, BigDecimal.class); }
    public RuleResult<BigDecimal> getSide2Setback() { return engine.fetch("setbacks.value.side2", context, BigDecimal.class); }

    // --- SITE COVERAGE ---
    public RuleResult<BigDecimal> getMaxSiteCoverage() {
        RuleResult<JsonNode> res = engine.fetch("siteCoverage", context, JsonNode.class);
        BigDecimal val = (res.getValue() != null) ? res.getValue().path("percentage").decimalValue() : null;
        return new RuleResult<>(val, res.isMandatory());
    }

    // --- PARKING ---
    public RuleResult<Integer> getParkingECS() {
        RuleResult<JsonNode> res = engine.fetch("parking", context, JsonNode.class);
        Integer val = (res.getValue() != null) ? res.getValue().path("ECS").asInt() : null;
        return new RuleResult<>(val, res.isMandatory());
    }

    // --- STAIRCASE & ROOMS ---
    public RuleResult<BigDecimal> getMinStaircaseWidth() { return engine.fetch("staircase.value.minWidth", context, BigDecimal.class); }
    public RuleResult<BigDecimal> getMinRoomHeight() { return engine.fetch("minRoomHeight", context, BigDecimal.class); }
    public RuleResult<Integer> getMinVentilation() { return engine.fetch("minVentilation", context, Integer.class); }
    public RuleResult<Integer> getMinPlantationArea() { return engine.fetch("minPlantationArea", context, Integer.class); }

    // --- BOOLEAN EXCLUSIONS ---
    public boolean isParapetExcluded() { 
        Boolean b = engine.fetch("heightExclusions.value.parapet", context, Boolean.class).getValue();
        return b != null && b; 
    }

    // --- TWO STREET PLOTS ---
    public RuleResult<String> getTwoStreetFrontRule() {
        return engine.fetch("twoStreetPlots.value.frontSetbackBothRoads", context, String.class);
    }
}