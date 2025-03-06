package org.egov.egovsurveyservices.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class AnswerRequest {

    @JsonProperty("AnswerEntity")
    AnswerEntity answerEntity;

    @JsonProperty("user")
    User user;

    @JsonProperty("RequestInfo")
    RequestInfo requestInfo;
}
