package org.egov.investpunjab.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestPunjabStatusUpdatePayload {

    @NotNull
    @JsonProperty("iPin")
    private String iPin;

    @NotNull
    @JsonProperty("AppId")
    private String appId;

    @JsonProperty("iPin")
    public String getIPin() {
        return this.iPin;
    }

    @JsonProperty("iPin")
    public void setIPin(String iPin) {
        this.iPin = iPin;
    }

    @JsonProperty("AppId")
    public String getAppId() {
        return this.appId;
    }

    @JsonProperty("AppId")
    public void setAppId(String appId) {
        this.appId = appId;
    }

    @NotNull
    @JsonProperty("statusId")
    private Integer statusId;

    @JsonProperty("statusDesc")
    private String statusDesc;

    @Builder.Default
    @JsonProperty("comments")
    private String comments = "NA";

    @JsonProperty("senderName")
    private String senderName;

    @Builder.Default
    @JsonProperty("senderDesignation")
    private String senderDesignation = "NA";

    @Builder.Default
    @JsonProperty("receiverName")
    private String receiverName = "NA";

    @Builder.Default
    @JsonProperty("receiverDesignation")
    private String receiverDesignation = "NA";

    @Builder.Default
    @JsonProperty("clearanceIssuedOn")
    private String clearanceIssuedOn = "NA";

    @Builder.Default
    @JsonProperty("clearanceExpiredOn")
    private String clearanceExpiredOn = "NA";

    @Builder.Default
    @JsonProperty("licenseNo")
    private String licenseNo = "NA";

    @Builder.Default
    @JsonProperty("clearanceFile")
    private String clearanceFile = "NA";

    @NotNull
    @JsonProperty("statusDate")
    private String statusDate; // Format: YYYY-MM-DD HH:MM:SS

    @Builder.Default
    @JsonProperty("integrationSource")
    private String integrationSource = "LG";

    @Builder.Default
    @JsonProperty("deemedApproval")
    private String deemedApproval = "false";

    @JsonProperty("intAppId")
    private Integer intAppId;

    @Builder.Default
    @JsonProperty("processDays")
    private Integer processDays = 0;

    @JsonProperty("appActionLogId")
    private Integer appActionLogId;

    @Builder.Default
    @JsonProperty("actionSlno")
    private Integer actionSlno = 1;

    @Builder.Default
    @JsonProperty("totalActionsOnApplication")
    private Integer totalActionsOnApplication = 1;
}
