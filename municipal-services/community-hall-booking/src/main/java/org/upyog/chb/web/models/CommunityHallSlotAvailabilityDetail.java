package org.upyog.chb.web.models;

import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Details for new booking of community halls
 */


@Validated
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = { "tenantId", "hallCode", "communityHallCode", "bookingDate"})
public class CommunityHallSlotAvailabilityDetail {

	private String communityHallCode;
	
	private String hallCode;
	
	private String bookingDate;

	private String fromTime;

	private String toTime;

	private String tenantId;

	@JsonProperty("slotStaus")
	private String slotStaus;
	
}
