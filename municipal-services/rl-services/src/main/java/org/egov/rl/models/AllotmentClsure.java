package org.egov.rl.models;

import java.util.List;
import java.util.UUID;

import javax.validation.constraints.NotNull;

import org.egov.rl.models.workflow.Workflow;
import org.javers.core.metamodel.annotation.Id;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllotmentClsure {

    @Id
    @JsonProperty("id")
    private String id;
    
    @NotNull
	@JsonProperty("tenantId")
	private String tenantId;

    @NotNull
    @JsonProperty("allotmentId")
    private String allotmentId;

    @JsonProperty("status")
    private String status;
    
	@JsonProperty("allotedApplicationNumber")
	private String allotedApplicationNumber;

    @NotNull
    @JsonProperty("reasonForClosure")
    private String reasonForClosure;

    @JsonProperty("amountToBeRefund")
    private String amountToBeRefund;

    @JsonProperty("amountToBeDeducted")
    private String amountToBeDeducted;

    @JsonProperty("refundAmount")
    private String refundAmount;

    @JsonProperty("notesComments")
    private String notesComments;

    @JsonProperty("uploadProof")
    private String uploadProof;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
//    
//	@JsonProperty("workflow")
//	private Workflow workflow;
}