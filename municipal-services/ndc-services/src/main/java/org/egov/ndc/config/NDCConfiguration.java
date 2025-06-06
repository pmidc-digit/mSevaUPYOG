package org.egov.ndc.config;

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
public class NDCConfiguration {

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

	@Value("${egov.localization.statelevel}")
	private Boolean isLocalizationStateLevel;
	
	@Value("${egov.idgen.host}")
	private String idGenHost;

	@Value("${egov.idgen.path}")
	private String idGenPath;

	@Value("${egov.idgen.ndc.application.id}")
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
	
	@Value("${persister.save.ndc.topic}")
	private String saveTopic;

	@Value("${persister.update.ndc.topic}")
	private String updateTopic;

	@Value("${persister.delete.ndc.topic}")
	private String deleteTopic;
	
	@Value("${egov.ndc.pagination.default.limit}")
	private Integer defaultLimit;

	@Value("${egov.ndc.pagination.default.offset}")
	private Integer defaultOffset;

	@Value("${egov.ndc.pagination.max.limit}")
	private Integer maxSearchLimit;
	
	@Value("${ndc.offline.doc.required}")
	private Boolean ndcOfflineDocRequired;

	//bpa configuration
    @Value("${egov.bpa.host}")
    private String bpaHost;

    @Value("${egov.bpa.context.path}")
    private String bpaContextPath;

    @Value("${egov.bpa.search.endpoint}")
    private String bpaSearchEndpoint;

	@Value("${property.service.host}")
	private String propertyServicePath;

	@Value("${water.service.host}")
	private String waterConnectionServicePath;

	@Value("${sewerage.service.host}")
	private String sewerageConnectionServicePath;

	@Value("${billing.service.host}")
	private String billingServicePath;

	@Value("${property.service.search.endpoint}")
	private String propertySearchPath;

	@Value("${water.service.search.endpoint}")
	private String waterSearchPath;

	@Value("${sewerage.service.search.endpoint}")
	private String sewerageSearchPath;

	@Value("${billing.service.fetchbill.endpoint}")
	private String fetchBillPath;

}
