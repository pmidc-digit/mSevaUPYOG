package org.egov.noc.calculator.web.models.noc;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NocApplicationResponse {
    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("Applicant")
    private ApplicantRequest applicant;

    @JsonProperty("nocDetails")
    private List<NocDetailsRequest> nocDetails;

    @JsonProperty("documents")
    private List<DocumentRequest> documents;

    public void addNdcDetailsItem(NocDetailsRequest ndcDetailsItem) {
        if (this.nocDetails == null) {
            this.nocDetails = new ArrayList<>();
        }
        this.nocDetails.add(ndcDetailsItem);
    }

    public void addDocumentsItem(DocumentRequest documentItem) {
        if (this.documents == null) {
            this.documents = new ArrayList<>();
        }
        this.documents.add(documentItem);
    }
}