
package org.egov.rl.models;

import java.sql.Timestamp;
import java.util.Date;

import org.egov.rl.models.enums.SchedullerType;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Data
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationSchedule {

	@NonNull
    @JsonProperty("id")
    private String id;

	@NonNull
    @JsonProperty("allotmentId")
    private String allotmentId;
	
    @JsonProperty("businessServices")
    private String businessServices;
	
	@NonNull
    @JsonProperty("applicationNumber")
    private String applicationNumber;

	@JsonProperty("applicationNumberStatus")
    private String applicationNumberStatus;
	
	@NonNull
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("status")
    private int status;

    @JsonProperty("paymentSuccessId")
    private String paymentSuccessId;

    @NonNull
    @JsonProperty("demandId")
    private String demandId;

    @JsonProperty("notificationCreatedDate")
    private Timestamp notificationCreatedDate;

    @JsonProperty("schedullerType")
    private String schedullerType;
    
    @JsonProperty("cycleCount")
    private int cycleCount;
    
    @JsonProperty("nextCycleDate")
    private String nextCycleDate;

    @JsonProperty("notificationType")
    private int notificationType;

    @JsonProperty("lastNotificationStatus")
    private String lastNotificationStatus;
    
    @JsonProperty("lastNotificationDate")
    private Timestamp lastNotificationDate;

    @JsonProperty("notificationCountForCurrentCycle")
    private int notificationCountForCurrentCycle;
    
    @JsonProperty("noOfNotificationHavetoSend")
    private int noOfNotificationHavetoSend;
    
    @JsonProperty("notificationInteravalInDay")
    private int notificationInteravalInDay;
    
    @JsonProperty("lastPaymentDate")
    private long lastPaymentDate;

    @JsonProperty("createdTime")
    private long createdTime;

    @JsonProperty("createdBy")
    private String createdBy;

    @JsonProperty("lastmodifiedTime")
    private Long lastmodifiedTime;

    @JsonProperty("lastmodifiedBy")
    private String lastmodifiedBy;
}
