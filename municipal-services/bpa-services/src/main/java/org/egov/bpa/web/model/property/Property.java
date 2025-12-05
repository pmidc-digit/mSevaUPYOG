package org.egov.bpa.web.model.property;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Digits;
import javax.validation.constraints.Max;
import javax.validation.constraints.NotNull;

import org.egov.bpa.web.model.AuditDetails;
import org.egov.bpa.web.model.BPA;
import org.egov.bpa.web.model.landInfo.*;
import org.egov.bpa.web.model.workflow.ProcessInstance;
import org.hibernate.validator.constraints.SafeHtml;
import org.javers.core.metamodel.annotation.DiffIgnore;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.*;
import lombok.Builder.Default;
import lombok.experimental.SuperBuilder;

/**
 * Property
 */

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder
public class Property extends PropertyInfo {

	@JsonProperty("acknowldgementNumber")
	@SafeHtml
	private String acknowldgementNumber;

	@JsonProperty("propertyType")
	@SafeHtml
	private String propertyType;

	@JsonProperty("ownershipCategory")
	@SafeHtml
	private String ownershipCategory;

	@JsonProperty("owners")
	@Valid
	private List<OwnerInfo> owners;

	@JsonProperty("institution")
	private Institution institution;

	@JsonProperty("creationReason")
	@NotNull(message="The value provided is either Invald or null")
	@Default
	private CreationReason creationReason = CreationReason.CREATE;
	
	@JsonProperty("usageCategory")
	@SafeHtml
	private String usageCategory;

	@Max(value = 500)
	@JsonProperty("noOfFloors")
	private Long noOfFloors;

	@Digits(integer = 8, fraction = 2)
	@JsonProperty("landArea")
	private Double landArea;

	@Digits(integer = 8, fraction = 2)
	@JsonProperty("superBuiltUpArea")
	private BigDecimal superBuiltUpArea;

	@JsonProperty("source")
	@Default
	private Source source = Source.OBPAS;

	@JsonProperty("channel")
	@Default
	private Channel channel = Channel.SYSTEM;
	
	@Builder.Default
	@JsonProperty("isactive")
	private boolean isactive = false;
	
	
	@Builder.Default
	@JsonProperty("isinactive")
	private boolean isinactive = false;

	@JsonProperty("documents")
	@Valid
	@DiffIgnore
	private List<Document> documents;

	@JsonProperty("units")
	@Valid
	private List<Unit> units;

	@JsonProperty("dueAmount")
	private String dueAmount;
	
	@JsonProperty("dueAmountYear")
	private String dueAmountYear;
	
	@DiffIgnore
	@JsonProperty("additionalDetails")
	private JsonNode additionalDetails;
	
	@JsonProperty("auditDetails")
	private AuditDetails auditDetails;

	@JsonProperty("workflow")
	@DiffIgnore
	private ProcessInstance workflow;
	
	@JsonProperty("AlternateUpdated")
	private boolean AlternateUpdated;

	@Builder.Default
	@JsonProperty("isOldDataEncryptionRequest")
	private boolean isOldDataEncryptionRequest = false;
	
	@JsonProperty("address")
	private Address address;

	public Property addOwnersItem(OwnerInfo ownersItem) {
		if (this.owners == null) {
			this.owners = new ArrayList<>();
		}

		if (null != ownersItem)
			this.owners.add(ownersItem);
		return this;
	}
	
	
	public Property addUnitsItem(Unit unit) {
		if (this.units == null) {
			this.units = new ArrayList<>();
		}

		if (null != unit)
			this.units.add(unit);
		return this;
	}

	public Property addDocumentsItem(Document documentsItem) {
		if (this.documents == null) {
			this.documents = new ArrayList<>();
		}

		if (null != documentsItem)
			this.documents.add(documentsItem);
		return this;
	}

}

