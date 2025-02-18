package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ScorecardSurveyEntity {
    @Size(max = 128)
    @JsonProperty("uuid")
    private String uuid;
    
    @Size(max = 128)
    @JsonProperty("tenantId")
    private String tenantId;

    @Size(max = 60)
    @JsonProperty("surveyTitle")
    private String surveyTitle;

    @Size(max = 128)
    @JsonProperty("surveyCategory")
    private String surveyCategory;

    @Size(max = 140)
    @JsonProperty("surveyDescription")
    private String surveyDescription;

    @NotNull
    @JsonProperty("sections")
    private List<Section> sections;

    @NotBlank
    @JsonProperty("startDate")
    private Long startDate;

    @NotBlank
    @JsonProperty("endDate")
    private Long endDate;

    @Size(max = 128)
    @JsonProperty("postedBy")
    private String postedBy;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;

    @JsonProperty("active")
    private Boolean active;

    @JsonProperty("answersCount")
    private Long answersCount;

    @JsonProperty("hasResponded")
    private Boolean hasResponded;

    public ScorecardSurveyEntity addSectionsItem(Section sectionItem) {
        if (this.sections == null) {
            this.sections = new ArrayList<>();
        }
        if (null != sectionItem) this.sections.add(sectionItem);
        return this;
    }

}