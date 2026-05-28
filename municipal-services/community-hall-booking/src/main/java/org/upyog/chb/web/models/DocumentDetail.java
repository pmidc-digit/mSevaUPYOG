package org.upyog.chb.web.models;

import jakarta.validation.constraints.NotBlank;

import org.springframework.validation.annotation.Validated;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Document details of uploaded documents
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DocumentDetail {
	
	private String documentDetailId;
	
	private String bookingId;

	@NotBlank
	private String documentType;
	
	@NotBlank
	private String fileStoreId;

	private AuditDetails auditDetails;

}
