package org.upyog.chb.web.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A Object holds the community halls for booking
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class CommunityHallSlotAvailabilityResponse   {
	
	private ResponseInfo responseInfo;
	
	@JsonProperty("hallSlotAvailabiltityDetails")
	@Valid
	private List<CommunityHallSlotAvailabilityDetail> hallSlotAvailabiltityDetails; 
	
	public void addNewHallsBookingApplication(CommunityHallSlotAvailabilityDetail slotAvailabiltityDetail) {
		if(this.hallSlotAvailabiltityDetails == null) {
			this.hallSlotAvailabiltityDetails = new ArrayList<CommunityHallSlotAvailabilityDetail>();
		}
		this.hallSlotAvailabiltityDetails.add(slotAvailabiltityDetail);
	}
	
	private Integer count;
	
	private long timerValue;

}

