package org.egov.egovsurveyservices.service;

import com.google.gson.Gson;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.egovsurveyservices.config.ApplicationProperties;
import org.egov.egovsurveyservices.producer.Producer;
import org.egov.egovsurveyservices.repository.CategoryRepository;
import org.egov.egovsurveyservices.repository.QuestionRepository;
import org.egov.egovsurveyservices.validators.QuestionValidator;
import org.egov.egovsurveyservices.web.models.*;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;
import org.egov.tracer.model.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {
    @InjectMocks
    private QuestionService questionService;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ApplicationProperties applicationProperties;

    @Mock
    private Producer producer;

    @Mock
    private QuestionValidator questionValidator;

    private RequestInfo requestInfo;
    private Gson gson;

    @BeforeEach
    void setUp() {
        requestInfo = RequestInfo.builder()
                .userInfo(User.builder().uuid("1").build())
                .build();
        gson = new Gson();
    }

    @Test
    public void testCreateQuestionSuccess() {
        Question question = Question.builder()
                .questionStatement("Test Question")
                .categoryId("1")
                .build();
        List<Question> questions = Collections.singletonList(question);
        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(questions)
                .build();
        when(categoryRepository.existsById(anyString())).thenReturn(1);
        when(applicationProperties.getSaveQuestionTopic()).thenReturn("test-topic");
        QuestionResponse response = questionService.createQuestion(questionRequest);

        assertEquals("1", response.getQuestions().get(0).getAuditDetails().getCreatedBy());
        assertEquals("1", response.getQuestions().get(0).getAuditDetails().getLastModifiedBy());
        assertNotNull(response.getQuestions().get(0).getUuid());
        assertEquals(Status.ACTIVE, response.getQuestions().get(0).getStatus());
        assertEquals(Collections.singletonList("NA"), response.getQuestions().get(0).getOptions());
    }

    @Test
    public void testCreateQuestionWithOptions() {
        Question question = Question.builder()
                .questionStatement("Test Question")
                .options(Arrays.asList("Option 1", "Option 2"))
                .categoryId("123")
                .build();
        List<Question> questions = Collections.singletonList(question);
        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(questions)
                .build();
        when(categoryRepository.existsById(anyString())).thenReturn(1);
        when(applicationProperties.getSaveQuestionTopic()).thenReturn("test-topic");
        QuestionResponse response = questionService.createQuestion(questionRequest);
        assertEquals(Arrays.asList("Option 1", "Option 2"), response.getQuestions().get(0).getOptions());
    }

    @Test
    public void testCreateQuestionCategoryInvalid() {
        Question question = Question.builder()
                .questionStatement("Test Question")
                .options(Arrays.asList("Option 1", "Option 2"))
                .categoryId("123")
                .build();
        List<Question> questions = Collections.singletonList(question);
        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(questions)
                .build();
        when(categoryRepository.existsById(anyString())).thenReturn(0);
        assertThrows(CustomException.class, () -> questionService.createQuestion(questionRequest));
    }

    @Test
    public void testCreateQuestionWithOptionsEmptyList() {
        Question question = Question.builder()
                .questionStatement("Test Question")
                .categoryId("1")
                .options(Collections.emptyList())
                .build();
        List<Question> questions = Collections.singletonList(question);
        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(questions)
                .build();

        when(categoryRepository.existsById(anyString())).thenReturn(1);
        when(applicationProperties.getSaveQuestionTopic()).thenReturn("test-topic");
        QuestionResponse response = questionService.createQuestion(questionRequest);
        assertEquals(Collections.singletonList("NA"), response.getQuestions().get(0).getOptions());
    }

    @Test
    public void testUpdateQuestionSuccess() {
        AuditDetails auditDetails = AuditDetails.builder()
                .createdTime(System.currentTimeMillis())
                .lastModifiedTime(System.currentTimeMillis())
                .createdBy("creator")
                .lastModifiedBy("modifier")
                .build();

        Question existingQuestion = Question.builder()
                .uuid("123")
                .questionStatement("Old Question")
                .status(Status.ACTIVE)
                .auditDetails(auditDetails)
                .build();

        Question updatedQuestion = Question.builder()
                .uuid("123")
                .questionStatement("New Question")
                .status(Status.INACTIVE)
                .build();

        List<Question> existingQuesList = Collections.singletonList(existingQuestion);
        when(questionRepository.getQuestionById(any(String.class))).thenReturn(existingQuesList);
        when(applicationProperties.getUpdateQuestionTopic()).thenReturn("test-topic");

        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(Collections.singletonList(updatedQuestion))
                .build();

        QuestionResponse response = questionService.updateQuestion(questionRequest);
        assertNotEquals("New Question", response.getQuestions().get(0).getQuestionStatement());
        assertEquals(Status.INACTIVE, response.getQuestions().get(0).getStatus());
        assertEquals("1", response.getQuestions().get(0).getAuditDetails().getLastModifiedBy());
    }

    @Test
    public void testUpdateQuestionNoChanges() {
        Question existingQuestion = Question.builder()
                .uuid("123")
                .questionStatement("Test Question")
                .status(Status.ACTIVE)
                .build();

        List<Question> existingQuesList = Collections.singletonList(existingQuestion);
        when(questionRepository.getQuestionById("123")).thenReturn(existingQuesList);

        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(Collections.singletonList(existingQuestion))
                .build();

        assertThrows(CustomException.class, () -> questionService.updateQuestion(questionRequest));
    }

    @Test
    public void testUpdateQuestionNoChangesOnlyUUidGivenStatusNull() {
        Question existingQuestion = Question.builder()
                .uuid("123")
                .questionStatement("Test Question")
                .status(Status.ACTIVE)
                .build();

        Question updateQuestion = Question.builder()
                .uuid("123")
                .build();

        List<Question> existingQuesList = Collections.singletonList(existingQuestion);
        when(questionRepository.getQuestionById("123")).thenReturn(existingQuesList);

        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(Collections.singletonList(updateQuestion))
                .build();

        assertThrows(CustomException.class, () -> questionService.updateQuestion(questionRequest));
    }

    @Test
    public void testUpdateQuestionNotFound() {
        when(questionRepository.getQuestionById("123")).thenReturn(Collections.emptyList());
        QuestionRequest questionRequest = QuestionRequest.builder()
                .requestInfo(requestInfo)
                .questions(Collections.singletonList(Question.builder().uuid("123").build()))
                .build();
        RuntimeException thrown = assertThrows(CustomException.class, () -> questionService.updateQuestion(questionRequest));
        assertEquals("question not found", thrown.getMessage());
        assertEquals(CustomException.class, thrown.getClass());
    }

    @Test
    public void testSearchQuestionByUuid() {
        Question question = Question.builder()
                .uuid("123")
                .build();
        QuestionSearchCriteria criteria = QuestionSearchCriteria.builder()
                .uuid("123")
                .pageNumber(1)
                .size(10)
                .build();

        List<Question> list = new ArrayList<>();
        list.add(question);
        when(questionRepository.fetchQuestions(criteria)).thenReturn(list);
        QuestionResponse response = questionService.searchQuestion(criteria);
        assertEquals("123", response.getQuestions().get(0).getUuid());
    }

    @Test
    public void testSearchQuestionByTenantIdAndCategoryId() {
        Question question = Question.builder()
                .tenantId("default")
                .categoryId("1")
                .build();
        QuestionSearchCriteria criteria = QuestionSearchCriteria.builder()
                .tenantId("default")
                .pageNumber(1)
                .size(10)
                .categoryId("1")
                .build();

        when(questionRepository.fetchQuestions(criteria)).thenReturn(Collections.singletonList(question));

        QuestionResponse response = questionService.searchQuestion(criteria);
        assertEquals("default", response.getQuestions().get(0).getTenantId());
        assertEquals("1", response.getQuestions().get(0).getCategoryId());
    }

    @Test
    public void testSearchQuestionInvalidCriteria() {
        QuestionSearchCriteria criteria = QuestionSearchCriteria.builder()
                .build();

        assertThrows(CustomException.class, () -> questionService.searchQuestion(criteria));
    }

    @Test
    public void testSearchQuestionInvalidCriteriaCategoryIdBlank() {
        QuestionSearchCriteria criteria = QuestionSearchCriteria.builder()
                .tenantId("default")
                .categoryId("")
                .build();

        RuntimeException thrown = assertThrows(CustomException.class, () -> questionService.searchQuestion(criteria));
        assertEquals(thrown.getMessage(), "either a (uuid) or a (tenant id and category id) is required.");
    }

    @Test
    public void testSearchQuestionInvalidPageNumber() {
        QuestionSearchCriteria criteria = QuestionSearchCriteria.builder()
                .uuid("123")
                .pageNumber(0)
                .build();

        assertThrows(IllegalArgumentException.class, () -> questionService.searchQuestion(criteria));
    }


    private MockMultipartFile createExcelFile() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Tenant Id");
        headerRow.createCell(1).setCellValue("Type");
        headerRow.createCell(2).setCellValue("Category Id");
        headerRow.createCell(3).setCellValue("Question Statement");
        headerRow.createCell(4).setCellValue("Options");
        headerRow.createCell(5).setCellValue("Required");
        headerRow.createCell(6).setCellValue("Status");
        headerRow.createCell(7).setCellValue("Survey Id");

        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue("default");
        dataRow.createCell(1).setCellValue(Type.MULTIPLE_ANSWER_TYPE.toString());
        dataRow.createCell(2).setCellValue("1");
        dataRow.createCell(3).setCellValue("question 1");
        dataRow.createCell(4).setCellValue("option 1, option 2");
        dataRow.createCell(5).setCellValue(true);
        dataRow.createCell(6).setCellValue(Status.ACTIVE.toString());
        dataRow.createCell(7).setCellValue("101");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();

        return new MockMultipartFile("file", "sample.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);
    }

    @Test
    public void testUploadQuestions() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = createExcelFile();
        when(categoryRepository.existsById(anyString())).thenReturn(1);
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        questionService.uploadQuestions(requestInfoWrapper, file);
    }

    private MockMultipartFile createExcelFile_TenantNull() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Tenant Id");
        headerRow.createCell(1).setCellValue("Type");
        headerRow.createCell(2).setCellValue("Category Id");
        headerRow.createCell(3).setCellValue("Question Statement");
        headerRow.createCell(4).setCellValue("Options");

        Row dataRow = sheet.createRow(1);
        dataRow.createCell(1).setCellValue(Type.MULTIPLE_ANSWER_TYPE.toString());
        dataRow.createCell(2).setCellValue("1");
        dataRow.createCell(3).setCellValue("question 1");
        dataRow.createCell(4).setCellValue("option 1, option 2");
        dataRow.createCell(6).setCellValue(1);

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();

        return new MockMultipartFile("file", "sample.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);
    }

    @Test
    public void testUploadQuestions_tenantNullInExcel() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = createExcelFile_TenantNull();
        when(categoryRepository.existsById(anyString())).thenReturn(1);
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        questionService.uploadQuestions(requestInfoWrapper, file);
    }

    private MockMultipartFile createExcelFile_noRows() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Tenant Id");
        headerRow.createCell(1).setCellValue("Type");
        headerRow.createCell(2).setCellValue("Category Id");
        headerRow.createCell(3).setCellValue("Question Statement");
        headerRow.createCell(4).setCellValue("Options");

        Row dataRow = sheet.createRow(2);
        dataRow.createCell(1).setCellValue(Type.MULTIPLE_ANSWER_TYPE.toString());
        dataRow.createCell(2).setCellValue("1");
        dataRow.createCell(3).setCellValue("question 1");
        dataRow.createCell(4).setCellValue("option 1, option 2");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();

        return new MockMultipartFile("file", "sample.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);
    }

    @Test
    public void testUploadQuestions_noRows() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = createExcelFile_noRows();
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        when(categoryRepository.existsById(anyString())).thenReturn(1);
        questionService.uploadQuestions(requestInfoWrapper, file);
    }

    private MockMultipartFile createExcelFile_TypeValueNull() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Tenant Id");
        headerRow.createCell(1).setCellValue("Type");
        headerRow.createCell(2).setCellValue("Category Id");
        headerRow.createCell(3).setCellValue("Question Statement");
        headerRow.createCell(4).setCellValue("Options");

        Row dataRow = sheet.createRow(1);
        dataRow.createCell(1).setCellValue("ABC");
        dataRow.createCell(2).setCellValue("1");
        dataRow.createCell(3).setCellValue("question 1");
        dataRow.createCell(4).setCellValue("option 1, option 2");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();

        return new MockMultipartFile("file", "sample.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);
    }

    @Test
    public void testUploadQuestions_TypeValue_Error() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = createExcelFile_TypeValueNull();
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        assertThrows(CustomException.class, () -> questionService.uploadQuestions(requestInfoWrapper, file));
    }

    private MockMultipartFile createExcelFile_CategoryId_Missing() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Tenant Id");
        headerRow.createCell(1).setCellValue("Type");
        headerRow.createCell(2).setCellValue("Category Id");
        headerRow.createCell(3).setCellValue("Question Statement");
        headerRow.createCell(4).setCellValue("Options");

        Row dataRow = sheet.createRow(1);
        dataRow.createCell(1).setCellValue(Type.MULTIPLE_ANSWER_TYPE.toString());
        dataRow.createCell(3).setCellValue("question 1");
        dataRow.createCell(4).setCellValue("option 1, option 2");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();

        return new MockMultipartFile("file", "sample.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);
    }

    @Test
    public void testUploadQuestions_CategoryId_missing() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = createExcelFile_CategoryId_Missing();
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        assertThrows(CustomException.class, () -> questionService.uploadQuestions(requestInfoWrapper, file));
    }

    @Test
    public void testUploadQuestions_IOException() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = new MockMultipartFile(
                "file", "filename.txt", "text/plain", "file content".getBytes());
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        assertThrows(IOException.class, () -> questionService.uploadQuestions(requestInfoWrapper, file));
    }

    @Test
    public void testUploadQuestions_categoryId_doesNotExist() throws Exception {
        RequestInfoWrapper requestInfoWrapper = new RequestInfoWrapper();
        MockMultipartFile file = createExcelFile_noRows();
        requestInfo.getUserInfo().setTenantId("default");
        requestInfoWrapper.setRequestInfo(requestInfo);
        assertThrows(CustomException.class, () -> questionService.uploadQuestions(requestInfoWrapper, file));
    }

    @Test
    public void testCategoryExistsById() {
        when(categoryRepository.existsById("1")).thenReturn(1);
        questionService.categoryExistsById("1");
        verify(categoryRepository, times(1)).existsById("1");
    }

    @Test
    public void testCategoryExistsByIdThrowsException() {
        when(categoryRepository.existsById("1")).thenReturn(0);
        assertThrows(CustomException.class, () -> questionService.categoryExistsById("1"));
    }

    @Test
    public void testDownloadTemplate() throws Exception {
        questionService.downloadTemplate();
    }

}