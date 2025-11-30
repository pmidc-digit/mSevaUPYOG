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
	@JsonProperty("tenant_id")
	private String tenantId;

    @NotNull
    @JsonProperty("allotment_id")
    private String allotmentId;

    @JsonProperty("status")
    private String status;
    
	@JsonProperty("closed_application_number")
	private String closedApplicationNumber;

    @NotNull
    @JsonProperty("reason_for_clsure")
    private String reasonForClosure;

    @JsonProperty("amount_to_be_refund")
    private String amountToBeRefund;

    @JsonProperty("amount_to_be_deducted")
    private String amountToBeDeducted;

    @JsonProperty("refund_amount")
    private String refundAmount;

    @JsonProperty("notes_comments")
    private String notesComments;

    @JsonProperty("upload_proof")
    private String uploadProof;

    @JsonProperty("audit_details")
    private AuditDetails auditDetails;
    
	@JsonProperty("workflow")
	private Workflow workflow;
}