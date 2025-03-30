package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnswerDetail {
    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("answerUuid")
    private String answerUuid;

    @JsonProperty("answerType")
    private String answerType;

    @JsonProperty("answerContent")
    private String answerContent;

    @JsonProperty("weightage")
    private BigDecimal weightage;



    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
}