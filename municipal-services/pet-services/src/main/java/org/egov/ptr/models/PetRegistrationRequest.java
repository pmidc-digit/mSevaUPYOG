package org.egov.ptr.models;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.ArrayList;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.ptr.models.PetRegistrationApplication;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

/**
 * Contract class to receive request. Array of items are used in case of create,
 * whereas single item is used for update
 */
@Validated
@jakarta.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2023-08-20T09:30:27.617+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetRegistrationRequest {

	@JsonProperty("RequestInfo")
	private RequestInfo requestInfo;

	@JsonProperty("PetRegistrationApplications")

	@Valid
	private List<PetRegistrationApplication> petRegistrationApplications = null;

	public PetRegistrationRequest addPetRegistrationApplicationsItem(
			PetRegistrationApplication petRegistrationApplicationsItem) {
		if (this.petRegistrationApplications == null) {
			this.petRegistrationApplications = new ArrayList<>();
		}
		this.petRegistrationApplications.add(petRegistrationApplicationsItem);
		return this;
	}

}
