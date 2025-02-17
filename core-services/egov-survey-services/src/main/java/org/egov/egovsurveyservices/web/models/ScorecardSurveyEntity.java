package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

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

//    @NotNull
//    @JsonProperty("tenantIds")
//    private List<String> tenantIds;
    
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

//    @JsonProperty("insertSectionsForUpdate")
//    private List<Section> insertSectionsForUpdate;

    @JsonProperty("startDate")
    private Long startDate;

    @JsonProperty("endDate")
    private Long endDate;

    @Size(max = 128)
    @JsonProperty("postedBy")
    private String postedBy;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;

//    @Size(max = 128)
//    @JsonProperty("tenantId")
//    private String tenantId;

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
    

//    public ScorecardSurveyEntity addInsertSectionsForUpdateItem(Section sectionItem) {
//        if (this.insertSectionsForUpdate == null) {
//            this.insertSectionsForUpdate = new ArrayList<>();
//        }
//        if (null != sectionItem) this.insertSectionsForUpdate.add(sectionItem);
//        return this;
//    }
	
//	public List<Question> getQuestions() {
//	    if (sections == null || sections.isEmpty()) {
//	        return Collections.emptyList();
//	    }
//
//	    List<Question> questions = new ArrayList<>();
//	    for (Section section : sections) {
//	        if (section.getQuestions() != null) {
//	            for (QuestionWeightage qw : section.getQuestions()) {
//	                if (qw.getQuestion() != null) {
//	                    questions.add(qw.getQuestion()); // Get Question from QuestionWeightage add into questions
//	                }
//	            }
//	        }
//	    }
//	    return questions;
//	}

}