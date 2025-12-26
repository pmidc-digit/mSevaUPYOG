package org.egov.rl.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import org.egov.tracer.config.TracerConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

import java.math.BigDecimal;
import java.util.List;
import java.util.TimeZone;


@Import({TracerConfiguration.class})
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Component
public class RentLeaseConfiguration {

    @Value("${app.timezone}")
    private String timeZone;

    @PostConstruct
    public void initialize() {
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
    }

    @Bean
    @Autowired
    public MappingJackson2HttpMessageConverter jacksonConverter(ObjectMapper objectMapper) {
    MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
    converter.setObjectMapper(objectMapper);
    return converter;
    }


      
    //trade license
    @Value("${egov.tl.host}")
    private String tradeLicenseHost;
    
    @Value("${egov.tl.search.path}")
    private String tradeLicenseSearchEndpoint;

    //USER
    @Value("${egov.user.host}")
    private String userHost;
    
    @Value("${egov.user.search.path}")
    private String userSearchEndpoint;

    @Value("${egov.internal.microservice.user.uuid}")
    private String egovInternalMicroserviceUserUuid;


    //IDGEN config
    
    @Value("${egov.idgen.host}")
    private String idGenHost;

    @Value("${egov.idgen.path}")
    private String idGenPath;
    
    @Value("${egov.idgen.applicationnumber.name}")
    private String allotmentApplicationNummberGenName;

    @Value("${egov.idgen.applicationnumber.format}")
    private String allotmentApplicationNummberGenNameFormat;

    @Value("${egov.rl.reg.number.name}")
    private String rlRegistrationNumber;

    @Value("${egov.rl.reg.number.format}")
    private String rlRegistrationNumberFormat;

    
    @Value("${egov.idgen.ack.name}")
    private String ackIdGenName;

    @Value("${egov.idgen.ack.format}")
    private String ackIdGenFormat;
    
    @Value("${egov.idgen.mutation.name}")
    private String mutationIdGenName;

    @Value("${egov.idgen.mutation.format}")
    private String mutationIdGenFormat;

    @Value("${egov.idgen.assm.name}")
    private String assessmentIdGenName;

    @Value("${egov.idgen.assm.format}")
    private String assessmentIdGenFormat;

    @Value("${egov.idgen.ptid.name}")
    private String propertyIdGenName;

    @Value("${egov.idgen.ptid.format}")
    private String propertyIdGenFormat;


    //NOTIFICATION TOPICS
    @Value("${kafka.topics.notification.sms}")
    private String smsNotifTopic;

    @Value("${kafka.topics.notification.email}")
    private String emailNotifTopic;

    @Value("${kafka.topics.receipt.create}")
    private String receiptTopic;

    @Value("${kafka.topics.notification.pg.save.txns}")
    private String pgTopic;

    @Value("${egov.localization.statelevel}")
    private Boolean isStateLevel;

    @Value("${notif.sms.enabled}")
    private Boolean isSMSNotificationEnabled;

    @Value("${notif.email.enabled}")
    private Boolean isEmailNotificationEnabled;
    
    // Notif variables 
    
    @Value("${egov.notif.commonpay}")
    private String commonPayLink;
    
    @Value("${egov.notif.view.property}")
    private String viewPropertyLink;
    
    @Value("${egov.notif.view.mutation}")
    private String viewMutationLink;

    @Value("${egov.notif.citizen.feedback}")
    private String citizenFeedbackLink;

    @Value("${egov.usr.events.view.history.link}")
    private String userEventViewPropertyLink;
    
    @Value("${egov.usr.events.view.mutation.history.link}")
    private String userEventViewMutationLink;

    @Value("${egov.usr.events.download.receipt.link}")
    private String userEventReceiptDownloadLink;
    
    //Property Search Params // allotment
    
    @Value("${save.rl.allotment}")
    private String saveRLAllotmentTopic;
    
    @Value("${update.rl.allotment}")
    private String updateRLAllotmentTopic;

    @Value("${save.rl.clsure}")
    private String saveRLClsureTopic;
    
    @Value("${update.rl.clsure}")
    private String updateRLClsureTopic;

    @Value("${citizen.allowed.search.params}")
    private String citizenSearchParams;

    @Value("${employee.allowed.search.params}")
    private String employeeSearchParams;

    @Value("${notification.url}")
    private String notificationURL;
    
    @Value("${rl.search.pagination.default.limit}")
    private Long defaultLimit;

    @Value("${rl.search.pagination.default.offset}")
    private Long defaultOffset;
    
    @Value("${rl.search.pagination.max.search.limit}")
    private Long maxSearchLimit;

    //Localization
    @Value("${egov.localization.host}")
    private String localizationHost;

    @Value("${egov.localization.context.path}")
    private String localizationContextPath;

    @Value("${egov.localization.search.endpoint}")
    private String localizationSearchEndpoint;

    @Value("${egov.localization.fallback.locale}")
    private String fallBackLocale;

    //USER EVENTS
	@Value("${egov.ui.app.host}")
	private String uiAppHost;
    
	@Value("${egov.usr.events.create.topic}")
	private String saveUserEventsTopic;
		
	@Value("${egov.usr.events.pay.link}")
	private String payLink;
	
	@Value("${egov.usr.events.pay.code}")
	private String payCode;
	
	@Value("${egov.user.event.notification.enabled}")
	private Boolean isUserEventsNotificationEnabled;

    @Value("${egov.msg.download.receipt.link}")
    private String receiptDownloadLink;
	
		

    // Workflow
	
    @Value("${pt.business.codes}")
    private List<String> businessServiceList;

    @Value("${workflow.host}")
    private String wfHost;

    @Value("${workflow.transition.path}")
    private String wfTransitionPath;

    @Value("${workflow.businessservice.search.path}")
    private String wfBusinessServiceSearchPath;

    @Value("${workflow.processinstance.search.path}")
    private String wfProcessInstanceSearchPath;

    @Value("${is.workflow.enabled}")
    private Boolean isWorkflowEnabled;
    
    @Value("${is.mutation.workflow.enabled}")
    private Boolean isMutationWorkflowEnabled;
    
    // ##### mdms     
    @Value("${egov.mdms.host}")
    private String mdmsHost;

    @Value("${egov.mdms.search.endpoint}")
    private String mdmsEndpoint;
    
   	

    // Calculation
    @Value("${egov.localization.statelevel}")
    private Boolean isLocalizationStateLevel;


    // url shortner
    @Value("${egov.url.shortner.host}")
    private String urlShortnerHost;

    @Value("${egov.url.shortner.endpoint}")
    private String urlShortnerEndpoint;

    @Value("${state.level.tenant.id}")
    private String stateLevelTenantId;

    // claculation
    @Value("${egov.rlcalculator.host}")
    private String rlCalculatorHost;

    @Value("${egov.rlcalculator.endpoint}")
    private String rlCalculatorEndpoint;

}