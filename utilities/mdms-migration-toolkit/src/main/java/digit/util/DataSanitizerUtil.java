package digit.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import net.minidev.json.JSONArray;

public class DataSanitizerUtil {

    public static final Set<String> NUMERIC_FIELDS = new HashSet<>(Arrays.asList(
        // Financial / Amounts / Rates / Fees / Charges
        "amount", "rate", "flatAmount", "maxAmount", "minAmount", "securityDeposit", 
        "baseRent", "yearlyAmount", "weeklyAmount", "biannualAmount", "connectionFee", 
        "formFee", "meterCost", "meterTestingFee", "securityCharge", "unitCost", "price", 
        "taxpercentage", "ratePercentage", "taxAmount", "interestAmount", "penaltyFee", 
        "serviceCharge", "breakdownPenaltyRate", "bulkMeterMaxReading", "meterMaxReading",

        // Physical / Dimensions / Area / Coordinates
        "latitude", "longitude", "propertySizeOrArea", "buildingHeight", "fromPlotArea", 
        "toPlotArea", "fromPlotSize", "toPlotSize", "fromSlab", "toSlab", "capacity", 
        "size", "sizeinmilimeter", "from", "to",

        // Thresholds / SLA / Timestamps
        "businessSLA", "validityPeriod", "applicableAfterDays", "startingDay", "endingDay", 
        "demandEndDateMillis", "demandExpiryDate", "demandGenerationDateMillis", 
        "taxPeriodFrom", "taxPeriodTo", "validFrom", "validTo", "mutationPaymentPeriodInMonth",

        // Numerical Identifiers / Sequence / Order
        "order", "seq"
    ));

    public static final Set<String> DOUBLE_FIELDS = new HashSet<>(Arrays.asList(
        "amount", "rate", "flatAmount", "maxAmount", "minAmount", "securityDeposit",
        "baseRent", "yearlyAmount", "weeklyAmount", "biannualAmount", "connectionFee",
        "formFee", "meterCost", "meterTestingFee", "securityCharge", "unitCost", "price",
        "taxpercentage", "ratePercentage", "taxAmount", "interestAmount", "penaltyFee",
        "serviceCharge", "breakdownPenaltyRate", "latitude", "longitude", "propertySizeOrArea",
        "fromPlotArea", "toPlotArea", "fromPlotSize", "toPlotSize", "fromSlab", "toSlab", "from", "to"
    ));

    public static final Set<String> NUMERIC_ID_MASTERS = new HashSet<>(Arrays.asList(
        "WCBillingSlab", "SCBillingSlab", "PipeSize", "RoadType", "PlotSizeSlab", "TaxRate"
    ));

    public static Object sanitizeValue(String key, Object val, String masterName) {
        boolean isNumericField = NUMERIC_FIELDS.contains(key);
        if (!isNumericField) {
            return val;
        }

        boolean isDouble = DOUBLE_FIELDS.contains(key);

        if (val == null) {
            return isDouble ? 0.0 : 0;
        }

        if (val instanceof String) {
            String strVal = ((String) val).trim();
            if (strVal.isEmpty()) {
                return isDouble ? 0.0 : 0;
            }
            // Strip locale-specific thousands separators (e.g. "1,469.00" → "1469.00")
            // before attempting numeric parsing so comma-formatted values are accepted.
            String normalized = strVal.replace(",", "");
            try {
                if (normalized.contains(".")) {
                    return Double.parseDouble(normalized);
                } else {
                    long l = Long.parseLong(normalized);
                    if (l >= Integer.MIN_VALUE && l <= Integer.MAX_VALUE) {
                        return (int) l;
                    }
                    return l;
                }
            } catch (NumberFormatException e) {
                return val; // leave non-parseable strings untouched
            }
        }

        return val;
    }

    @SuppressWarnings("unchecked")
    public static void sanitizeMap(Map<String, Object> map, String masterName) {
        if (map == null) return;

        for (Map.Entry<String, Object> entry : new HashMap<>(map).entrySet()) {
            String key = entry.getKey();
            Object val = entry.getValue();

            if (val instanceof Map) {
                sanitizeMap((Map<String, Object>) val, masterName);
            } else if (val instanceof List) {
                List<?> list = (List<?>) val;
                for (Object item : list) {
                    if (item instanceof Map) {
                        sanitizeMap((Map<String, Object>) item, masterName);
                    }
                }
            } else {
                Object sanitized = sanitizeValue(key, val, masterName);
                map.put(key, sanitized);
            }
        }
    }

