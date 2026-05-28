package org.upyog.chb.web.models;

import jakarta.validation.constraints.NotBlank;

import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Category of applicants for community hall booking
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SpecialCategory   {
		@NotBlank
        @JsonProperty("category")
        private String category = null;

        @JsonProperty("discountRate")
        private Integer discountRate = null;


}

