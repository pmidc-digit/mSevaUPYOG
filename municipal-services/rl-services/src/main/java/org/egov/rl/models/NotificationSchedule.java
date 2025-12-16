
package org.egov.rl.models;

import java.time.LocalDateTime;
import java.util.Date;

import org.egov.rl.models.enums.SchedullerType;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    
    @JsonProperty("isPayementReminder")
    private boolean ispayement_reminder;

    @JsonProperty("paymentSuccessId")
    private String paymentSuccessId;

    @NonNull
    @JsonProperty("demandId")
    private String demandId;


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @JsonProperty("notificationCreatedDate")
    private LocalDateTime notificationCreatedDate;

    @JsonProperty("schedullerType")
    private String schedullerType;
    
    @JsonProperty("cycleCount")
    private int cycleCount;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @JsonProperty("nextCycleDate")
    private LocalDateTime nextCycleDate;

    @JsonProperty("notificationType")
    private int notificationType;

    @JsonProperty("lastNotificationStatus")
    private String lastNotificationStatus;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @JsonProperty("lastNotificationDate")
    private LocalDateTime lastNotificationDate;

    @JsonProperty("notificationCountForCurrentCycle")
    private int notificationCountForCurrentCycle;
    
    @JsonProperty("noOfNotificationHaveToSend")
    private int noOfNotificationHavetoSend;
    
    @JsonProperty("notificationInteravalInDay")
    private int notificationInteravalInDay;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @JsonProperty("lastPaymentDate")
    private LocalDateTime lastPaymentDate;

    @JsonProperty("createdTime")
    private long createdTime;

    @JsonProperty("createdBy")
    private String createdBy;

    @JsonProperty("lastmodifiedTime")
    private Long lastmodifiedTime;

    @JsonProperty("lastmodifiedBy")
    private String lastmodifiedBy;
}
