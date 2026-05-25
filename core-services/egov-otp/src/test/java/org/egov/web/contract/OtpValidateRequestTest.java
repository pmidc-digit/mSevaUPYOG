package org.egov.web.contract;

import org.egov.common.contract.request.RequestInfo;
import org.egov.domain.model.ValidateRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OtpValidateRequestTest {

    @Test
    void should_create_domain_from_contract() {
        RequestInfo requestInfo = RequestInfo.builder().build();

        Otp otp = new Otp("otp", null, "identity", "tenant", false);

        OtpValidateRequest validateRequest =
                new OtpValidateRequest(requestInfo, otp);

        ValidateRequest domain = validateRequest.toDomainValidateRequest();

        assertNotNull(domain);
        assertEquals("otp", domain.getOtp());
        assertEquals("identity", domain.getIdentity());
        assertEquals("tenant", domain.getTenantId());
    }
}