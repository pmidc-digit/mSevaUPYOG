package org.egov.tlcalculator.web.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.egov.tlcalculator.TestConfiguration;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
//import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.junit.jupiter.SpringExtension;
/**
* API tests for CalculatorController
*/
@Disabled
@ExtendWith(SpringExtension.class)
@Import(TestConfiguration.class)
public class V1ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void v1CalculatePostSuccess() throws Exception {
        mockMvc.perform(post("/tl-calculator//v1/_calculate").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isOk());
    }

    @Test
    public void v1CalculatePostFailure() throws Exception {
        mockMvc.perform(post("/tl-calculator//v1/_calculate").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isBadRequest());
    }

    @Test
    public void v1GetbillPostSuccess() throws Exception {
        mockMvc.perform(post("/tl-calculator//v1/_getbill").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isOk());
    }

    @Test
    public void v1GetbillPostFailure() throws Exception {
        mockMvc.perform(post("/tl-calculator//v1/_getbill").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isBadRequest());
    }

}
