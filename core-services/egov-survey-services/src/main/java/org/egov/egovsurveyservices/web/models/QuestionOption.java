package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionOption {
    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("questionUuid")
    private String questionUuid;

    @JsonProperty("optionText")
    @NotBlank(message = "Option text cannot be blank")
    private String optionText;

    @Min(value = 1, message = "Weightage must be greater than or equal to 1")
    @Max(value = 100, message = "Weightage must be less than or equal to 100")
    @JsonProperty("weightage")
    private Double weightage;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
}
