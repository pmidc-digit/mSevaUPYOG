
package org.egov.pt.calculator.web.models.rl.model.notifi;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationSchedule {

    @JsonProperty("id")
    private String id;

    @JsonProperty("allotmentId")
    private String allotmentId;

    @JsonProperty("applicationNumber")
    private String applicationNumber;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("status")
    private int status;

    @JsonProperty("paymentSuccessId")
    private String paymentSuccessId;

    @JsonProperty("demandId")
    private String demandId;

    @JsonProperty("currentNotificationDate")
    private long currentNotificationDate;

    @JsonProperty("nextCycle")
    private String nextCycle;

    @JsonProperty("nextNotificationDate")
    private String nextNotificationDate;

    @JsonProperty("notificationType")
    private String notificationType;

    @JsonProperty("notificationStatus")
    private int notificationStatus;

    @JsonProperty("notificationCountForCurrentCycle")
    private int notificationCountForCurrentCycle;

    @JsonProperty("notificationMessage")
    private String notificationMessage;

    @JsonProperty("paymentLink")
    private String paymentLink;

    @JsonProperty("createdTime")
    private long createdTime;

    @JsonProperty("createdBy")
    private String createdBy;

    @JsonProperty("lastmodifiedTime")
    private Long lastmodifiedTime;

    @JsonProperty("lastmodifiedBy")
    private String lastmodifiedBy;
}
