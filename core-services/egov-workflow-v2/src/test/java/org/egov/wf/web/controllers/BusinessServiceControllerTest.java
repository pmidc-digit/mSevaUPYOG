package org.egov.wf.web.controllers;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.wf.service.BusinessMasterService;
import org.egov.wf.util.ResponseInfoFactory;
import org.egov.wf.web.models.BusinessServiceRequest;
import org.egov.wf.web.models.RequestInfoWrapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class BusinessServiceControllerTest {
    @Mock
    private BusinessMasterService businessMasterService;

    @InjectMocks
    private BusinessServiceController businessServiceController;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ResponseInfoFactory responseInfoFactory;


    @Test
    void testCreate() throws Exception {
        when(this.responseInfoFactory.createResponseInfoFromRequestInfo((RequestInfo) any(), (Boolean) any()))
                .thenReturn(new ResponseInfo());
        when(this.businessMasterService.create((BusinessServiceRequest) any())).thenReturn(new ArrayList<>());

        BusinessServiceRequest businessServiceRequest = new BusinessServiceRequest();
        businessServiceRequest.setBusinessServices(new ArrayList<>());
        businessServiceRequest.setRequestInfo(new RequestInfo());
        String content = (new ObjectMapper()).writeValueAsString(businessServiceRequest);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/egov-wf/businessservice/_create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);
        MockMvcBuilders.standaloneSetup(this.businessServiceController)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content().json(
                        "{\"ResponseInfo\":{\"apiId\":null,\"ver\":null,\"ts\":null,\"resMsgId\":null,\"msgId\":null,\"status\":null},"
                                + "\"BusinessServices\":[]}"
                ));
    }


    @Test
    void testUpdate() throws Exception {
        when(this.responseInfoFactory.createResponseInfoFromRequestInfo((RequestInfo) any(), (Boolean) any()))
                .thenReturn(new ResponseInfo());
        when(this.businessMasterService.update((BusinessServiceRequest) any())).thenReturn(new ArrayList<>());

        BusinessServiceRequest businessServiceRequest = new BusinessServiceRequest();
        businessServiceRequest.setBusinessServices(new ArrayList<>());
        businessServiceRequest.setRequestInfo(new RequestInfo());
        String content = (new ObjectMapper()).writeValueAsString(businessServiceRequest);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/egov-wf/businessservice/_update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);
        MockMvcBuilders.standaloneSetup(this.businessServiceController)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content().json(
                        "{\"ResponseInfo\":{\"apiId\":null,\"ver\":null,\"ts\":null,\"resMsgId\":null,\"msgId\":null,\"status\":null},"
                                + "\"BusinessServices\":[]}"
                ));
    }


    @Test
    void testSearch() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        requestInfoWrapper.setRequestInfo(new RequestInfo());
        String content = (new ObjectMapper()).writeValueAsString(requestInfoWrapper);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/egov-wf/businessservice/_search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);
        ResultActions actualPerformResult = MockMvcBuilders.standaloneSetup(this.businessServiceController)
                .build()
                .perform(requestBuilder);
        actualPerformResult.andExpect(MockMvcResultMatchers.status().is(400));
    }
}

