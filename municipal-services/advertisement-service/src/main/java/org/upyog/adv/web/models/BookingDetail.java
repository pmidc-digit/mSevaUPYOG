package org.upyog.adv.web.models;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.springframework.validation.annotation.Validated;
//import org.upyog.adv.web.models.workflow.ProcessInstance;
import org.upyog.adv.validator.CreateApplicationGroup;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Details for new booking of advertisement
 */
@ApiModel(description = "Details for new booking of advertisement")
@Validated
@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2024-04-19T11:17:29.419+05:30")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class BookingDetail {
	
	@JsonProperty("bookingId")
	private String bookingId;
	
	private String bookingNo;
	
	private Long paymentDate;
	
	private String draftId;
	
	private Long applicationDate;
	
	@NotBlank(groups = CreateApplicationGroup.class)
	private String tenantId;
	
	@JsonProperty("bookingStatus")
	private String bookingStatus;
	
	private String receiptNo;
	
	private String permissionLetterFilestoreId;
	
	private String paymentReceiptFilestoreId;

	@NotNull
	@Valid
	private List<CartDetail> CartDetails;
	
	@JsonProperty("documents")
	@Valid
	private List<DocumentDetail> uploadedDocumentDetails;
	
	@Valid
	private ApplicantDetail applicantDetail;
	
	@Valid 
	private Address address;
	
	private AuditDetails auditDetails;
	
	//private Long timerValue;
	
 	//private ProcessInstance workflow;
	

	public BookingDetail addUploadedDocumentDetailsItem(DocumentDetail uploadedDocumentDetailsItem) {
		if (this.uploadedDocumentDetails == null) {
			this.uploadedDocumentDetails = new ArrayList<>();
		}
		this.uploadedDocumentDetails.add(uploadedDocumentDetailsItem);
		return this;
	}


	public BookingDetail addBookingSlots(CartDetail CartDetail) {
		if(CartDetails == null){
			CartDetails = new ArrayList<CartDetail>();
		}
		CartDetails.add(CartDetail);
		return this;
	}
}
