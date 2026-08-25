package org.egov.pgr.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.request.RequestInfo;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DgrRetryRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("serviceRequestIds")
    private List<String> serviceRequestIds;

    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("fromBeginning")
    private Boolean fromBeginning;
}
