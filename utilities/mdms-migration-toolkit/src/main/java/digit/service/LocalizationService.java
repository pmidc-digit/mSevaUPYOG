package digit.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import digit.config.Configuration;
import digit.repository.ServiceRequestRepository;
import digit.web.models.CreateMessagesRequest;
import digit.web.models.Message;
import lombok.extern.slf4j.Slf4j;

/**
 * Generates and pushes DIGIT Workbench-compatible localization keys to
 * egov-localization service.
 *
 * Key patterns supported:
 * - SCHEMA_<MODULE>_<MASTER> → Schema title (e.g.
 * SCHEMA_TRADELICENSE_TRADETYPE)
 * - <MODULE>_<MASTER>_<FIELD> → Field label (e.g. TRADELICENSE_TRADETYPE_CODE)
 * - <MODULE>_<MASTER>_<NESTED_FIELD> → Deeply nested fields are FLATTENED to
 * this pattern
 * (e.g. additionalDetails.enabledActions.create.disableUpload
 * → ADVERTISEMENT_DOCUMENTS_DISABLEUPLOAD)
 * - <MODULE>_<MASTER>_<STRING_VALUE> → String value appearing in data
 * (e.g. TRADELICENSE_TRADETYPE_ARCHITECTCLASSA)
 *
 * Keys NOT generated here (Workbench-internal):
 * - WBH_* keys (e.g. WBH_ISACTIVE, WBH_BOOLEAN_VALUE_TRUE) — part of
 * Workbench's own bundle
 * - COMMON_CORE_* keys — built-in Workbench UI collapse/section labels
 * - Cross-schema array item labels (e.g.
 * ADVERTISEMENT_ADVERTISEMENT_DROPDOWNDATA -0)
 */
@Service
@Slf4j
public class LocalizationService {

    @Autowired
    private Configuration config;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    /**
     * Extracts and pushes localization keys for a JSON Schema Definition.
     * Traverses the schema's "properties" recursively so that even deeply nested
     * object and array-of-object fields are flattened to MODULE_MASTER_FIELD
     * format.
     *
     * @param schemaCode  e.g., "TradeLicense.Rebate" or "Advertisement.Documents"
     * @param schemaNode  The JSON schema definition JsonNode
     * @param requestInfo RequestInfo from the caller
     * @param tenantId    State-level tenant (e.g., "pb")
     */
    public void pushSchemaLocalization(String schemaCode, JsonNode schemaNode, RequestInfo requestInfo,
            String tenantId) {
        if (schemaCode == null || schemaNode == null)
            return;

        String[] parts = schemaCode.split("\\.");
        String module = parts[0];
        String master = parts.length > 1 ? parts[1] : parts[0];

        List<Message> messages = new ArrayList<>();
        Set<String> processedCodes = new HashSet<>();

        // SCHEMA_<MODULE>_<MASTER> key (e.g. SCHEMA_ADVERTISEMENT_CALCULATIONTYPE)
        String schemaKey = "SCHEMA_" + cleanCode(module) + "_" + cleanCode(master);
        addMessage(messages, processedCodes, schemaKey, humanize(module) + " " + humanize(master));

        // Recursively extract all field keys from schema properties
        extractSchemaProperties(module, master, schemaNode, messages, processedCodes);

        sendLocalizationRequest(requestInfo, tenantId, messages);
    }

