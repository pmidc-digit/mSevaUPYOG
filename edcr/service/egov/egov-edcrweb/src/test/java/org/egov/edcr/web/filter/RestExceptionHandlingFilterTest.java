package org.egov.edcr.web.filter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.net.ConnectException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.egov.infra.validation.exception.ApplicationRestException;
import org.egov.infra.web.rest.error.ErrorResponse;
import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

public class RestExceptionHandlingFilterTest {

    private RestExceptionHandlingFilter filter;
    private ObjectMapper objectMapper;

    @Before
    public void setUp() {
        filter = new RestExceptionHandlingFilter();
        objectMapper = new ObjectMapper();
    }

    @Test
    public void testInterceptApplicationRestExceptionOnRestUri() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/edcr/rest/dcr/scrutinize");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new FilterChain() {
            @Override
            public void doFilter(ServletRequest req, ServletResponse res) throws IOException, ServletException {
                throw new ApplicationRestException("INVALID_TENANT", "Tenant resolution failed in filter");
            }
        };

        filter.doFilterInternal(request, response, chain);

        assertEquals(400, response.getStatus());
        assertTrue(response.getContentType().contains("application/json"));
        ErrorResponse err = objectMapper.readValue(response.getContentAsString(), ErrorResponse.class);
        assertEquals("INVALID_TENANT", err.getErrorCode());
        assertEquals("Tenant resolution failed in filter", err.getErrorMessage());
    }

    @Test
    public void testInterceptDownstreamFailureOnRestUri() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/edcr/rest/dcr/create");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new FilterChain() {
            @Override
            public void doFilter(ServletRequest req, ServletResponse res) throws IOException, ServletException {
                throw new RuntimeException("Downstream call failed", new ConnectException("Connection refused: connect"));
            }
        };

        filter.doFilterInternal(request, response, chain);

        assertEquals(503, response.getStatus());
        assertTrue(response.getContentType().contains("application/json"));
        ErrorResponse err = objectMapper.readValue(response.getContentAsString(), ErrorResponse.class);
        assertEquals("DOWNSTREAM_SERVICE_UNAVAILABLE", err.getErrorCode());
        assertTrue(err.getErrorMessage().contains("Connection refused"));
    }
}