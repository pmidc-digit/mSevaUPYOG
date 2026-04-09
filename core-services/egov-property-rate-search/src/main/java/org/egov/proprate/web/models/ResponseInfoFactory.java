package org.egov.proprate.web.models;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.springframework.stereotype.Component;

@Component
public class ResponseInfoFactory {

    public ResponseInfo createResponseInfoFromRequestInfo(RequestInfo requestInfo, Boolean success) {
        String apiId = requestInfo != null ? requestInfo.getApiId() : "";
        String ver = requestInfo != null ? requestInfo.getVer() : "";
        Long ts = System.currentTimeMillis();
        String resMsgId = "uief87324"; // Usually a UUID
        String msgId = requestInfo != null ? requestInfo.getMsgId() : "";
        String status = success ? "SUCCESSFUL" : "FAILED";

        return ResponseInfo.builder()
                .apiId(apiId)
                .ver(ver)
                .ts(ts)
                .resMsgId(resMsgId)
                .msgId(msgId)
                .resMsgId(resMsgId)
                .status(status)
                .build();
    }
}