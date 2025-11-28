package org.egov.rl.models;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.egov.rl.models.enums.Channel;
import org.egov.rl.models.enums.CreationReason;
import org.egov.rl.models.enums.Source;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.workflow.Workflow;
import org.javers.core.metamodel.annotation.DiffIgnore;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
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
public class AllotmentDetails {
	
	@JsonProperty("id")
	private String id;
	
	@JsonProperty("property_id")
	private String propertyId;

	@JsonProperty("tenant_id")
	private String tenantId;
	
	@JsonProperty("is_auto_renewal")
	private boolean isAutoRenewal; // default false

	@JsonProperty("application_status")
	private int applicationStatus; // 0-draft,1-Saved,2-Submitted,3-Active and runing
	/// after final approval,4-InActive
	
	@JsonProperty("status")
	private String status;
	
	@JsonProperty("application_number")
	private String applicationNumber;
	
	@JsonProperty("previous_application_number")
	private String previousApplicationNumber;

	@JsonProperty("application_type")
	private String applicationType;

	/* ------------Allotment Section---------------------- */
	@JsonProperty("start_date")
	private long startDate;

	@JsonProperty("end_date")
	private long endDate;
	
	@JsonProperty("term_and_condition")
	private String termAndCondition;;
	
	@JsonProperty("penalty_type")
	private String penaltyType;;
	
	@JsonProperty("witness_details")
	private String witnessDetails;
	
	@JsonProperty("created_time")
	private long createdTime;
	
	@JsonProperty("created_by")
	private String createdBy;
	
	@JsonProperty("Document")
	private List<Document> documents;
	
	@JsonProperty("audit_details")
	private AuditDetails auditDetails;
	
	@JsonProperty("OwnerInfo")
    private List<OwnerInfo> ownerInfo;
	
	@JsonProperty("additional_details")
    private JsonNode additionalDetails;
	
	@JsonProperty("workflow_code")
	private String workflowCode;
	
	@JsonProperty("workflow")
	private Workflow workflow;
	
	public AllotmentDetails addOwnersItem(OwnerInfo ownersItem) {
		if (this.ownerInfo == null) {
			this.ownerInfo = new ArrayList<>();
		}

		if (null != ownersItem)
			this.ownerInfo.add(ownersItem);
		return this;
	}
	
	public AllotmentDetails addDocumentsItem(Document documentsItem) {
		if (this.documents == null) {
			this.documents = new ArrayList<>();
		}

		if (null != documentsItem)
			this.documents.add(documentsItem);
		return this;
	}
	
	@Override
	public String toString() {
	    return "AllotmentDetails{" +
	            "id='" + id + '\'' +
	            ", propertyId='" + propertyId + '\'' +
	            ", tenantId='" + tenantId + '\'' +
	            ", isAutoRenewal=" + isAutoRenewal +
	            ", applicationStatus=" + applicationStatus +
	            ", status=" + status +
	            ", applicationNumber='" + applicationNumber + '\'' +
	            ", previousApplicationNumber='" + previousApplicationNumber + '\'' +
	            ", applicationType='" + applicationType + '\'' +
	            ", startDate=" + startDate +
	            ", endDate=" + endDate +
	            ", termAndCondition='" + termAndCondition + '\'' +
	            ", penaltyType='" + penaltyType + '\'' +
	            ", witnessDetails=" + witnessDetails +
	            ", createdTime=" + createdTime +
	            ", createdBy='" + createdBy + '\'' +
	            ", documents=" + documents +
	            ", auditDetails=" + auditDetails +
	            ", ownerInfo=" + ownerInfo +
	            ", additionalDetails=" + additionalDetails +
	            ", workflowCode='" + workflowCode + '\'' +
	            ", workflow=" + workflow +
	            '}';
	}
}