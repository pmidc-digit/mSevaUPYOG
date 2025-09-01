package org.egov.noc.calculator.web.models.noc;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.egov.common.contract.request.RequestInfo;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NocDeleteRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("active")
    private Boolean active;
}