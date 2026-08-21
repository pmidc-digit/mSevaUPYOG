package org.upyog.adv.web.models;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

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
public class AdvertisementSlotWiseBreakdown {

	@JsonProperty("advertisementId")
	private String advertisementId;

	@JsonProperty("advertisementName")
	private String advertisementName;

	@JsonProperty("numberOfDays")
	private Integer numberOfDays;

	@JsonProperty("baseRentalAmount")
	private BigDecimal baseRentalAmount;

	@JsonProperty("allocatedTaxesAndFees")
	private BigDecimal allocatedTaxesAndFees;

	@JsonProperty("slotTotal")
	private BigDecimal slotTotal;
}
