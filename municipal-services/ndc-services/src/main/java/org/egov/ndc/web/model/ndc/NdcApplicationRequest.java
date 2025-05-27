package org.egov.ndc.web.model.ndc;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import org.egov.common.contract.request.RequestInfo;
import org.egov.ndc.web.model.Workflow;

import java.util.ArrayList;
import java.util.List;

@Data
//@JsonInclude(JsonInclude.Include.NON_NULL)
public class NdcApplicationRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("Applicant")
    private ApplicantRequest applicant;

    @JsonProperty("NdcDetails")
    private List<NdcDetailsRequest> ndcDetails;

    @JsonProperty("Documents")
    private List<DocumentRequest> documents;

    public void addNdcDetailsItem(NdcDetailsRequest ndcDetailsItem) {
        if (this.ndcDetails == null) {
            this.ndcDetails = new ArrayList<>();
        }
        this.ndcDetails.add(ndcDetailsItem);
    }

    public void addDocumentsItem(DocumentRequest documentItem) {
        if (this.documents == null) {
            this.documents = new ArrayList<>();
        }
        this.documents.add(documentItem);
    }
}