    /**
     * Recursively traverses a schema node and generates MODULE_MASTER_FIELD keys
     * for every property found at any nesting level.
     * Deeply nested fields are FLATTENED — intermediate path segments are dropped.
     * E.g. additionalDetails.enabledActions.create.disableUpload
     * → ADVERTISEMENT_DOCUMENTS_DISABLEUPLOAD (not
     * ADVERTISEMENT_DOCUMENTS_ADDITIONALDETAILS_ENABLEDACTIONS_...)
     */
    private void extractSchemaProperties(String module, String master, JsonNode schemaNode,
            List<Message> messages, Set<String> processedCodes) {
        if (schemaNode == null || !schemaNode.has("properties") || !schemaNode.get("properties").isObject()) {
            return;
        }

        Iterator<Map.Entry<String, JsonNode>> fields = schemaNode.get("properties").fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String fieldName = entry.getKey();
            JsonNode fieldNode = entry.getValue();

            // MODULE_MASTER_FIELD (e.g. ADVERTISEMENT_DOCUMENTS_CODE)
            String fieldKey = cleanCode(module) + "_" + cleanCode(master) + "_" + cleanCode(fieldName);
            addMessage(messages, processedCodes, fieldKey, humanize(fieldName));

            // Recurse into nested object properties
            if (fieldNode.isObject() && fieldNode.has("properties")) {
                extractSchemaProperties(module, master, fieldNode, messages, processedCodes);
            }

            // Recurse into array items (regardless of nesting depth)
            if (fieldNode.isObject() && fieldNode.has("items")) {
                JsonNode itemsNode = fieldNode.get("items");
                if (itemsNode.isObject()) {
                    // Items have nested properties (array of objects)
                    if (itemsNode.has("properties")) {
                        extractSchemaProperties(module, master, itemsNode, messages, processedCodes);
                    }
                }
            }
        }
    }

    /**
     * Extracts and pushes localization keys from a master data record (JSON).
     * Recursively traverses all fields and string values.
     *
     * @param module         Module name (e.g. "Advertisement")
     * @param master         Master name (e.g. "Documents")
     * @param masterDataNode Individual master data record JsonNode
     * @param requestInfo    RequestInfo from the caller
     * @param tenantId       Tenant ID
     */
    public void pushMasterDataLocalization(String module, String master, JsonNode masterDataNode,
            RequestInfo requestInfo, String tenantId) {
        if (masterDataNode == null)
            return;

        List<Message> messages = new ArrayList<>();
        Set<String> processedCodes = new HashSet<>();

        // SCHEMA_<MODULE>_<MASTER> (in case schema localization wasn't already pushed)
        String schemaKey = "SCHEMA_" + cleanCode(module) + "_" + cleanCode(master);
        addMessage(messages, processedCodes, schemaKey, humanize(module) + " " + humanize(master));

        // Recursively extract field-name and value-based keys
        extractMasterDataNode(module, master, masterDataNode, messages, processedCodes);

        sendLocalizationRequest(requestInfo, tenantId, messages);
    }

    /**
     * Recursively traverses a master data JsonNode (object or array) and generates:
     * - MODULE_MASTER_FIELDNAME for every field name encountered at any depth
     * - String values are also registered as-is (e.g. "ARCHITECT.CLASSA" →
     * "Architect Class A")
     */
    private void extractMasterDataNode(String module, String master, JsonNode node,
            List<Message> messages, Set<String> processedCodes) {
        if (node == null)
            return;

        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String fieldName = entry.getKey();
                JsonNode valNode = entry.getValue();

                // MODULE_MASTER_FIELD key (flattened regardless of nesting depth)
                String fieldKey = cleanCode(module) + "_" + cleanCode(master) + "_" + cleanCode(fieldName);
                addMessage(messages, processedCodes, fieldKey, humanize(fieldName));

                if (valNode.isTextual()) {
                    String textValue = valNode.asText().trim();
                    // Skip boolean-like strings, empty, or UUIDs
                    if (!textValue.isEmpty()
                            && !textValue.equalsIgnoreCase("true")
                            && !textValue.equalsIgnoreCase("false")
                            && !isUuid(textValue)) {
                        // Raw value key (e.g. "ARCHITECT.CLASSA")
                        addMessage(messages, processedCodes, textValue, humanize(textValue));
                        // Prefixed value key (e.g. ADVERTISEMENT_DOCUMENTS_ARCHITECTCLASSA)
                        String prefixedValKey = cleanCode(module) + "_" + cleanCode(master) + "_"
                                + cleanCode(textValue);
                        addMessage(messages, processedCodes, prefixedValKey, humanize(textValue));
                    }
                } else if (valNode.isContainerNode()) {
                    extractMasterDataNode(module, master, valNode, messages, processedCodes);
                }
            }
        } else if (node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual()) {
                    String textVal = item.asText().trim();
                    if (!textVal.isEmpty() && !isUuid(textVal)) {
                        addMessage(messages, processedCodes, textVal, humanize(textVal));
                        String prefixedValKey = cleanCode(module) + "_" + cleanCode(master) + "_" + cleanCode(textVal);
                        addMessage(messages, processedCodes, prefixedValKey, humanize(textVal));
                    }
                } else if (item.isContainerNode()) {
                    extractMasterDataNode(module, master, item, messages, processedCodes);
                }
            }
        }
    }

    /**
     * Sends CreateMessagesRequest to egov-localization API.
     */
    public void sendLocalizationRequest(RequestInfo requestInfo, String tenantId, List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            log.info("No localization messages to push.");
            return;
        }

        CreateMessagesRequest request = CreateMessagesRequest.builder()
                .requestInfo(requestInfo)
                .tenantId(tenantId)
                .messages(messages)
                .build();

        String uri = config.getLocalizationHost()
                + config.getLocalizationContextPath()
                + config.getLocalizationUpsertEndpoint();
        try {
            log.info("Pushing {} localization messages for tenant '{}' to: {}", messages.size(), tenantId, uri);
            serviceRequestRepository.fetchResult(new StringBuilder(uri), request);
            log.info("Successfully pushed localization messages.");
        } catch (Exception e) {
            log.error("Failed to push localization messages: {}", e.getMessage(), e);
        }
    }

    /**
     * Busts the egov-localization cache for the given tenantId.
     *
     * Should be called after all localization messages for a migration have been
     * pushed, so the UI immediately reflects the new keys without a service restart.
     *
     * Equivalent to:
     * POST {localizationHost}/localization/messages/cache-bust
     * Body: { "RequestInfo": {...}, "tenantId": "pb" }
     *
     * This call is safe — any error is caught and logged without interrupting
     * the migration flow.
     *
     * @param requestInfo RequestInfo from the originating migration request
     * @param tenantId    Tenant whose cache should be cleared (e.g. "pb")
     */
    public void bustLocalizationCache(RequestInfo requestInfo, String tenantId) {
        String uri = config.getLocalizationHost() + config.getLocalizationCacheBustEndpoint();

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("RequestInfo", requestInfo);
        requestBody.put("tenantId", tenantId);

        try {
            log.info("Busting localization cache for tenantId: '{}' at: {}", tenantId, uri);
            serviceRequestRepository.fetchResult(new StringBuilder(uri), requestBody);
            log.info("Localization cache-bust successful for tenantId: '{}'.", tenantId);
        } catch (Exception e) {
            log.warn("Localization cache-bust failed for tenantId: '{}'. UI may show stale keys until next restart. Error: {}",
                    tenantId, e.getMessage());
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void addMessage(List<Message> messages, Set<String> processedCodes, String code, String messageText) {
        if (code != null && !code.trim().isEmpty() && !processedCodes.contains(code)) {
            processedCodes.add(code);
            messages.add(Message.builder()
                    .code(code)
                    .message(messageText != null ? messageText : code)
                    .module(config.getLocalizationDefaultModule())
                    .locale(config.getLocalizationDefaultLocale())
                    .build());
        }
    }

    /**
     * Converts any non-alphanumeric characters to "_", collapses consecutive
     * underscores, uppercases.
     * e.g. "hasDropdown" → "HASDROPDOWN"
     * "APPLICANT.ADVERTISEMENT.SAMPLE.DOC" → "APPLICANT_ADVERTISEMENT_SAMPLE_DOC"
     */
    public static String cleanCode(String input) {
        if (input == null)
            return "";
        return input.replaceAll("[^a-zA-Z0-9]", "_").replaceAll("_+", "_").replaceAll("^_|_$", "").toUpperCase();
    }

    /**
     * Converts a camelCase / dot.separated / UPPER_CASE identifier to a
     * human-readable label.
     * e.g. "hasDropdown" → "Has Dropdown"
     * "disableUpload" → "Disable Upload"
     * "ARCHITECT.CLASSA" → "Architect Classa"
     */
    public static String humanize(String input) {
        if (input == null || input.trim().isEmpty())
            return "";
        String s = input.replaceAll("([a-z])([A-Z])", "$1 $2")
                .replaceAll("[._\\-]+", " ");
        StringBuilder sb = new StringBuilder();
        for (String word : s.trim().split("\\s+")) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }
        return sb.toString().trim();
    }

    /**
     * Returns true if the string looks like a UUID — these are never useful as
     * localization keys.
     */
    private static boolean isUuid(String value) {
        return value != null && value.matches(
                "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
    }
}
