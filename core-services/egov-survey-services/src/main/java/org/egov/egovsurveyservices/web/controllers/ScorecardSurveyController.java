package org.egov.egovsurveyservices.web.controllers;

import java.util.Collections;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.utils.ResponseInfoFactory;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.egov.egovsurveyservices.web.models.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/egov-ss")
public class ScorecardSurveyController {

    @Autowired
    private ScorecardSurveyService surveyService;
    
    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/csc/create")
    public ResponseEntity<ScorecardSurveyResponse> createSurvey(@RequestBody ScorecardSurveyRequest surveyRequest) {
    	ScorecardSurveyEntity scorecardSurveyEntity = surveyService.createSurvey(surveyRequest);
    	ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(surveyRequest.getRequestInfo(), true);
    	ScorecardSurveyResponse response = ScorecardSurveyResponse.builder().surveyEntities(Collections.singletonList(scorecardSurveyEntity)).responseInfo(responseInfo).build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @RequestMapping(value="/csc/response/submit", method = RequestMethod.POST)
    public ResponseEntity<ScorecardAnswerResponse> responseSubmit(@Valid @RequestBody AnswerRequest answerRequest) {
        ScorecardAnswerResponse answerResponse = surveyService.submitResponse(answerRequest);
        ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(answerRequest.getRequestInfo(), true);
        ScorecardAnswerResponse response = ScorecardAnswerResponse.builder().responseInfo(responseInfo).answers(answerRequest.getAnswerEntity().getAnswers()).build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}