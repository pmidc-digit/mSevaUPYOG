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
public class AnonymousValidateRequest {
    private String mobileNumber;
    private String otp;
    private String tenantId;

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
        } else if (!StringUtils.isNumeric(mobileNumber) || mobileNumber.trim().length() != 10) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.MOBILE_NUMBER_INVALID")
                    .message("Mobile number should be a 10-digit numeric value")
                    .field("otp.mobileNumber")
                    .build());
        }

        if (StringUtils.isBlank(otp)) {
            errorFields.add(ErrorField.builder()
                    .code("OTP.OTP_MANDATORY")
                    .message("OTP token is mandatory")
                    .field("otp.otp")
                    .build());
        }

        if (!errorFields.isEmpty()) {
            throw new InvalidAnonymousOtpRequestException(errorFields);
        }
    }
}
