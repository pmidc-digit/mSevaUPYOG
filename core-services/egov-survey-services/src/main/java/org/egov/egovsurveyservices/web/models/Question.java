package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.egovsurveyservices.web.models.enums.Status;
import org.egov.egovsurveyservices.web.models.enums.Type;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Question {

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("tenantId")
    @NotBlank
    private String tenantId;

    @JsonProperty("surveyId")
    private String surveyId;

    @NotBlank(message = "Question statement cannot be blank")
    @JsonProperty("questionStatement")
    @Size(max = 140, message = "Question statement must be at most 140 characters")
    private String questionStatement;

    @JsonProperty("options")
    private List<String> options;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;

    @JsonProperty("status")
    private Status status;

    @JsonProperty("type")
    @NotNull(message="The value provided is either Invalid or null")
    private Type type;

    @JsonProperty("required")
    private Boolean required;

    @JsonProperty("qorder")
    private Long qorder;

    @JsonProperty("categoryId")
    @NotBlank
    private String categoryId;

    @JsonProperty("category")
    private Category category;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return Objects.equals(uuid, question.uuid) && Objects.equals(tenantId, question.tenantId) && Objects.equals(surveyId, question.surveyId) && Objects.equals(questionStatement, question.questionStatement) && Objects.equals(options, question.options) && status == question.status && type == question.type && Objects.equals(required, question.required) && Objects.equals(qorder, question.qorder) && Objects.equals(categoryId, question.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(uuid, tenantId, surveyId, questionStatement, options, status, type, required, qorder, categoryId);
    }

}
