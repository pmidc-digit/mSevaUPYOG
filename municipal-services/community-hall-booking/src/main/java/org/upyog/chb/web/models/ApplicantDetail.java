package org.upyog.chb.web.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.validation.annotation.Validated;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Details of the community halls booking
 */
@Validated

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ApplicantDetail {

    private String applicantDetailId;

    private String bookingId;

    @NotBlank(message = "CHB_BLANK_APPLICANT_NAME")
    @Size(max = 100, message = "COMMON_MAX_VALIDATION")
    private String applicantName;

    @NotBlank
    @Size(min = 10, max = 10)
    private String applicantMobileNo;

    private String applicantAlternateMobileNo;

    @NotBlank
    @Email
    private String applicantEmailId;

    private String accountNumber;

    private String ifscCode;

    private String bankName;

    private String bankBranchName;

    private String accountHolderName;

    private String refundType;

    private String refundStatus;

    private AuditDetails auditDetails;

}
