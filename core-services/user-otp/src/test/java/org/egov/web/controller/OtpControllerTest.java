package org.egov.web.controller;

import org.egov.Resources;
import org.egov.TestConfiguration;
import org.egov.domain.exception.*;
import org.egov.domain.model.OtpRequest;
import org.egov.domain.model.OtpRequestType;
import org.egov.domain.service.OtpService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(OtpController.class)
@Import(TestConfiguration.class)
public class OtpControllerTest {

	private final static String TENANT_ID = "tenantId";
	private static final String OTP_NUMBER = "otpNumber";

	@Autowired
	private MockMvc mockMvc;

	private Resources resources = new Resources();

	@MockBean
	private OtpService otpService;

	@Test
	public void test_should_return_success_response_when_otp_is_sent() throws Exception {

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("otpSendRequest.json"))).andExpect(status().isCreated())
				.andExpect(content().json(resources.getFileContents("otpSendSuccessResponse.json")));

		final OtpRequest expectedOtpRequest = new OtpRequest("mobileNumber", null, "tenantId", OtpRequestType.PASSWORD_RESET, "CITIZEN", false);
		verify(otpService).sendOtp(expectedOtpRequest);
	}

	@Test
	public void test_should_return_error_response_when_mandatory_fields_are_not_present_in_request() throws Exception {
		final OtpRequest expectedOtpRequest = new OtpRequest("", null, "", null, "CITIZEN",false);
		doThrow(new InvalidOtpRequestException(expectedOtpRequest)).when(otpService).sendOtp(expectedOtpRequest);

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("otpRequestWithoutMandatoryFields.json")))
				.andExpect(status().isBadRequest())
				.andExpect(content().json(resources.getFileContents("otpMandatoryFieldsErrorResponse.json")));
	}

	@Test
	public void test_should_return_error_response_when_user_not_found_for_sending_forgot_password_otp()
			throws Exception {
		final OtpRequest expectedOtpRequest = new OtpRequest("", null, "", null, "CITIZEN",false);
		doThrow(new UserNotFoundException()).when(otpService).sendOtp(expectedOtpRequest);

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("otpRequestWithoutMandatoryFields.json")))
				.andExpect(status().isBadRequest())
				.andExpect(content().json(resources.getFileContents("unknownMobileNumberErrorResponse.json")));
	}

	@Test
	public void test_should_return_error_response_when_user_alreadyExist_incaseoftypeisregister() throws Exception {
		final OtpRequest expectedOtpRequest = new OtpRequest("mobileNumber", null, "tenantId", OtpRequestType.REGISTER, "CITIZEN",false);
		doThrow(new UserAlreadyExistInSystemException()).when(otpService).sendOtp(expectedOtpRequest);

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("otpSendRegisterRequest.json"))).andExpect(status().isBadRequest())
				.andExpect(content().json(resources.getFileContents("userAlreadyExistInSystemResponse.json")));
	}

	@Test
	public void test_should_return_error_response_when_user_doesntExist_incaseoftypeislogin() throws Exception {
		final OtpRequest expectedOtpRequest = new OtpRequest("mobileNumber", null, "tenantId", OtpRequestType.LOGIN, "CITIZEN",false);
		doThrow(new UserNotExistingInSystemException()).when(otpService).sendOtp(expectedOtpRequest);

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("otpSendLoginRequest.json"))).andExpect(status().isBadRequest())
				.andExpect(content().json(resources.getFileContents("userNotExistInSytemResponse.json")));
	}

	@Test
	public void test_should_return_error_response_when_user_mobilenot_found_for_sending_forgot_password_otp()
			throws Exception {
		final OtpRequest expectedOtpRequest = new OtpRequest("", null, "", null, "CITIZEN",false);
		doThrow(new UserMobileNumberNotFoundException()).when(otpService).sendOtp(expectedOtpRequest);

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("otpRequestWithoutMandatoryFields.json")))
				.andExpect(status().isBadRequest())
				.andExpect(content().json(resources.getFileContents("invalidMobileNumberErrorResponse.json")));
	}

	@Test
	public void test_should_return_error_message_when_unhandled_exception_occurs() throws Exception {
		final OtpRequest expectedOtpRequest = new OtpRequest("mobileNumber", null, "tenantId", null, "CITIZEN",false);
		final String exceptionMessage = "Some exception message";
		doThrow(new RuntimeException(exceptionMessage)).when(otpService).sendOtp(expectedOtpRequest);

		mockMvc.perform(post("/v1/_send").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(resources.getFileContents("invalidOtpSendRequest.json")))
				.andExpect(status().isInternalServerError()).andExpect(content().string(exceptionMessage));
	}

	@Test
	public void test_should_return_success_response_when_anonymous_otp_is_sent() throws Exception {
		String requestJson = "{\"RequestInfo\":{},\"otp\":{\"mobileNumber\":\"9876543210\",\"tenantId\":\"pb\"}}";

		mockMvc.perform(post("/v1/_sendAnonymous").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(requestJson))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.isSuccessful").value(true));

		org.egov.domain.model.AnonymousOtpRequest expectedRequest =
				new org.egov.domain.model.AnonymousOtpRequest("9876543210", "pb", null);
		verify(otpService).sendAnonymousOtp(expectedRequest);
	}

	@Test
	public void test_should_return_success_response_when_anonymous_otp_is_validated() throws Exception {
		String requestJson = "{\"RequestInfo\":{},\"otp\":{\"mobileNumber\":\"9876543210\",\"otp\":\"123456\",\"tenantId\":\"pb\"}}";
		org.egov.domain.model.AnonymousValidateRequest expectedRequest =
				new org.egov.domain.model.AnonymousValidateRequest("9876543210", "123456", "pb");
		org.egov.web.contract.AnonymousOtpValidationResponse responseBody = org.egov.web.contract.AnonymousOtpValidationResponse.builder()
				.successful(true)
				.isOtpValid(true)
				.message("OTP has been validated successfully")
				.build();
		org.mockito.Mockito.doReturn(new org.springframework.http.ResponseEntity<>(responseBody, org.springframework.http.HttpStatus.OK))
				.when(otpService).validateAnonymousOtp(expectedRequest);

		mockMvc.perform(post("/v1/_validateAnonymous").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(requestJson))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.isSuccessful").value(true))
				.andExpect(jsonPath("$.isOtpValid").value(true))
				.andExpect(jsonPath("$.message").value("OTP has been validated successfully"));
	}

	@Test
	public void test_should_pass_through_egov_otp_error_when_validation_fails() throws Exception {
		String requestJson = "{\"RequestInfo\":{},\"otp\":{\"mobileNumber\":\"9876543210\",\"otp\":\"999999\",\"tenantId\":\"pb\"}}";
		org.egov.domain.model.AnonymousValidateRequest expectedRequest =
				new org.egov.domain.model.AnonymousValidateRequest("9876543210", "999999", "pb");
		java.util.Map<String, Object> errorMap = new java.util.HashMap<>();
		java.util.Map<String, Object> innerError = new java.util.HashMap<>();
		innerError.put("code", 400);
		innerError.put("message", "OTP validation unsuccessful");
		errorMap.put("error", innerError);

		org.mockito.Mockito.doReturn(new org.springframework.http.ResponseEntity<>(errorMap, org.springframework.http.HttpStatus.BAD_REQUEST))
				.when(otpService).validateAnonymousOtp(expectedRequest);

		mockMvc.perform(post("/v1/_validateAnonymous").contentType(MediaType.APPLICATION_JSON_UTF8)
				.content(requestJson))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error.code").value(400))
				.andExpect(jsonPath("$.error.message").value("OTP validation unsuccessful"));
	}

}