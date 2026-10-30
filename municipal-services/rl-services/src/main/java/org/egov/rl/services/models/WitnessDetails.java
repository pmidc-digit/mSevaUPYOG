package org.egov.rl.services.models;

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
	
	@JsonProperty("fullName")
	private String fullName;

	@JsonProperty("emailId")
	private String emailId;
	
	@JsonProperty("mobileNo")
	private String mobileNo;
	
	@JsonProperty("aadharCardNumber")
	private String aadharCardNumber;
}
