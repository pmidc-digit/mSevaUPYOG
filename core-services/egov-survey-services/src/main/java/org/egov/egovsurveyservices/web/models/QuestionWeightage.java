package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionWeightage {
    @JsonProperty("questionUuid")
    private String questionUuid;

    @NotNull
    @JsonProperty("weightage")
    private Integer weightage;

    @JsonProperty("qorder")
    private Long qorder;

    @JsonProperty("question")
    private Question question;
}