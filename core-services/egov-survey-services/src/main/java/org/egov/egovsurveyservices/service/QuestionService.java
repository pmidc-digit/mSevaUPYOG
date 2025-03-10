package org.egov.egovsurveyservices.service;

import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.*;
import org.egov.common.contract.request.RequestInfo;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.CategoryRepository;
import org.egov.egovsurveyservices.repository.QuestionRepository;
import org.egov.egovsurveyservices.utils.ResponseInfoFactory;
import org.egov.egovsurveyservices.validators.QuestionValidator;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Slf4j
@Service
public class QuestionService {

    @Autowired
    QuestionValidator questionValidator;

    @Autowired
    QuestionRepository questionRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    private Producer producer;

    @Autowired
    private ApplicationProperties applicationProperties;

    public QuestionResponse createQuestion(QuestionRequest questionRequest) {
        RequestInfo requestInfo = questionRequest.getRequestInfo();
        
        if (questionRequest.getQuestions().size() > applicationProperties.getMaxCreateLimit()) {
            throw new IllegalArgumentException("Maximum " + applicationProperties.getMaxCreateLimit() + " questions allowed per request.");
        }

        questionRequest.getQuestions().forEach(question -> {
            categoryExistsById(question.getCategoryId());
            enrichCreateRequest(question, requestInfo);

            // Validate options length
            if (question.getOptions() != null && question.getOptions().stream().anyMatch(opt -> opt.length() > 200)) {
                throw new IllegalArgumentException("Maximum 200 characters allowed only for a question's option");
            }
        });

        producer.push(applicationProperties.getSaveQuestionTopic(), questionRequest);
        return generateResponse(questionRequest);
    }


    public QuestionResponse updateQuestion(QuestionRequest questionRequest) {
        questionValidator.validateForUpdate(questionRequest);
        Question question = questionRequest.getQuestions().get(0);
        List<Question> existingQuesList = questionRepository.getQuestionById(question.getUuid());
        if (CollectionUtils.isEmpty(existingQuesList)) {
            throw new CustomException("EG_SS_QUESTION_NOT_FOUND", "question not found");
        }
        Question existingQuesFromDb = existingQuesList.get(0);
        Gson gson = new Gson();
        Question deepCopy = gson.fromJson(gson.toJson(existingQuesFromDb), Question.class);

        if (question.getStatus() != null) {
            existingQuesFromDb.setStatus(question.getStatus());
        }

        if (existingQuesFromDb.equals(deepCopy)) {
            throw new CustomException("EG_SS_NOTHING_TO_UPDATE", "no content returned, nothing to update");
        }

        // Update audit details
        String uuid = questionRequest.getRequestInfo().getUserInfo().getUuid();
        existingQuesFromDb.getAuditDetails().setLastModifiedBy(uuid);
        existingQuesFromDb.getAuditDetails().setLastModifiedTime(System.currentTimeMillis());

        // Save the updated question
        questionRequest.setQuestions(Collections.singletonList(existingQuesFromDb));
        producer.push(applicationProperties.getUpdateQuestionTopic(), questionRequest);
        return generateResponse(questionRequest);

    }

    private void enrichCreateRequest(Question question, RequestInfo requestInfo) {
        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(requestInfo.getUserInfo().getUuid())
                .lastModifiedBy(requestInfo.getUserInfo().getUuid())
                .createdTime(new Date().getTime())
                .lastModifiedTime(new Date().getTime())
                .build();
        question.setUuid(UUID.randomUUID().toString());
        question.setAuditDetails(auditDetails);
        question.setStatus(Optional.ofNullable(question.getStatus()).orElse(Status.ACTIVE));
        List<String> options = question.getOptions();
        question.setOptions((options == null || options.isEmpty()) ? Collections.singletonList("NA") : options);
    }

    private QuestionResponse generateResponse(QuestionRequest questionRequest) {
        return QuestionResponse.builder().responseInfo(ResponseInfoFactory.createResponseInfoFromRequestInfo(questionRequest.getRequestInfo(), true)).questions(questionRequest.getQuestions()).build();
    }

    public QuestionResponse searchQuestion(QuestionSearchCriteria criteria) {

        if (StringUtils.isBlank(criteria.getUuid()) && (StringUtils.isBlank(criteria.getTenantId())||(StringUtils.isBlank(criteria.getCategoryId())))) {
            throw new CustomException("EG_SS_TENANT_ID_REQUIRED_QUESTION_SEARCH", "either a (uuid) or a (tenant id and category id) is required.");
        }
        if (criteria.getPageNumber() < 1) {
            throw new IllegalArgumentException("Page number must be greater than or equal to 1");
        }

        QuestionRequest questionRequest = new QuestionRequest();
        questionRequest.setQuestions(questionRepository.fetchQuestions(criteria));
        return generateResponse(questionRequest);
    }

    public void uploadQuestions(RequestInfoWrapper requestInfoWrapper, MultipartFile file) throws IOException {
        List<Question> questions = parseExcel(requestInfoWrapper,file);
        QuestionRequest questionRequest = QuestionRequest.builder().requestInfo(requestInfoWrapper.getRequestInfo())
                .questions(questions).build();
        createQuestion(questionRequest);
    }

    public void categoryExistsById(String id){
        if (categoryRepository.existsById(id) == 0) {
            throw new CustomException("CATEGORY_DOES_NOT_EXIST","Category with ID " + id + " does not exist.");
        }
    }

    private List<Question> parseExcel(RequestInfoWrapper requestInfoWrapper, MultipartFile file) throws IOException {
        List<Question> questions = new ArrayList<>();
        String tenantId = requestInfoWrapper.getRequestInfo().getUserInfo().getTenantId();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    String tenantCellValue = getCellValueAsString(row.getCell(0));
                    String tenant = tenantCellValue ==null?tenantId: tenantCellValue;
                    String type = getCellValueAsString(row.getCell(1));
                    String categoryId = getCellValueAsString(row.getCell(2));
                    String questionStatement = getCellValueAsString(row.getCell(3));
                    String optionsString = getCellValueAsString(row.getCell(4));
                    String required = getCellValueAsString(row.getCell(5));
                    String status = getCellValueAsString(row.getCell(6));
                    String surveyId = getCellValueAsString(row.getCell(7));

                    Type typeFromCellValue = Type.fromValue(type);
                    if (typeFromCellValue == null){
                        throw new CustomException("INVALID_TYPE","question type cannot be null or invalid.");
                    }
                    if (StringUtils.isBlank(categoryId)){
                        throw new CustomException("CATEGORY_ID_MISSING","question category id cannot be null or invalid.");
                    }
                    Question question = new Question();
                    question.setTenantId(tenant);
                    question.setCategoryId(categoryId);
                    question.setRequired(Boolean.valueOf(required));
                    question.setStatus(Status.fromValue(status));
                    question.setQuestionStatement(questionStatement);
                    question.setOptions(Arrays.asList(optionsString.split(","))); // Assuming options are comma-separated
                    question.setType(typeFromCellValue); // Assuming Type is an enum
                    question.setSurveyId(surveyId);
                    questions.add(question);
                }
            }
        }
        return questions;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    public byte[] downloadTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource("question_template.xlsx");
        InputStream inputStream = resource.getInputStream();

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            return outputStream.toByteArray();
        }
    }

}
