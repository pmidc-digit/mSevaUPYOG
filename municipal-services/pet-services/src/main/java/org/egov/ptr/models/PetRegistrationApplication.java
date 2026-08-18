package org.egov.ptr.models;

import java.util.ArrayList;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetRegistrationApplication {

	@JsonProperty("id")
	private String id;

	@NotBlank
	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("applicationNumber")
	private String applicationNumber;

	@JsonProperty("fatherName")
	private String fatherName;

	@Valid
	@JsonProperty("address")
	private Address address;

	@Valid
	@JsonProperty("owner")
	private Owner owner;

	@JsonProperty("auditDetails")
	private AuditDetails auditDetails;

	@Valid
	@JsonProperty("petDetails")
	private PetDetails petDetails;

	@JsonProperty("renewalAuditDetails")
	private PetRenewalAuditDetails renewalAuditDetails;

	@NotBlank
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

	@JsonProperty("petRegistrationNumber")
	private String petRegistrationNumber;

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
