package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class Section {

    @JsonProperty("uuid")
    private String uuid;

    @NotBlank
    @JsonProperty("title")
    private String title;

    @NotNull
    @JsonProperty("weightage")
    private BigDecimal weightage;

    @JsonProperty("sectionOrder")
    private Integer sectionOrder;

    @NotNull
    @JsonProperty("questions")
    private List<QuestionWeightage> questions;
}