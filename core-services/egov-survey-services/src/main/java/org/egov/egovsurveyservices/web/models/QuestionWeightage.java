package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class QuestionWeightage {
    @JsonProperty("questionUuid")
    private String questionUuid;

    @NotNull
    @JsonProperty("weightage")
    private Integer weightage;
}