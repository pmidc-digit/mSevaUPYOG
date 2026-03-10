package org.egov.rl.calculator.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;
import org.egov.rl.calculator.web.models.property.Address;
import org.hibernate.validator.constraints.SafeHtml;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
//@Data
public class OwnerInfo { // extends User {


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
	private String status;

	@JsonProperty("isPrimaryOwner")
	private Boolean isPrimaryOwner;

	@JsonProperty("ownershipPercentage")
	private Double ownerShipPercentage;

	@NotNull
	@SafeHtml
	@JsonProperty("ownerType")
	private String ownerType;
	
//	@NotNull
//    @SafeHtml
//    @Size(max=100)
//    @Pattern(regexp = "^[^\\$\"'<>?~`!@#$%^()+={}\\[\\]*:;“”‘’]*$", message = "Invalid name. Only alphabets and special characters . ")
//    @JsonProperty("firstName")
//	private String firstName;
//
//	@Size(max=100)
//    @Pattern(regexp = "^[^\\$\"'<>?~`!@#$%^()+={}\\[\\]*:;“”‘’]*$", message = "Invalid name. Only alphabets and special characters . ")
//    @JsonProperty("middleName")
//	private String middleName;
//
//	@NotNull
//    @SafeHtml
//    @Size(max=100)
//    @Pattern(regexp = "^[^\\$\"'<>?~`!@#$%^()+={}\\[\\]*:;“”‘’]*$", message = "Invalid name. Only alphabets and special characters . ")
//    @JsonProperty("lastName")
//	private String lastName;

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
	private Relationship relationship;

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
//                ", middleName='" + middleName + '\'' +
//                ", lastName='" + lastName + '\'' +
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