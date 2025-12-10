package org.egov.pt.calculator.web.models.rl.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Digits;
import javax.validation.constraints.Max;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Property
 */

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RLProperty {

	@JsonProperty("propertyId")
	private String propertyId;

	@JsonProperty("propertyName")
	private String propertyName;
	
	@JsonProperty("allotmentType")
	private String allotmentType;  /// Rent or Rease

	@Digits(integer = 8, fraction = 2)
	@JsonProperty("propertySizeOrArea")
	private Double propertySizeOrArea;
	
	@JsonProperty("address")
	private String address;

	@JsonProperty("geoLocation")
	private GeoLocation geoLocation;
	
	@JsonProperty("propertyImage")
	private String propertyImage;
	
	@JsonProperty("propertyType")
//	@SafeHtml
	private String propertyType;
	
	@JsonProperty("locationType")
	private String locationType;

	@JsonProperty("baseRent")
	private String baseRent;
	
	@JsonProperty("securityDeposit")
	private String securityDeposit;
	
	@JsonProperty("financialYear")
	private String financialYear;
	
	@JsonProperty("taxApplicable")
	private boolean taxApplicable;

	@JsonProperty("refundApplicableOnDiscontinuation")
	private boolean refundApplicableOnDiscontinuation;
	
	@JsonProperty("cowCessApplicable")
	private boolean cowCessApplicable;

//	@JsonProperty("increment_cycle")
//	private String incrementCycle;;
//	
//	@JsonProperty("increment_applicable")
//	private boolean incrementApplicable;;
//	
//	@JsonProperty("increment_percentage")
//	private String incrementPercentage;;
//	
//	@JsonProperty("last_payment_percantage")
//	private String lastPaymentPercantage;
//
//
////	@JsonProperty("institution")
////	private Institution institution;
//
////	@JsonProperty("creationReason")
////	@NotNull(message="The value provided is either Invald or null")
////	private CreationReason creationReason;
//	
//
////	@Max(value = 500)
////	@JsonProperty("noOfFloors")
////	private Long noOfFloors;
//
////	@Digits(integer = 8, fraction = 2)
////	@JsonProperty("landArea")
////	private Double landArea;
//
////	@Digits(integer = 8, fraction = 2)
////	@JsonProperty("superBuiltUpArea")
////	private BigDecimal superBuiltUpArea;
////
////	@JsonProperty("source")
////	private Source source;
////
////	@JsonProperty("channel")
////	private Channel channel;
////
////	@JsonProperty("documents")
////	@Valid
////	@DiffIgnore
////	private List<Document> documents;
////
////	@JsonProperty("units")
////	@Valid
////	private List<Unit> units;
////
////	@JsonProperty("dueAmount")
////	private String dueAmount;
////	
////	@JsonProperty("dueAmountYear")
////	private String dueAmountYear;
//	
//	@DiffIgnore
//	@JsonProperty("additionalDetails")
//	private JsonNode additionalDetails;
//	
//	@JsonProperty("auditDetails")
//	private AuditDetails auditDetails;
//
////	@JsonProperty("workflow")
////	@DiffIgnore
////	private ProcessInstance workflow;
//	
////	@JsonProperty("AlternateUpdated")
////	private boolean AlternateUpdated;
////
////	@Builder.Default
////	@JsonProperty("isOldDataEncryptionRequest")
////	private boolean isOldDataEncryptionRequest = false;

		
}

