package org.egov.noc.calculator.web.models.noc;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


import java.util.ArrayList;
import java.util.List;

@Data
//@JsonInclude(JsonInclude.Include.NON_NULL)
public class NocApplicationRequest {

//    @JsonProperty("RequestInfo")
//    private RequestInfo requestInfo;

    @JsonProperty("Applicant")
    private ApplicantRequest applicant;

    @JsonProperty("NocDetails")
    private List<NocDetailsRequest> nocDetails;

    @JsonProperty("Documents")
    private List<DocumentRequest> documents;

    public void addNocDetailsItem(NocDetailsRequest nocDetailsItem) {
        if (this.nocDetails == null) {
            this.nocDetails = new ArrayList<>();
        }
        this.nocDetails.add(nocDetailsItem);
    }

    public void addDocumentsItem(DocumentRequest documentItem) {
        if (this.documents == null) {
            this.documents = new ArrayList<>();
        }
        this.documents.add(documentItem);
    }
}