package org.egov.rl.models;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import org.egov.common.contract.request.Role;
import org.egov.rl.models.enums.Relationship;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.oldProperty.Address;
import org.egov.rl.models.user.User;
import org.hibernate.validator.constraints.SafeHtml;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
//@Data
public class OwnerInfo { // extends User {


	@SafeHtml
	@JsonProperty("owner_id")
	private String ownerId;
	
	@JsonProperty("allotment_id")
	private String allotmentId;

	@JsonProperty("user_id")
	private long userId;
	
	@JsonProperty("tenant_id")
	private String tenantId;
	
	@SafeHtml
	@JsonProperty("gender")
	private String gender;

	@SafeHtml
	@JsonProperty("fatherOrHusbandName")
	private String fatherOrHusbandName;

	@SafeHtml
	@JsonProperty("status")
	private int status;

	@JsonProperty("is_primary_owner")
	private Boolean isPrimaryOwner;

	@JsonProperty("ownership_percentage")
	private Double ownerShipPercentage;

	@NotNull
	@SafeHtml
	@JsonProperty("owner_type")
	private String ownerType;
	
	@NotNull
    @SafeHtml
    @Size(max=100)
    @Pattern(regexp = "^[^\\$\"'<>?~`!@#$%^()+={}\\[\\]*:;“”‘’]*$", message = "Invalid name. Only alphabets and special characters . ")
    @JsonProperty("first_name")
	private String firstName;

	@NotNull
    @SafeHtml
    @Size(max=100)
    @Pattern(regexp = "^[^\\$\"'<>?~`!@#$%^()+={}\\[\\]*:;“”‘’]*$", message = "Invalid name. Only alphabets and special characters . ")
    @JsonProperty("middle_name")
	private String middleName;

	@NotNull
    @SafeHtml
    @Size(max=100)
    @Pattern(regexp = "^[^\\$\"'<>?~`!@#$%^()+={}\\[\\]*:;“”‘’]*$", message = "Invalid name. Only alphabets and special characters . ")
    @JsonProperty("last_name")
	private String lastName;

	@Pattern(regexp = "(^[4-9][0-9]{9}$)", message = "Inavlid mobile number, should start with 4-9 and contain ten digits of 0-9")
    @NotNull
    @SafeHtml
    @JsonProperty("email_id")
	private String emailId;

	@JsonProperty("mobile_no")
	private String mobileNo;

	@JsonProperty("permanentAddress")
	private Address permanentAddress;
	
	@JsonProperty("correspondenceAddress")
	private Address correspondenceAddress;


//	@JsonProperty("aadhar_card_number")
//	private String aadharCardNumber;

	@JsonProperty("aadhar_card")
	private String aadharCard;

//	@JsonProperty("pan_card_number")
//	private String panCardNumber;

	@JsonProperty("pan_card")
	private String panCard;

	@JsonProperty("relationship")
	private Relationship relationship;

	@JsonProperty("active")
    private Boolean active;

    @JsonProperty("dob")
    private Long dob;
    
    @JsonProperty("user_uuid")
	private String userUuid;
    
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
                ", firstName='" + firstName + '\'' +
                ", middleName='" + middleName + '\'' +
                ", lastName='" + lastName + '\'' +
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
    
//    @JsonProperty("roles")
//    @Valid
//    private List<Role> roles;
//
//    @Size(max=32)
//    @SafeHtml
//    @JsonProperty("blood_group")
//    private String bloodGroup;
    
//	@SafeHtml
//	@JsonProperty("correspondenceAddress")
//	private String correspondenceAddress;

}