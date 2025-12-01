package org.egov.rl.models;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class WitnessDetails {
	
	@JsonProperty("full_name")
	private String fullName;

	@JsonProperty("email_id")
	private String emailId;
	
	@JsonProperty("mobile_no")
	private String mobileNo;
	
	@JsonProperty("aadhar_card_number")
	private String aadharCardNumber;
}
