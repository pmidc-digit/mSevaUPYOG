package org.egov.infra.mdms.utils;

import com.fasterxml.jackson.databind.JsonNode;
import org.egov.infra.mdms.model.MdmsRequest;
import org.egov.tracer.model.CustomException;
import org.json.JSONObject;
import org.springframework.util.StringUtils;

import java.util.stream.IntStream;
import static org.egov.infra.mdms.utils.MDMSConstants.*;

public class CompositeUniqueIdentifierGenerationUtil {

    private CompositeUniqueIdentifierGenerationUtil() {
    }

    /**
     * This method creates composite unique identifier based on the attributes
     * provided
     * in x-unique-key param.
     * 
     * @param schemaObject
     * @param mdmsRequest
     * @return
     */
    public static String getUniqueIdentifier(JSONObject schemaObject, MdmsRequest mdmsRequest) {
        if (schemaObject == null || !schemaObject.has(X_UNIQUE_KEY) || schemaObject.isNull(X_UNIQUE_KEY)) {
            JsonNode data = mdmsRequest.getMdms().getData();
            if (data != null && data.has("id") && !data.get("id").isNull()) {
                return data.get("id").asText();
            }
            if (data != null && data.has("code") && !data.get("code").isNull()) {
                return data.get("code").asText();
            }
            return mdmsRequest.getMdms().getId() != null ? mdmsRequest.getMdms().getId()
                    : java.util.UUID.randomUUID().toString();
        }

        org.json.JSONArray uniqueFieldPaths = schemaObject.getJSONArray(X_UNIQUE_KEY);

        JsonNode data = mdmsRequest.getMdms().getData();
        StringBuilder compositeUniqueIdentifier = new StringBuilder();

        // Build composite unique identifier
        IntStream.range(0, uniqueFieldPaths.length()).forEach(i -> {
            String fieldPath = uniqueFieldPaths.getString(i);
            JsonNode chunkNode = data.at(getJsonPointerExpressionFromDotSeparatedPath(fieldPath));
            String uniqueIdentifierChunk = chunkNode != null && !chunkNode.isMissingNode() && !chunkNode.isNull()
                    ? chunkNode.asText()
                    : "";

            // Fallback to mdms.id if the unique field in x-unique is absent on data
            if (StringUtils.isEmpty(uniqueIdentifierChunk) && mdmsRequest.getMdms() != null) {
                if (mdmsRequest.getMdms().getId() != null) {
                    uniqueIdentifierChunk = mdmsRequest.getMdms().getId();
                } else if ("id".equalsIgnoreCase(fieldPath) || (uniqueFieldPaths.length() == 1 && "id".equalsIgnoreCase(uniqueFieldPaths.getString(0)))) {
                    String generatedUuid = java.util.UUID.randomUUID().toString();
                    mdmsRequest.getMdms().setId(generatedUuid);
                    uniqueIdentifierChunk = generatedUuid;
                }
            }

            // Throw error in case value against unique identifier is empty
            if (StringUtils.isEmpty(uniqueIdentifierChunk)) {
                throw new CustomException("UNIQUE_IDENTIFIER_EMPTY_ERR",
                        "Values defined against unique fields cannot be empty.");
            }

            compositeUniqueIdentifier.append(uniqueIdentifierChunk);

            if (i != (uniqueFieldPaths.length() - 1))
                compositeUniqueIdentifier.append(DOT_SEPARATOR);
        });

        return compositeUniqueIdentifier.toString();
    }

    /**
     * This method creates a JSON pointer expression from dot separated path.
     * 
     * @param dotSeparatedPath
     * @return
     */
    public static String getJsonPointerExpressionFromDotSeparatedPath(String dotSeparatedPath) {
        return FORWARD_SLASH + dotSeparatedPath.replaceAll(DOT_REGEX, FORWARD_SLASH);
    }

    /**
     * This method creates JSON path expression from dot separated path.
     * 
     * @param dotSeparatedPath
     * @return
     */
    public static String getJsonPathExpressionFromDotSeparatedPath(String dotSeparatedPath) {
        return DOLLAR_DOT + dotSeparatedPath;
    }

}
