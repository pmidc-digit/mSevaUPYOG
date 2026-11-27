package org.egov.investpunjab.models;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestPunjabStatusUpdateResponse {

    @JsonProperty("Status")
    @JsonAlias({"status", "success", "Success"})
    private Boolean status;

    @JsonProperty("Msg")
    @JsonAlias({"msg", "message", "Message", "errorMessage"})
    private String msg;

    @JsonProperty("ErrorCode")
    @JsonAlias({"errorCode", "errorId", "ErrorId", "code", "statusCode", "statuscode"})
    private String errorCode;
}
