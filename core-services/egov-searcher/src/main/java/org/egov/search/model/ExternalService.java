package org.egov.search.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ExternalService {

    @JsonProperty("entity")
    private String entity;

    @JsonProperty("apiURL")
    private String apiURL;

    @JsonProperty("keyOrder")
    private String keyOrder;

    @JsonProperty("tableName")
    private String tableName;

    @JsonProperty("stateData")
    private Boolean stateData = false;

    @JsonProperty("postObject")
    private String postObject;

    @JsonProperty("criteria")
    private String criteria;

    public Boolean getStateData() {
        return stateData != null && stateData;
    }
}
