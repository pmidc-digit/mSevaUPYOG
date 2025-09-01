package org.egov.noc.calculator.web.models.noc;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NocApplicationSearchResponse {
    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;
    @JsonProperty("Applications")
    private List<NocApplicationRequest> applications;
    private Integer totalCount;
}