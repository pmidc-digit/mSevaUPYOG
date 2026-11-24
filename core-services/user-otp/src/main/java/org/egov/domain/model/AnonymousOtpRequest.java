package org.egov.domain.model;

import lombok.*;
import org.apache.commons.lang3.StringUtils;
import org.egov.domain.exception.InvalidAnonymousOtpRequestException;
import org.egov.web.contract.ErrorField;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnonymousOtpRequest {
    private String mobileNumber;
    private String tenantId;
    private String emailId;

    public void validate() {
        List<ErrorField> errorFields = new ArrayList<>();

        if (StringUtils.isBlank(tenantId)) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.TENANT_ID_MANDATORY")
                    .message("Tenant id is mandatory")
                    .field("otp.tenantId")
                    .build());
        }

        if (StringUtils.isBlank(mobileNumber)) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.MOBILE_NUMBER_MANDATORY")
                    .message("Mobile number field is mandatory")
                    .field("otp.mobileNumber")
                    .build());
        } else if (!isMobileNumberNumeric()) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.MOBILE_NUMBER_INVALID")
                    .message("Mobile number field should be numeric")
                    .field("otp.mobileNumber")
                    .build());
        } else if (!isMobileNumberValidLength()) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.MOBILE_NUMBER_INVALIDLENGTH")
                    .message("Mobile number length should be exactly 10 digits")
                    .field("otp.mobileNumber")
                    .build());
        }

        if (StringUtils.isNotBlank(emailId) && !isEmailValid()) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.EMAIL_INVALID")
                    .message("Email format is invalid")
                    .field("otp.emailId")
                    .build());
        }

        if (!errorFields.isEmpty()) {
            throw new InvalidAnonymousOtpRequestException(errorFields);
        }
    }

    public boolean isMobileNumberNumeric() {
        return StringUtils.isNumeric(mobileNumber);
    }

    public boolean isMobileNumberValidLength() {
        return mobileNumber != null && mobileNumber.trim().length() == 10;
    }

    public boolean isMobileNumberValid() {
        return isMobileNumberNumeric() && isMobileNumberValidLength();
    }

    public boolean isEmailValid() {
        if (StringUtils.isBlank(emailId)) {
            return true;
        }
        return emailId.trim().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }
}
