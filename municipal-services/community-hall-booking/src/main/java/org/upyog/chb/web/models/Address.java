package org.upyog.chb.web.models;

import jakarta.validation.constraints.NotBlank;

import org.springframework.validation.annotation.Validated;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representation of a address. Indiavidual APIs may choose to extend from this
 * using allOf if more details needed to be added in their case.
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Address {

    private String addressId;

    private String applicantDetailId;

    private String doorNo;

    private String houseNo;

    private String streetName;

    private String addressLine1;

    private String landmark;

    private String city;

    private String cityCode;

    private String locality;

    private String localityCode;

    private String pincode;

}
