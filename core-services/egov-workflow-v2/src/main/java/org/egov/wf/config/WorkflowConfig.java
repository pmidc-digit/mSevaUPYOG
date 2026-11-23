package org.egov.wf.config;

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
import java.util.TimeZone;



@Import({TracerConfiguration.class})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Component
public class WorkflowConfig {



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


    @Value("${egov.wf.default.limit}")
    private Integer defaultLimit;

    @Value("${egov.wf.default.offset}")
    private Integer defaultOffset;

    @Value("${egov.wf.max.limit}")
    private Integer maxSearchLimit;

    @Value("${persister.save.transition.wf.topic}")
    private String saveTransitionTopic;

    @Value("${persister.save.businessservice.wf.topic}")
    private String saveBusinessServiceTopic;

    @Value("${persister.update.businessservice.wf.topic}")
    private String updateBusinessServiceTopic;



    //MDMS
    @Value("${egov.mdms.host}")
    private String mdmsHost;

    @Value("${egov.mdms.search.endpoint}")
    private String mdmsEndPoint;


    //User
    @Value("${egov.user.host}")
    private String userHost;

    @Value("${egov.user.search.endpoint}")
    private String userSearchEndpoint;

    @Value("${egov.wf.inbox.assignedonly}")
    private Boolean assignedOnly;


    // Statelevel tenantId required for escalation
    @Value("${egov.statelevel.tenantid}")
    private String stateLevelTenantId;

    @Value("${egov.wf.escalation.batch.size}")
    private Integer escalationBatchSize;

    // Notification
    @Value("${kafka.topics.notification.sms:egov.core.notification.sms}")
    private String smsNotifTopic;

    @Value("${kafka.topics.notification.email:org.egov.core.notification.email}")
    private String emailNotifTopic;

    @Value("${notification.sms.enabled:true}")
    private Boolean isSmsNotificationEnabled;

    @Value("${notification.email.enabled:true}")
    private Boolean isEmailNotificationEnabled;

    @Value("${notification.employee.portal.url:https://mseva-dev.lgpunjab.gov.in/digit-ui/employee/user/login}")
    private String employeePortalUrl;

    @Value("${notification.citizen.portal.url:https://mseva-dev.lgpunjab.gov.in/digit-ui/citizen/login}")
    private String citizenPortalUrl;

    @Value("${notification.sms.template.id:EG_WF_ASSIGNEE_MSG}")
    private String smsTemplateId;

    @Value("${notification.email.template.id:EG_WF_ASSIGNEE_EMAIL}")
    private String emailTemplateId;

    // Localization
    @Value("${egov.localization.host:https://dev.digit.org/}")
    private String localizationHost;

    @Value("${egov.localization.context.path:localization/messages/v1}")
    private String localizationContextPath;

    @Value("${egov.localization.search.endpoint:/_search}")
    private String localizationSearchEndpoint;

    @Value("${egov.localization.statelevel:true}")
    private Boolean isLocalizationStateLevel;

    @Value("${egov.localization.fallback.locale:en_IN}")
    private String fallbackLocale;

    @Value("${egov.localization.module:rainmaker-workflow}")
    private String localizationModule;

}
