package org.egov.rl;


import java.util.TimeZone;

import org.egov.encryption.config.EncryptionConfiguration;
import org.egov.tracer.config.TracerConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@ComponentScan(basePackages = { "org.egov.rl", "org.egov.rl.web.controllers" , "org.egov.rl.config","org.egov.rl.repository","org.egov.rl.consumer"})
@Import({ TracerConfiguration.class, EncryptionConfiguration.class })
@EnableCaching
@EnableKafka
public class RentLeaseApplication {

    @Value("${app.timezone}")
    private String timeZone;
    
    @Value("${cache.expiry.masterdata.minutes:5}")
    private long taxMasterDataCacheExpiry;

    @Bean
    public ObjectMapper objectMapper(){
    return new ObjectMapper()
    		.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
    		.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
    		.setTimeZone(TimeZone.getTimeZone(timeZone));
    }
    
    public static void main(String[] args) throws Exception {
        SpringApplication.run(RentLeaseApplication.class, args);
    }

	/*
	 * @Bean
	 * 
	 * @Profile("!test") public CacheManager cacheManager() { return new
	 * SpringCache2kCacheManager()
	 * .addCaches(b->b.name("cMDMSAttributeValues").expireAfterWrite(
	 * taxMasterDataCacheExpiry, TimeUnit.MINUTES).entryCapacity(50))
	 * .addCaches(b->b.name("mdmsMaster").expireAfterWrite(taxMasterDataCacheExpiry,
	 * TimeUnit.MINUTES).entryCapacity(50)); }
	 * 
	 * 
	 * @Bean("tenantKeyGenerator") public KeyGenerator keyGenerator() { return new
	 * TenantKeyGenerator(); }
	 */
    
}
