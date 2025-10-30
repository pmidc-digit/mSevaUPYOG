package org.egov.layout.config;

import java.util.TimeZone;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Component
public class LAYOUTConfiguration {

	@Value("${app.timezone}")
	private String timeZone;

	@PostConstruct
	public void initialize() {
		TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
	}

	// User Config
	@Value("${egov.user.host}")
	private String userHost;

	@Value("${egov.user.context.path}")
	private String userContextPath;

	@Value("${egov.user.search.path}")
	private String userSearchEndpoint;

	// SMS
	@Value("${kafka.topics.notification.sms}")
	private String smsNotifTopic;

	@Value("${notification.sms.enabled}")
	private Boolean isSMSEnabled;

	// Localization
	@Value("${egov.localization.host}")
	private String localizationHost;

	@Value("${egov.localization.context.path}")
	private String localizationContextPath;

	@Value("${egov.localization.search.endpoint}")
	private String localizationSearchEndpoint;

	@Value("${layout.taxhead.master.code}")
	private String taxHeadMasterCode;

	@Value("${egov.demand.create.endpoint}")
	private String demandCreateEndpoint;

	@Value("${egov.noccalculator.host}")
	private String nocCalculatorHost;

	@Value("${egov.noccalculator.endpoint}")
	private String nocCalculatorEndpoint;

	@Value("${egov.localization.statelevel}")
	private Boolean isLocalizationStateLevel;
	
	@Value("${egov.idgen.host}")
	private String idGenHost;

	@Value("${egov.idgen.path}")
	private String idGenPath;

	@Value("${egov.idgen.layout.application.id}")
	private String applicationNoIdgenName;
	
	@Value("${workflow.context.path}")
	private String wfHost;

	@Value("${workflow.transition.path}")
	private String wfTransitionPath;

	@Value("${workflow.businessservice.search.path}")
	private String wfBusinessServiceSearchPath;

	@Value("${workflow.process.path}")
	private String wfProcessPath;
		
	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsEndPoint;
	
	@Value("${persister.save.layout.topic}")
	private String saveTopic;

	@Value("${egov.billingservice.host}")
	private String billingServiceHost;

	@Value("${persister.update.layout.topic}")
	private String updateTopic;
	
	@Value("${persister.update.layout.workflow.topic}")
	private String updateWorkflowTopic;
	
	@Value("${egov.layout.pagination.default.limit}")
	private Integer defaultLimit;

	@Value("${egov.layout.pagination.default.offset}")
	private Integer defaultOffset;

	@Value("${egov.layout.pagination.max.limit}")
	private Integer maxSearchLimit;
	
	@Value("${layout.offline.doc.required}")
	private Boolean nocOfflineDocRequired;

	//bpa configuration
    @Value("${egov.bpa.host}")
    private String bpaHost;

    @Value("${egov.bpa.context.path}")
    private String bpaContextPath;

    @Value("${egov.bpa.search.endpoint}")
    private String bpaSearchEndpoint;


	@Value("${spring.kafka.consumer.group-id}")
	private String kafkaGroupId;

}
