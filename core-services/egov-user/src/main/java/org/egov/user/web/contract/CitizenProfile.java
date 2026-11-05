package org.egov.user.web.contract;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CitizenProfile {

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("name")
    private String name;

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("guardian")
    private String guardian;

    @JsonProperty("fatherOrHusbandName")
    private String fatherOrHusbandName;

    @JsonProperty("guardianRelation")
    private String guardianRelation;

    @JsonProperty("relationship")
    private String relationship;
}
