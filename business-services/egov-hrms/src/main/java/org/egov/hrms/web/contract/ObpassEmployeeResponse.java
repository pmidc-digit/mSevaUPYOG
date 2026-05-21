package org.egov.hrms.web.contract;

import java.util.List;

import org.egov.common.contract.response.ResponseInfo;
import org.egov.hrms.model.ObpasEmployee;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ObpassEmployeeResponse {

    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("Employees")
    private List<ObpasEmployee> employees;
}
