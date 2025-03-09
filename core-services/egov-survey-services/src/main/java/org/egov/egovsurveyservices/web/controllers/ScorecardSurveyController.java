package org.egov.egovsurveyservices.web.controllers;

import static org.egov.egovsurveyservices.utils.SurveyServiceConstants.CITIZEN;

import java.util.Collections;
import java.util.List;

import javax.validation.Valid;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.utils.ResponseInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.egov.egovsurveyservices.web.models.*;

@RestController
@RequestMapping("/egov-ss")
public class ScorecardSurveyController {

    @Autowired
    private ScorecardSurveyService surveyService;
    
    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/csc/create")
    public ResponseEntity<ScorecardSurveyResponse> createSurvey(@Valid @RequestBody ScorecardSurveyRequest surveyRequest) {
    	ScorecardSurveyEntity scorecardSurveyEntity = surveyService.createSurvey(surveyRequest);
    	ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(surveyRequest.getRequestInfo(), true);
    	ScorecardSurveyResponse response = ScorecardSurveyResponse.builder().surveyEntities(Collections.singletonList(scorecardSurveyEntity)).responseInfo(responseInfo).build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @RequestMapping(value="/csc/_search", method = RequestMethod.POST)
    public ResponseEntity<ScorecardSurveyResponse> search(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                   @Valid @ModelAttribute ScorecardSurveySearchCriteria criteria) {
        Boolean isCitizen = requestInfoWrapper.getRequestInfo().getUserInfo().getType().equals(CITIZEN);
        List<ScorecardSurveyEntity> surveys = surveyService.searchSurveys(criteria, isCitizen);
        int surveyCount = (surveys != null) ? surveys.size() : 0;
        ScorecardSurveyResponse response  = ScorecardSurveyResponse.builder().surveyEntities(surveys).totalCount(surveyCount).build();
        return new ResponseEntity<>(response,HttpStatus.OK);
    }
    
    @PostMapping("/csc/active/_update")
    public ResponseEntity<?> updateActiveSurvey(@Valid @RequestBody UpdateSurveyActiveRequest request) {
        try {
            surveyService.updateSurveyActive(request);
            return ResponseEntity.ok().body(Collections.singletonMap("message", "Survey active status updated successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}