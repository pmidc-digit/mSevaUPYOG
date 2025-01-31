package org.egov.egovsurveyservices.web.controllers;

import lombok.extern.slf4j.Slf4j;
import org.egov.egovsurveyservices.service.QuestionService;
import org.egov.egovsurveyservices.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/egov-ss")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @RequestMapping(value="/question/_create", method = RequestMethod.POST)
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest questionRequest) {
        QuestionResponse questionResponse = questionService.createQuestion(questionRequest);
        return new ResponseEntity<>(questionResponse, HttpStatus.CREATED);
    }

    @RequestMapping(value="/question/_update", method = RequestMethod.PUT)
    public ResponseEntity<QuestionResponse> update(@RequestBody QuestionRequest questionRequest) {
        QuestionResponse questionResponse = questionService.updateQuestion(questionRequest);
        return new ResponseEntity<>(questionResponse, HttpStatus.OK);
    }


    @RequestMapping(value="/question/_search", method = RequestMethod.GET)
    public ResponseEntity<QuestionResponse> search(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                   @ModelAttribute QuestionSearchCriteria criteria) {

        QuestionResponse questionResponse = questionService.searchQuestion(criteria);
        return new ResponseEntity<>(questionResponse,HttpStatus.OK);
    }

}
