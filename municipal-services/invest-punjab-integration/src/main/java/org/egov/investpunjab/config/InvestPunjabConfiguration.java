package org.egov.investpunjab.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
public class InvestPunjabConfiguration {

    // Direct Kafka Topics
    @Value("${kafka.topics.invest.punjab.status.update:${kafka.topics.pdc.status.update:update-invest-punjab-status}}")
    private String kafkaTopicsStatusUpdate;

    @Value("${kafka.topics.invest.punjab.status.success:${kafka.topics.pdc.status.success:invest-punjab-status-success}}")
    private String kafkaTopicsStatusSuccess;

    @Value("${kafka.topics.invest.punjab.status.error:${kafka.topics.pdc.status.error:invest-punjab-status-error}}")
    private String kafkaTopicsStatusError;

    // Trade License (TL) Municipal Topics
    @Value("${kafka.topics.tl.save:save-tl-tradelicense}")
    private String kafkaTopicsTlSave;

    @Value("${kafka.topics.tl.update:update-tl-tradelicense}")
    private String kafkaTopicsTlUpdate;

    @Value("${kafka.topics.tl.workflow:update-tl-workflow}")
    private String kafkaTopicsTlWorkflow;

    // Water Connection (WS) Municipal Topics
    @Value("${kafka.topics.ws.save:save-ws-connection}")
    private String kafkaTopicsWsSave;

    @Value("${kafka.topics.ws.update:update-ws-connection}")
    private String kafkaTopicsWsUpdate;

    @Value("${kafka.topics.ws.workflow:update-ws-workflow}")
    private String kafkaTopicsWsWorkflow;

    // Sewerage Connection (SW) Municipal Topics
    @Value("${kafka.topics.sw.save:save-sw-connection}")
    private String kafkaTopicsSwSave;

    @Value("${kafka.topics.sw.update:update-sw-connection}")
    private String kafkaTopicsSwUpdate;

    @Value("${kafka.topics.sw.workflow:update-sw-workflow}")
    private String kafkaTopicsSwWorkflow;

    // FastTrack Invest Punjab Portal URLs & Key
    @Value("${invest.punjab.base.url:${pdc.base.url:https://fasttrack.punjab.gov.in}}")
    private String baseUrl;

    @Value("${invest.punjab.token.path:${pdc.token.path:/integration-staging/api/iptoken/gettoken/v1}}")
    private String tokenPath;

    @Value("${invest.punjab.status.path:${pdc.status.path:/integration-staging/api/localgovt/updateStatus}}")
    private String statusPath;

    @Value("${invest.punjab.caf.path:${pdc.caf.path:/integration-staging/api/localgovt/getCAFData}}")
    private String cafPath;

    @Value("${invest.punjab.integration.key:${pdc.integration.key:UAT_LG}}")
    private String integrationKey;

    @Value("${invest.punjab.return.url:${pdc.return.url:https://fasttrack.punjab.gov.in/testportal/dashboard/investor-dashboard?t=RC&role=INVT}}")
    private String returnUrl;

    // Redis Token Cache
    @Value("${invest.punjab.token.cache.key:${pdc.token.cache.key:INVEST_PUNJAB_AUTH_TOKEN}}")
    private String tokenCacheKey;

    @Value("${invest.punjab.token.min.buffer.seconds:${pdc.token.min.buffer.seconds:30}}")
    private long tokenMinBufferSeconds;

    @Value("${invest.punjab.token.default.ttl:${pdc.token.default.ttl:3600}}")
    private long tokenDefaultTtl;

    // Security Keys
    @Value("${invest.punjab.aes.secret.key:${pdc.aes.secret.key:N78I99C8t--L0008}}")
    private String aesSecretKey;

    @Value("${invest.punjab.checksum.secret.key:${pdc.checksum.secret.key:BF9EFK9tEbJF}}")
    private String checksumSecretKey;

    @Value("${invest.punjab.default.source:${pdc.default.source:LG}}")
    private String defaultSource;
}
