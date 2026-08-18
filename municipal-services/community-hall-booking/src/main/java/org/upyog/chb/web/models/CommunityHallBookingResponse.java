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

/**
 * A Object holds the community halls for booking
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommunityHallBookingResponse   {
	
	private ResponseInfo responseInfo;
	
	@JsonProperty("hallsBookingApplication")
	@Valid
	private List<CommunityHallBookingDetail> hallsBookingApplication; 
	
	public void addNewHallsBookingApplication(CommunityHallBookingDetail bookingDetail) {
		if(this.hallsBookingApplication == null) {
			this.hallsBookingApplication = new ArrayList<CommunityHallBookingDetail>();
		}
		this.hallsBookingApplication.add(bookingDetail);
	}
	
	private Integer count;

}

