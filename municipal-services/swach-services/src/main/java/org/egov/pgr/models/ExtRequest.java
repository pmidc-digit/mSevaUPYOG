package org.egov.pgr.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtRequest {
    @JsonProperty("pmidc_complaint_number")
    private String pmidcComplaintNumber;

    @JsonProperty("pmidc_status")
    private String pmidcStatus;

}
