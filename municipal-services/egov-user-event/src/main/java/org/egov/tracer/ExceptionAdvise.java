package org.egov.tracer;

import jakarta.servlet.http.HttpServletRequest;
import org.egov.tracer.config.TracerProperties;
import org.egov.tracer.kafka.ErrorQueueProducer;
import org.egov.tracer.model.CustomBindingResultExceprion;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.Error;
import org.egov.tracer.model.ErrorQueueContract;
import org.egov.tracer.model.ErrorRes;
import org.egov.tracer.model.ServiceCallException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.validation.BindException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ControllerAdvice
@Order(Integer.MAX_VALUE)
public class ExceptionAdvise {

    private static final Logger log = LoggerFactory.getLogger(ExceptionAdvise.class);

    @Value("${tracer.errors.provideExceptionInDetails:false}")
    private boolean provideExceptionInDetails;

    @Autowired
    private ErrorQueueProducer errorQueueProducer;

    @Autowired
    private TracerProperties tracerProperties;

    public ExceptionAdvise() {}

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> exceptionHandler(HttpServletRequest request, Exception exception) {
        String contentType = request.getContentType();
        boolean isJson = contentType != null && contentType.toLowerCase().contains("application/json");

        log.error("Exception caught in tracer", exception);

        String body = "";
        if (request instanceof org.egov.tracer.http.filters.MultiReadRequestWrapper) {
            try {
                body = org.apache.commons.io.IOUtils.toString(request.getInputStream(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                body = "Unable to retrieve request body";
            }
        } else {
            body = "Unable to retrieve request body";
        }

        ErrorRes errorRes = new ErrorRes();
        List<Error> errors = new ArrayList<>();

        try {
            if (exception instanceof HttpMediaTypeNotSupportedException) {
                Error error = new Error(
                        "UnsupportedMediaType",
                        "An unsupported media Type was used - " + request.getContentType(),
                        null,
                        null
                );
                errorRes.setErrors(new ArrayList<>(Collections.singletonList(error)));
            } else if (exception instanceof ResourceAccessException) {
                Error error = new Error();
                error.setCode("ResourceAccessError");
                error.setMessage("An error occurred while accessing a underlying resource");
                errors.add(error);
                errorRes.setErrors(errors);
            } else if (exception instanceof org.springframework.http.converter.HttpMessageNotReadableException) {
                Error error = new Error();
                String message = exception.getMessage();
                Throwable cause = exception.getCause();
                if (cause instanceof com.fasterxml.jackson.databind.JsonMappingException) {
                    Pattern pattern = Pattern.compile("(.+)Can not deserialize instance of ([a-z]+\\.)*(?<objecttype>[^ ]+).*\\[\"(?<objectname>[^\"]+)\"].*", Pattern.CASE_INSENSITIVE);
                    Matcher matcher = pattern.matcher(message);
                    if (matcher.find()) {
                        error.setMessage("Failed to parse field - " + matcher.group("objectname") + ". Expected type is " + matcher.group("objecttype"));
                    } else {
                        error.setMessage("Failed to deserialize certain JSON fields");
                    }
                    error.setCode("JsonMappingException");
                } else if (cause instanceof com.fasterxml.jackson.core.JsonParseException) {
                    error.setCode("JsonParseException");
                    String cleanMsg = cause.getMessage()
                            .replaceAll("Source: [^;]+;", "")
                            .replaceAll(" \\(code \\d+\\)", "")
                            .replaceAll("\\n", "");
                    error.setMessage(cleanMsg);
                } else {
                    error.setMessage("JSON body has errors or is missing");
                    error.setCode("MissingJsonException");
                }
                errors.add(error);
                errorRes.setErrors(errors);
            } else if (exception instanceof MethodArgumentNotValidException) {
                MethodArgumentNotValidException methodArgumentNotValidException = (MethodArgumentNotValidException) exception;
                errorRes.setErrors(getBindingErrors(methodArgumentNotValidException.getBindingResult(), errors));
            } else if (exception instanceof CustomBindingResultExceprion) {
                CustomBindingResultExceprion customBindingResultException = (CustomBindingResultExceprion) exception;
                errorRes.setErrors(getBindingErrors(customBindingResultException.getBindingResult(), errors));
            } else if (exception instanceof CustomException) {
                CustomException customException = (CustomException) exception;
                populateCustomErrors(customException, errors);
                errorRes.setErrors(errors);
            } else if (exception instanceof ServiceCallException) {
                ServiceCallException serviceCallException = (ServiceCallException) exception;
                sendErrorMessage(body, exception, request.getRequestURL().toString(), errorRes, isJson);
                try {
                    com.jayway.jsonpath.DocumentContext documentContext = com.jayway.jsonpath.JsonPath.parse(serviceCallException.getError());
                    LinkedHashMap<?, ?> errorMap = (LinkedHashMap<?, ?>) documentContext.json();
                    return new ResponseEntity<>(errorMap, HttpStatus.BAD_REQUEST);
                } catch (Exception e) {
                    // ignore
                }
            } else if (exception instanceof MissingServletRequestParameterException) {
                MissingServletRequestParameterException missingServletRequestParameterException = (MissingServletRequestParameterException) exception;
                Error error = new Error();
                error.setCode("");
                error.setMessage(missingServletRequestParameterException.getMessage());
                List<String> params = new ArrayList<>();
                params.add(missingServletRequestParameterException.getParameterName());
                error.setParams(params);
                errors.add(error);
                errorRes.setErrors(errors);
            } else if (exception instanceof BindException) {
                BindException bindException = (BindException) exception;
                errorRes.setErrors(getBindingErrors(bindException.getBindingResult(), errors));
            }

            String simpleName = exception.getClass().getSimpleName();
            String exMessage = exception.getMessage();
            if (errorRes.getErrors() == null || errorRes.getErrors().isEmpty()) {
                Error error = new Error(simpleName, "An unhandled exception occurred on the server", exMessage, null);
                errorRes.setErrors(new ArrayList<>(Collections.singletonList(error)));
            } else if (provideExceptionInDetails) {
                StringWriter stringWriter = new StringWriter();
                PrintWriter printWriter = new PrintWriter(stringWriter);
                exception.printStackTrace(printWriter);
                errorRes.getErrors().get(0).setDescription(stringWriter.toString());
            }

            sendErrorMessage(body, exception, request.getRequestURL().toString(), errorRes, isJson);

        } catch (Exception e) {
            log.error("Error in tracer", e);
            Error error = new Error("TracerException", "An unhandled exception occurred in tracer handler", null, null);
            errorRes.setErrors(new ArrayList<>(Collections.singletonList(error)));
        }

        return new ResponseEntity<>(errorRes, HttpStatus.BAD_REQUEST);
    }

    private List<Error> getBindingErrors(BindingResult bindingResult, List<Error> errors) {
        List<ObjectError> allErrors = bindingResult.getAllErrors();
        for (ObjectError objectError : allErrors) {
            Error error = new Error();
            String[] codes = objectError.getCodes();
            error.setCode(codes == null ? null : codes[0]);
            if (objectError instanceof FieldError) {
                FieldError fieldError = (FieldError) objectError;
                error.setMessage(fieldError.getDefaultMessage());
            } else {
                error.setMessage(codes == null ? null : codes[0]);
            }
            errors.add(error);
        }
        return errors;
    }

    private void populateCustomErrors(CustomException customException, List<Error> errors) {
        Map<String, String> customErrors = customException.getErrors();
        if (customErrors != null && !customErrors.isEmpty()) {
            for (Map.Entry<String, String> entry : customErrors.entrySet()) {
                Error error = new Error();
                error.setCode(entry.getKey());
                error.setMessage(entry.getValue());
                errors.add(error);
            }
        } else {
            Error error = new Error();
            error.setCode(customException.getCode());
            error.setMessage(customException.getMessage());
            errors.add(error);
        }
    }

    void sendErrorMessage(String body, Exception exception, String source, ErrorRes errorRes, boolean isJson) {
        if (tracerProperties.isErrorsPublish()) {
            Object parsedBody = body;
            if (isJson) {
                try {
                    parsedBody = com.jayway.jsonpath.JsonPath.parse(body).json();
                } catch (Exception e) {
                    parsedBody = body;
                }
            }
            List<StackTraceElement> stackTrace = Arrays.asList(exception.getStackTrace());
            ErrorQueueContract errorQueueContract = ErrorQueueContract.builder()
                    .id(UUID.randomUUID().toString())
                    .correlationId(MDC.get("CORRELATION_ID"))
                    .body(parsedBody)
                    .source(source)
                    .ts(new Date().getTime())
                    .errorRes(errorRes)
                    .exception(stackTrace)
                    .message(exception.getMessage())
                    .build();
            errorQueueProducer.sendMessage(errorQueueContract);
        }
    }
}
