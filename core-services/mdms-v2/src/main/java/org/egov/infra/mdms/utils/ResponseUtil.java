package org.egov.infra.mdms.utils;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.infra.mdms.model.Mdms;
import org.egov.infra.mdms.model.MdmsResponseV2;
import org.egov.infra.mdms.model.SchemaDefinition;
import org.egov.infra.mdms.model.SchemaDefinitionResponse;

import java.util.List;

public class ResponseUtil {

    private ResponseUtil(){}

    public static ResponseInfo createResponseInfoFromRequestInfo(final RequestInfo requestInfo, final Boolean success) {

        final String apiId = requestInfo != null ? requestInfo.getApiId() : "";
        final String ver = requestInfo != null ? requestInfo.getVer() : "";

        Long ts = null;
        if (requestInfo != null)
            ts = requestInfo.getTs();

        final String resMsgId = "uief87324";
        final String msgId = requestInfo != null ? requestInfo.getMsgId() : "";	
        final String responseStatus = success ? "successful" : "failed";

        return ResponseInfo.builder()
                .apiId(apiId)
                .ver(ver)
                .ts(ts)
                .resMsgId(resMsgId)
                .msgId(msgId)
                .status(responseStatus)
                .build();
    }

    public static SchemaDefinitionResponse getSchemaDefinitionResponse(
            RequestInfo requestInfo,
            List<SchemaDefinition> schemaDefinitions) {

        ResponseInfo responseInfo = createResponseInfoFromRequestInfo(requestInfo, Boolean.TRUE);

        return SchemaDefinitionResponse.builder()
                .schemaDefinitions(schemaDefinitions)
                .responseInfo(responseInfo)
                .build();
    }

    public static MdmsResponseV2 getMasterDataV2Response(RequestInfo requestInfo, List<Mdms> masterDataList){
        ResponseInfo responseInfo = createResponseInfoFromRequestInfo(requestInfo, Boolean.TRUE);
        MdmsResponseV2 response = MdmsResponseV2.builder().mdms(masterDataList).responseInfo(responseInfo).build();
        return response;
    }

}
