package org.egov.rl.services.models;

import java.util.List;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import org.egov.common.contract.request.Role;
import org.egov.rl.services.models.enums.Status;
import org.hibernate.validator.constraints.SafeHtml;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OwnerInfo { 


	@SafeHtml
	@JsonProperty("ownerId")
	private String ownerId;
	
	@JsonProperty("allotmentId")
	private String allotmentId;

	@JsonProperty("userId")
	private long userId;

    
    @JsonProperty("userUuid")
	private String userUuid;

    
	@JsonProperty("tenantId")
	private String tenantId;
	
	@SafeHtml
	@JsonProperty("gender")
	private String gender;

	@SafeHtml
	@JsonProperty("fatherOrHusbandName")
	private String fatherOrHusbandName;

	@SafeHtml
	@JsonProperty("status")
	private Status status;

	@JsonProperty("isPrimaryOwner")
	private Boolean isPrimaryOwner;

	@JsonProperty("ownershipPercentage")
	private Double ownerShipPercentage;

	@NotNull
	@SafeHtml
	@JsonProperty("ownerType")
	private String ownerType;
	
	@NotNull
    @JsonProperty("name")
	private String name;

	
	@Pattern(regexp = "(^[4-9][0-9]{9}$)", message = "Inavlid mobile number, should start with 4-9 and contain ten digits of 0-9")
    @NotNull
    @SafeHtml
    @JsonProperty("emailId")
	private String emailId;

	@JsonProperty("mobileNo")
	private String mobileNo;
	
    @JsonProperty("roles")
    private List<Role> roles;
    
    @JsonProperty("locale")
    private String locale;

    @JsonProperty("type")
    private String type;

	@JsonProperty("permanentAddress")
	private Address permanentAddress;
	
	@JsonProperty("correspondenceAddress")
	private Address correspondenceAddress;


//	@JsonProperty("aadhar_card_number")
//	private String aadharCardNumber;

	@JsonProperty("aadharCard")
	private String aadharCard;

//	@JsonProperty("pan_card_number")
//	private String panCardNumber;

	@JsonProperty("panCard")
	private String panCard;

	@JsonProperty("relationship")
	private String relationship;

	@JsonProperty("active")
    private Boolean active;

    @JsonProperty("dob")
    private Long dob;
    
	@JsonProperty("additionalDetails")
	private JsonNode additionalDetails;

    @Override
    public String toString() {
        return "OwnerDetails{" +
                "ownerId='" + ownerId + '\'' +
                ", allotmentId='" + allotmentId + '\'' +
                ", gender='" + gender + '\'' +
                ", fatherOrHusbandName='" + fatherOrHusbandName + '\'' +
                ", status=" + status +
                ", isPrimaryOwner=" + isPrimaryOwner +
                ", ownerShipPercentage=" + ownerShipPercentage +
                ", ownerType='" + ownerType + '\'' +
                ", name='" + name + '\'' +
                ", emailId='" + emailId + '\'' +
                ", mobileNo='" + mobileNo + '\'' +
                ", permanentAddress='" + permanentAddress + '\'' +
//                ", aadharCardNumber='" + aadharCardNumber + '\'' +
                ", aadharCard='" + aadharCard + '\'' +
//                ", panCardNumber='" + panCardNumber + '\'' +
                ", panCard='" + panCard + '\'' +
                ", relationship=" + relationship +
                ", active=" + active +
                ", dob=" + dob +
                '}';
    }
    
}