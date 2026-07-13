package org.egov.layout.web.model;

import java.util.List;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
//import org.hibernate.validator.constraints.SafeHtml;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LayoutSearchCriteria {

    @NotNull
    @SanitizeHtml
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("ids")
    private List<String> ids;

    @SanitizeHtml
    @JsonProperty("applicationNo")
    private String applicationNo;

    @SanitizeHtml
    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @SanitizeHtml
    @JsonProperty("layoutNo")
    private String layoutNo;

    @SanitizeHtml
    @JsonProperty("source")
    private String source;

    @SanitizeHtml
    @JsonProperty("nocType")
    private String nocType;

    @SanitizeHtml
    @JsonProperty("sourceRefId")
    private String sourceRefId;

    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("createdBy")
    private String createdBy;

    @JsonIgnore
    private List<String> ownerIds;

    @JsonProperty("accountId")
    private List<String> accountId;
    
    @JsonProperty("applicationStatus")
    private String applicationStatus;

    @JsonProperty("status")
    private List<String> status;

    @SanitizeHtml
//    @Size(min = 1, max = 15)
    @JsonProperty("vasikaNumber")
    private String vasikaNumber = null;

    @JsonProperty("vasikaDate")
    private String vasikaDate = null;

    public boolean isEmpty() {
        return (this.tenantId == null && this.ids == null && this.applicationNo == null
                && this.layoutNo == null && this.accountId == null && this.status == null);
    }

    public boolean tenantIdOnly() {
        return (this.tenantId == null && this.ids == null && this.applicationNo == null
                && this.layoutNo == null && this.accountId == null && this.status == null);
    }
}
