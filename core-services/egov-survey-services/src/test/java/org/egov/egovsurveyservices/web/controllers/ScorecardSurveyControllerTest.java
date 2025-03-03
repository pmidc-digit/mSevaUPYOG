package org.egov.egovsurveyservices.web.controllers;


import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.utils.ResponseInfoFactory;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyResponse;
import org.egov.egovsurveyservices.web.models.ScorecardSurveySearchCriteria;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(ScorecardSurveyController.class)
@RunWith(SpringRunner.class)
@ExtendWith(SpringExtension.class)
class ScorecardSurveyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScorecardSurveyService surveyService;

    @MockBean
    private ResponseInfoFactory responseInfoFactory;
    
    private static final String SEARCH_URL = "/egov-ss/csc/_search";

    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Test
    void testCreateSurvey() throws Exception {
        String surveyJson = "{"
            + "\"requestInfo\": {\"apiId\": \"Rainmaker\", \"ver\": \".01\", \"msgId\": \"201703900|en_IN\", \"authToken\": \"ae9b231e16\"},"
            + "\"surveyEntity\": {\"tenantId\": \"pb.testing\", \"surveyTitle\": \"survey3\", \"surveyCategory\": \"sc survey testing\", \"surveyDescription\": \"survey about the citizen and people issues1\","
            + "\"startDate\": 1745173800000, \"endDate\": 1771372800000}}";

        when(surveyService.createSurvey(ArgumentMatchers.any(ScorecardSurveyRequest.class)))
            .thenReturn(new ScorecardSurveyEntity());

        mockMvc.perform(post("/egov-ss/csc/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(surveyJson))
            .andExpect(status().isOk());
    }


     @Test
     public void testSearchSurvey() throws Exception {
            // Mock request payload
            String requestJson = "{\"RequestInfo\":{\"apiId\":\"Rainmaker\",\"ver\":\".01\",\"authToken\":\"ae92a0ee-bb231e16\",\"userInfo\":{\"id\":296,\"type\":\"CITIZEN\"}}}";
            
            // Mock query params
            String uuid = "SS-1012/2024-25/000131";
            String tenantId = "pb.testing";
            String title = "survey1";

            ScorecardSurveyEntity survey = new ScorecardSurveyEntity();
            survey.setUuid(uuid);
            survey.setTenantId(tenantId);
            survey.setSurveyTitle(title);
            survey.setSurveyCategory("categorytest");
            survey.setSurveyDescription("survey about the citizens issues and problems");
            survey.setStartDate(1745173800000L);
            survey.setEndDate(1771372800000L);
            survey.setActive(false);
            survey.setAnswersCount(0L);
            survey.setHasResponded(false);
            survey.setCreatedTime(0L);
            survey.setLastModifiedTime(0L);

            List<ScorecardSurveyEntity> surveys = Collections.singletonList(survey);
            ScorecardSurveyResponse response = ScorecardSurveyResponse.builder()
                    .surveyEntities(surveys)
                    .totalCount(1)
                    .build();

            Mockito.when(surveyService.searchSurveys(Mockito.any(ScorecardSurveySearchCriteria.class)))
                    .thenReturn(surveys);

            mockMvc.perform(post(SEARCH_URL)
                    .param("uuid", uuid)
                    .param("tenantId", tenantId)
                    .param("title", title)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.TotalCount").value(1))
                    .andExpect(jsonPath("$.Surveys[0].uuid").value(uuid))
                    .andExpect(jsonPath("$.Surveys[0].tenantId").value(tenantId))
                    .andExpect(jsonPath("$.Surveys[0].surveyTitle").value(title));
      }
}


