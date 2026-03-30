package org.egov.tlcalculator.web.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
//import org.springframework.test.context.junit.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

/**
* API tests for BillingslabApiController
*/
@Disabled
@ExtendWith(SpringExtension.class)
public class BillingslabControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void billingslabCreatePostSuccess() throws Exception {
        mockMvc.perform(post("/tl-calculator//billingslab/_create").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isOk());
    }

    @Test
    public void billingslabCreatePostFailure() throws Exception {
        mockMvc.perform(post("/tl-calculator//billingslab/_create").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isBadRequest());
    }

    @Test
    public void billingslabSearchPostSuccess() throws Exception {
        mockMvc.perform(post("/tl-calculator//billingslab/_search").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isOk());
    }

    @Test
    public void billingslabSearchPostFailure() throws Exception {
        mockMvc.perform(post("/tl-calculator//billingslab/_search").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isBadRequest());
    }

    @Test
    public void billingslabUpdatePostSuccess() throws Exception {
        mockMvc.perform(post("/tl-calculator//billingslab/_update").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isOk());
    }

    @Test
    public void billingslabUpdatePostFailure() throws Exception {
        mockMvc.perform(post("/tl-calculator//billingslab/_update").contentType(MediaType
        .APPLICATION_JSON_VALUE))
        .andExpect(status().isBadRequest());
    }

}
