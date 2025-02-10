package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class Section {
    @Size(max = 128)
    @JsonProperty("uuid")
    private String uuid;

    @NotBlank
    @JsonProperty("title")
    private String title;

    @NotNull
    @JsonProperty("weightage")
    private Integer weightage;

    @NotNull
    @JsonProperty("questions")
    private List<QuestionWeightage> questions;
}