package org.egov.ndc.web.model.ndc;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.egov.common.contract.request.RequestInfo;

import java.util.List;

@Data
public class NdcApplicationRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("Applicant")
    private ApplicantRequest applicant;

    @JsonProperty("NdcDetails")
    private List<NdcDetailsRequest> ndcDetails;
}