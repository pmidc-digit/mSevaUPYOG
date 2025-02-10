package org.egov.egovsurveyservices.web.controllers;

import org.egov.egovsurveyservices.service.ScorecardSurveyService;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyEntity;
import org.egov.egovsurveyservices.web.models.ScorecardSurveyRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/surveys")
public class ScorecardSurveyController {

    @Autowired
    private ScorecardSurveyService surveyService;

    @PostMapping("/csc/create")
    public ScorecardSurveyEntity createSurvey(@RequestBody ScorecardSurveyRequest surveyRequest) {
        return surveyService.createSurvey(surveyRequest);
    }
}