package org.egov.edcr.web.controller.rest;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.FileNotFoundException;
import java.net.ConnectException;

import org.egov.commons.exception.EdcrException;
import org.egov.edcr.exception.CustomException;
import org.egov.edcr.exception.FileStorageException;
import org.egov.edcr.exception.MdmsException;
import org.egov.edcr.exception.PlanScrutinyException;
import org.egov.infra.validation.exception.ApplicationRestException;
import org.egov.infra.web.rest.error.ErrorResponse;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

public class GlobalRestExceptionHandlerTest {

    private GlobalRestExceptionHandler handler;

    @Before
    public void setUp() {
        handler = new GlobalRestExceptionHandler();
    }

    @Test
    public void testHandleEdcrException() {
        EdcrException ex = new EdcrException(HttpStatus.BAD_REQUEST, "ERR_TEST", "Test EDCR error");
        ResponseEntity<ErrorResponse> response = handler.handleEdcrException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("ERR_TEST", response.getBody().getErrorCode());
        assertEquals("Test EDCR error", response.getBody().getErrorMessage());
        assertEquals("Test EDCR error", response.getBody().getErrorDetails());
    }

    @Test
    public void testHandleCustomExceptions() {
        PlanScrutinyException pse = new PlanScrutinyException("SCRUTINY_FAIL", "Scrutiny failed on layer Boundary");
        ResponseEntity<ErrorResponse> res1 = handler.handleEdcrException(pse);
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, res1.getStatusCode());
        assertEquals("SCRUTINY_FAIL", res1.getBody().getErrorCode());
        assertEquals("Scrutiny failed on layer Boundary", res1.getBody().getErrorMessage());

        MdmsException me = new MdmsException("MDMS_NOT_FOUND", "MDMS master rule not found");
        ResponseEntity<ErrorResponse> res2 = handler.handleEdcrException(me);
        assertEquals(HttpStatus.BAD_GATEWAY, res2.getStatusCode());
        assertEquals("MDMS_NOT_FOUND", res2.getBody().getErrorCode());

        FileStorageException fse = new FileStorageException("FILE_READ_ERR", "Failed to retrieve DXF");
        ResponseEntity<ErrorResponse> res3 = handler.handleEdcrException(fse);
        assertEquals(HttpStatus.BAD_REQUEST, res3.getStatusCode());
        assertEquals("FILE_READ_ERR", res3.getBody().getErrorCode());
    }

    @Test
    public void testHandleApplicationRestException() {
        ApplicationRestException are = new ApplicationRestException("INVALID_TENANT", "TenantId is missing or invalid");
        ResponseEntity<ErrorResponse> response = handler.handleApplicationRestException(are);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INVALID_TENANT", response.getBody().getErrorCode());
        assertEquals("TenantId is missing or invalid", response.getBody().getErrorMessage());
    }

    @Test
    public void testHandleResourceAccessException() {
        ResourceAccessException rae = new ResourceAccessException("Connection refused", new ConnectException("Connection refused: connect"));
        ResponseEntity<ErrorResponse> response = handler.handleResourceAccessException(rae);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("DOWNSTREAM_SERVICE_UNAVAILABLE", response.getBody().getErrorCode());
        assertTrue(response.getBody().getErrorMessage().contains("MDMS at port 8094"));
    }

    @Test
    public void testHandleMaxUploadSizeExceededException() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(52428800);
        ResponseEntity<ErrorResponse> response = handler.handleMaxUploadSizeExceededException(ex);

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("MAX_UPLOAD_SIZE_EXCEEDED", response.getBody().getErrorCode());
    }

    @Test
    public void testHandleFileNotFoundException() {
        FileNotFoundException fnf = new FileNotFoundException("dxf file not found on disk");
        ResponseEntity<ErrorResponse> response = handler.handleFileNotFoundException(fnf);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("FILE_NOT_FOUND", response.getBody().getErrorCode());
    }

    @Test
    public void testHandleGenericExceptionNeverReturns500() {
        Exception cause = new IllegalStateException("Underlying root reason");
        RuntimeException wrapper = new RuntimeException("Top level error", cause);
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(wrapper);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("BAD_REQUEST", response.getBody().getErrorCode());
        assertEquals("Underlying root reason", response.getBody().getErrorMessage());
    }

    @Test
    public void testHandleNullPointerExceptionReturnsBadRequest() {
        NullPointerException npe = new NullPointerException("Null pointer encountered");
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(npe);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("BAD_REQUEST", response.getBody().getErrorCode());
        assertEquals("Null pointer encountered", response.getBody().getErrorMessage());
    }

    @Test
    public void testHandleNullPointerExceptionWithQuotesReplaced() {
        NullPointerException npe = new NullPointerException("Cannot invoke \"org.kabeja.dxf.DXFDocument.getDXFHeader()\" because \"dxfDoc\" is null");
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(npe);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("BAD_REQUEST", response.getBody().getErrorCode());
        assertEquals("Cannot invoke 'org.kabeja.dxf.DXFDocument.getDXFHeader()' because 'dxfDoc' is null", response.getBody().getErrorMessage());
        assertTrue(!response.getBody().getErrorMessage().contains("\\"));
        assertTrue(!response.getBody().getErrorMessage().contains("\""));
    }

    @Test
    public void testHandleFailedToGenerateReportNullUnwrapsLocation() {
        NullPointerException cause = new NullPointerException(); // no message
        RuntimeException wrapper = new RuntimeException("Failed to generate report: null", cause);
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(wrapper);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("BAD_REQUEST", response.getBody().getErrorCode());
        String msg = response.getBody().getErrorMessage();
        assertTrue("Should contain 'Failed to generate report'", msg.contains("Failed to generate report"));
        assertTrue("Should contain 'NullPointerException'", msg.contains("NullPointerException"));
        assertTrue("Should not end with ': null'", !msg.endsWith(": null"));
    }

    @Test
    public void testHandleGenericExceptionDownstreamConnectionFailure() {
        ConnectException ce = new ConnectException("Connection refused: connect");
        RuntimeException wrapper = new RuntimeException("Call failed", ce);
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(wrapper);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("DOWNSTREAM_SERVICE_UNAVAILABLE", response.getBody().getErrorCode());
    }
}