    @SuppressWarnings("unchecked")
    public static JSONArray sanitizeMasterData(JSONArray masterDataJsonArray, String masterName) {
        if (masterDataJsonArray == null) return null;

        for (int i = 0; i < masterDataJsonArray.size(); i++) {
            Object obj = masterDataJsonArray.get(i);
            if (obj instanceof Map) {
                sanitizeMap((Map<String, Object>) obj, masterName);
            }
        }
        return masterDataJsonArray;
    }

    public static void sanitizeObjectNode(ObjectNode objectNode, String masterName) {
        if (objectNode == null) return;

        List<String> fieldNames = new ArrayList<>();
        objectNode.fieldNames().forEachRemaining(fieldNames::add);

        for (String key : fieldNames) {
            JsonNode valueNode = objectNode.get(key);
            boolean isNumericField = NUMERIC_FIELDS.contains(key);
            boolean isBooleanField = BOOLEAN_FIELDS.contains(key);

            if (valueNode.isObject()) {
                sanitizeObjectNode((ObjectNode) valueNode, masterName);
            } else if (valueNode.isArray()) {
                ArrayNode arrayNode = (ArrayNode) valueNode;
                for (JsonNode item : arrayNode) {
                    if (item.isObject()) {
                        sanitizeObjectNode((ObjectNode) item, masterName);
                    }
                }
            } else if (isNumericField) {
                boolean isDouble = DOUBLE_FIELDS.contains(key);
                if (valueNode.isNull()) {
                    if (isDouble) {
                        objectNode.put(key, 0.0);
                    } else {
                        objectNode.put(key, 0);
                    }
                } else if (valueNode.isTextual()) {
                    String strVal = valueNode.asText().trim();
                    if (strVal.isEmpty()) {
                        if (isDouble) objectNode.put(key, 0.0);
                        else objectNode.put(key, 0);
                    } else {
                        // Strip locale-specific thousands separators (e.g. "1,469.00" → "1469.00")
                        // before attempting numeric parsing so comma-formatted values are accepted.
                        String normalized = strVal.replace(",", "");
                        try {
                            if (normalized.contains(".")) {
                                objectNode.put(key, Double.parseDouble(normalized));
                            } else {
                                objectNode.put(key, Long.parseLong(normalized));
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }
            } else if (!isBooleanField && valueNode.isNull()) {
                // For non-numeric, non-boolean leaf fields, coerce null → empty string.
                // JSON schema type:"string" does not accept null; using "" satisfies the
                // type constraint while preserving the absence of a meaningful value.
                // This handles fields like locationCode, imageSrc, etc. across all masters.
                objectNode.put(key, "");
            }
        }
    }

    public static final Set<String> BOOLEAN_FIELDS = new HashSet<>(Arrays.asList(
        "active", "isActive", "isMergeAllowed", "enabled", "isStateLevel"
    ));

    /**
     * Ensures numeric fields in schema definitions are typed as number,
     * boolean fields are typed as boolean.
     * For all other fields, the inferrer-detected type is preserved;
     * only if no type is set does it default to "string".
     */
    public static void fixSchemaTypes(JsonNode schemaNode) {
        if (schemaNode == null || !schemaNode.isObject()) return;

        ObjectNode objNode = (ObjectNode) schemaNode;

        if (objNode.has("properties") && objNode.get("properties").isObject()) {
            ObjectNode props = (ObjectNode) objNode.get("properties");
            Iterator<String> fieldNames = props.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode propNode = props.get(fieldName);

                if (propNode.isObject()) {
                    ObjectNode propObj = (ObjectNode) propNode;
                    String currentType = propObj.has("type") ? propObj.get("type").asText() : "";

                    if ("object".equalsIgnoreCase(currentType) || propObj.has("properties")) {
                        fixSchemaTypes(propObj);
                    } else if ("array".equalsIgnoreCase(currentType) || propObj.has("items")) {
                        if (propObj.has("items")) {
                            fixSchemaTypes(propObj.get("items"));
                        }
                    } else {
                        if (NUMERIC_FIELDS.contains(fieldName)) {
                            // Always enforce numeric type for known financial/dimensional fields
                            propObj.put("type", "number");
                        } else if (BOOLEAN_FIELDS.contains(fieldName)) {
                            // Always enforce boolean type for known flag fields
                            propObj.put("type", "boolean");
                        } else if (currentType.isEmpty()) {
                            // Only default to string if the inferrer did not set any type
                            propObj.put("type", "string");
                        }
                        // Otherwise preserve inferrer-detected type (boolean, integer, number, etc.)
                    }
                }
            }
        }

        if (objNode.has("items") && objNode.get("items").isObject()) {
            fixSchemaTypes(objNode.get("items"));
        }
    }

    public static void fixNumericFieldsInSchema(JsonNode schemaNode) {
        fixSchemaTypes(schemaNode);
    }
}
