package org.egov.ptr.models;

import java.util.ArrayList;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.*;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.*;

import org.egov.ptr.models.*;

@ApiModel(description = "A Object holds the basic data for a Pet Registration Application")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetRegistrationApplication {

	@JsonProperty("id")
	private String id;

	@NotBlank
	@ApiModelProperty(required = true, value = "Tenant ID for the application")
	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("applicationNumber")
	private String applicationNumber;

	@NotBlank
	@ApiModelProperty(required = true, value = "Name of the applicant")
	@JsonProperty("applicantName")
	private String applicantName;

	@JsonProperty("fatherName")
	private String fatherName;

	@NotBlank
	@Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
	@ApiModelProperty(required = true, value = "Applicant mobile number")
	@JsonProperty("mobileNumber")
	private String mobileNumber;

	@Email
	@JsonProperty("emailId")
	private String emailId;

	@Valid
	@JsonProperty("address")
	private Address address;

	@Valid
	@JsonProperty("applicant")
	private Applicant applicant;

	@JsonProperty("auditDetails")
	private AuditDetails auditDetails;

	@Valid
	@JsonProperty("petDetails")
	private PetDetails petDetails;

	@JsonProperty("renewalAuditDetails")
	private PetRenewalAuditDetails renewalAuditDetails;

	@NotBlank
	@ApiModelProperty(required = true, value = "Type of application")
	@JsonProperty("applicationType")
	private String applicationType;

	@JsonProperty("validityDate")
	private Long validityDate;

	@JsonProperty("status")
	private String status;

	@JsonProperty("expireFlag")
	private Boolean expireFlag;

	@JsonProperty("petToken")
	private String petToken;

	@JsonProperty("previousApplicationNumber")
	private String previousApplicationNumber;

	@JsonProperty("propertyId")
	private String propertyId;

	@Valid
	@JsonProperty("documents")
	private List<Document> documents;

	@Valid
	@JsonProperty("workflow")
	private Workflow workflow;

	public PetRegistrationApplication addDocumentsItem(Document documentsItem) {
		if (this.documents == null) {
			this.documents = new ArrayList<>();
		}
		if (documentsItem != null) {
			this.documents.add(documentsItem);
		}
		return this;
	}
}
