package org.egov.egovsurveyservices.service;

import com.google.gson.Gson;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.ScorecardSurveyRepository;
import org.egov.egovsurveyservices.utils.ScorecardSurveyUtil;
import org.egov.egovsurveyservices.validators.ScorecardSurveyValidator;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScorecardSurveyServiceTest {
    @InjectMocks
    private ScorecardSurveyService scorecardSurveyService;

    @Mock
    private ApplicationProperties applicationProperties;

    @Mock
    private Producer producer;

    @Mock
    private ScorecardSurveyValidator surveyValidator;

    @Mock
    private EnrichmentService enrichmentService;

    @Mock
    private ScorecardSurveyRepository surveyRepository;

    @Autowired
    private ScorecardSurveyUtil surveyUtil;

    private RequestInfo requestInfo;
    private Gson gson;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        requestInfo = RequestInfo.builder()
                .userInfo(User.builder().uuid("1").build())
                .build();
        gson = new Gson();
    }
    
    @Test
    public void testCreateSurvey_Success() {
        lenient().when(applicationProperties.getMaxCreateLimit()).thenReturn(5);
        lenient().when(applicationProperties.getCreateScorecardSurveyTopic()).thenReturn("save-survey");

        ScorecardSurveyEntity survey = getValidSurveyEntity();
        ScorecardSurveyRequest surveyRequest = ScorecardSurveyRequest.builder()
                .requestInfo(requestInfo)
                .surveyEntity(survey)
                .build();


        doNothing().when(surveyValidator).validateUserType(any());
        doNothing().when(surveyValidator).validateQuestionsAndSections(any());
        doNothing().when(enrichmentService).enrichScorecardSurveyEntity(any());
        when(surveyRepository.allQuestionsExist(anyList())).thenReturn(true);

        doNothing().when(producer).push(anyString(), any(Object.class));

        ScorecardSurveyEntity responseEntity = scorecardSurveyService.createSurvey(surveyRequest);

        verify(producer).push(anyString(), any(Object.class));

        assertNotNull(responseEntity);
        assertNotNull(responseEntity.getUuid());
    }

    @Test
    public void testCreateSurvey_Failure() {
        lenient().when(applicationProperties.getMaxCreateLimit()).thenReturn(5);
        lenient().when(applicationProperties.getCreateScorecardSurveyTopic()).thenReturn("save-survey");

        ScorecardSurveyEntity survey = getValidSurveyEntity();
        ScorecardSurveyRequest surveyRequest = ScorecardSurveyRequest.builder()
                .requestInfo(requestInfo)
                .surveyEntity(survey)
                .build();


        doNothing().when(surveyValidator).validateUserType(any());
        doNothing().when(surveyValidator).validateQuestionsAndSections(any());

        assertThrows(IllegalArgumentException.class, () ->
                scorecardSurveyService.createSurvey(surveyRequest));

    }


    @Test
    public void testCreateSurvey_EmptyTitle() {
    	ScorecardSurveyEntity survey = getValidSurveyEntity();
    	survey.setSurveyTitle(null);
        ScorecardSurveyRequest surveyRequest = ScorecardSurveyRequest.builder()
                .requestInfo(requestInfo)
                .surveyEntity(survey)
                .build();
        assertThrows(IllegalArgumentException.class, () -> scorecardSurveyService.createSurvey(surveyRequest));
    }

    @Test
    public void testSearchSurvey_ByUuid() {
        ScorecardSurveySearchCriteria criteria = new ScorecardSurveySearchCriteria();
        criteria.setUuid("SS-1012/2024-25/0019");
        
        List<ScorecardSurveyEntity> mockSurveys = Collections.singletonList(getValidSurveyEntity());
        when(surveyRepository.fetchSurveys(criteria)).thenReturn(mockSurveys);
        
        List<ScorecardSurveyEntity> result = scorecardSurveyService.searchSurveys(criteria);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("SS-1012/2024-25/0019", result.get(0).getUuid());
    }

    @Test
    public void testSearchSurvey_ByTenantIdAndTitle() {
        ScorecardSurveySearchCriteria criteria = new ScorecardSurveySearchCriteria();
        criteria.setTenantId("pb.testing");
        criteria.setTitle("survey1");
        
        List<ScorecardSurveyEntity> mockSurveys = Collections.singletonList(getValidSurveyEntity());
        when(surveyRepository.fetchSurveys(criteria)).thenReturn(mockSurveys);
        
        List<ScorecardSurveyEntity> result = scorecardSurveyService.searchSurveys(criteria);
        
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("survey1", result.get(0).getSurveyTitle());
    }

    @Test
    public void testSearchSurvey_NoCriteria() {
        ScorecardSurveySearchCriteria criteria = new ScorecardSurveySearchCriteria();
        
        List<ScorecardSurveyEntity> result = scorecardSurveyService.searchSurveys(criteria);
        
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
    
    /*** Helper Method to Create Valid Survey ***/
    private ScorecardSurveyEntity getValidSurveyEntity() {
        return ScorecardSurveyEntity.builder()
                .tenantId("pb.testing")
                .uuid("SS-1012/2024-25/0019")
                .surveyTitle("survey1")
                .surveyCategory("categorytest")
                .surveyDescription("survey about the citizen issues")
                .startDate(1745173800000L)
                .endDate(1771372800000L)
                .sections(Arrays.asList(
                        Section.builder()
                                .title("section1")
                                .weightage(50)
                                .questions(Arrays.asList(
                                        QuestionWeightage.builder()
                                                .qorder(1L)
                                                .weightage(50)
                                                .question(Question.builder()
                                                        .tenantId("pb.testing")
                                                        .questionStatement("How would you rate the service?")
                                                        .categoryId("3d75a2a5-33b9-4792-b948-087588a59b2f")
                                                        .type(Type.SHORT_ANSWER_TYPE)
                                                        .build())
                                                .build(),
                                        QuestionWeightage.builder()
                                                .qorder(2L)
                                                .weightage(50)
                                                .question(Question.builder()
                                                        .tenantId("pb.testing")
                                                        .questionStatement("How would you rate the delivery?")
                                                        .categoryId("3d75a2a5-33b9-4792-b948-087588a59b2f")
                                                        .type(Type.SHORT_ANSWER_TYPE)
                                                        .build())
                                                .build()))
                                .build()
                ))
                .build();
    }

}
