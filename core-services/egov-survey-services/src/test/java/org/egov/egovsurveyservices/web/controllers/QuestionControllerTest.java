package org.egov.egovsurveyservices.web.controllers;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.egovsurveyservices.service.QuestionService;
import org.egov.egovsurveyservices.web.models.QuestionRequest;
import org.egov.egovsurveyservices.web.models.QuestionSearchCriteria;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(QuestionController.class)
public class QuestionControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    QuestionService  questionService;

    ObjectMapper mapper = new ObjectMapper();

    @Test
    public void testCreateQuestion() throws Exception {

        mockMvc.perform(post("/egov-ss/question/_create").contentType
                        (MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(new QuestionRequest())))
                .andExpect(status().isCreated());
    }

    @Test
    public void testUpdateQuestion() throws Exception {

        mockMvc.perform(put("/egov-ss/question/_update").contentType
                        (MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(new QuestionRequest())))
                .andExpect(status().isOk());
    }

    @Test
    public void testSearchQuestion() throws Exception {

        mockMvc.perform(get("/egov-ss/question/_search").contentType
                        (MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(new QuestionSearchCriteria())))
                .andExpect(status().isOk());
    }
}
