package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnswerNew {
    @JsonProperty("uuid")
    private String uuid;
    @JsonProperty("sectionUuid")
    private String sectionUuid;
    @JsonProperty("questionUuid")
    private String questionUuid;
    @JsonProperty("answerDetails")
    private List<AnswerDetail> answerDetails;
    @JsonProperty("comments")
    private String comments;
    private AuditDetails auditDetails;
}
