package org.egov.hrms.web.contract;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.egov.common.contract.request.RequestInfo;
import org.egov.hrms.model.ObpasEmployee;
import jakarta.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class ObpasEmployeeRequest {
    @NotNull
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @Valid
    @NotEmpty
    @JsonProperty("Employees")
    private List<ObpasEmployee> employees;
}
