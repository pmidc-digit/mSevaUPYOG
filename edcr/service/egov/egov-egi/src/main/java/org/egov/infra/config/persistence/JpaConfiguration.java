/*
 *    eGov  SmartCity eGovernance suite aims to improve the internal efficiency,transparency,
 *    accountability and the service delivery of the government  organizations.
 *
 *     Copyright (C) 2017  eGovernments Foundation
 *
 *     The updated version of eGov suite of products as by eGovernments Foundation
 *     is available at http://www.egovernments.org
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program. If not, see http://www.gnu.org/licenses/ or
 *     http://www.gnu.org/licenses/gpl.html .
 *
 *     In addition to the terms of the GPL license to be adhered to in using this
 *     program, the following additional terms are to be complied with:
 *
 *         1) All versions of this program, verbatim or modified must carry this
 *            Legal Notice.
 *            Further, all user interfaces, including but not limited to citizen facing interfaces,
 *            Urban Local Bodies interfaces, dashboards, mobile applications, of the program and any
 *            derived works should carry eGovernments Foundation logo on the top right corner.
 *
 *            For the logo, please refer http://egovernments.org/html/logo/egov_logo.png.
 *            For any further queries on attribution, including queries on brand guidelines,
 *            please contact contact@egovernments.org
 *
 *         2) Any misrepresentation of the origin of the material is prohibited. It
 *            is required that all modified versions of this material be marked in
 *            reasonable ways as different from the original version.
 *
 *         3) This license does not grant any rights to any user of the program
 *            with regards to rights under trademark law for use of the trade names
 *            or trademarks of eGovernments Foundation.
 *
 *   In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 *
 */

package org.egov.infra.config.persistence;

import org.egov.infra.config.persistence.multitenancy.DomainBasedSchemaTenantIdentifierResolver;
import org.egov.infra.config.persistence.multitenancy.MultiTenantSchemaConnectionProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.support.ClasspathScanningPersistenceUnitPostProcessor;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.Database;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.jta.JtaTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.SharedCacheMode;
import jakarta.persistence.ValidationMode;
import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableTransactionManagement(proxyTargetClass = true)
@PropertySource("classpath:config/persistence-config.properties")
public class JpaConfiguration {

    @Autowired
    private Environment env;

    @Autowired
    private DataSource dataSource;

    @Value("${jpa.showSql}")
    private boolean showSQL;

    @Value("${multitenancy.enabled}")
    private boolean multiTenancyEnabled;

    @Value("${hibernate.cache.use_query_cache}")
    private boolean enableQueryCache;

    @Value("${hibernate.cache.use_second_level_cache}")
    private boolean enableSecondLevelCache;

    @Value("${hibernate.generate_statistics}")
    private String generateStatistics;

    @Value("${hibernate.jdbc.batch_size}")
    private Integer batchUpdateSize;

    @Bean
    public PlatformTransactionManager transactionManager() {
        return new JtaTransactionManager();
    }

    @Bean
    @DependsOn("flyway")
    public EntityManagerFactory entityManagerFactory() {
        LocalContainerEntityManagerFactoryBean entityManagerFactory = new LocalContainerEntityManagerFactoryBean();
        entityManagerFactory.setJtaDataSource(dataSource);
        entityManagerFactory.setPersistenceUnitName("EgovPersistenceUnit");
        entityManagerFactory.setPackagesToScan("org.egov.**.entity");
        entityManagerFactory.setJpaVendorAdapter(jpaVendorAdapter());
        entityManagerFactory.setJpaPropertyMap(additionalProperties());
        entityManagerFactory.setValidationMode(ValidationMode.NONE);
        entityManagerFactory.setSharedCacheMode(
                enableSecondLevelCache ? SharedCacheMode.ENABLE_SELECTIVE : SharedCacheMode.NONE);
        ClasspathScanningPersistenceUnitPostProcessor hbmScanner = new ClasspathScanningPersistenceUnitPostProcessor("org.egov");
        hbmScanner.setMappingFileNamePattern("**/*hbm.xml");
        entityManagerFactory.setPersistenceUnitPostProcessors(hbmScanner);
        entityManagerFactory.afterPropertiesSet();
        return entityManagerFactory.getObject();
    }

    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setDatabase(env.getProperty("jpa.database", Database.class));
        vendorAdapter.setShowSql(showSQL);
        vendorAdapter.setGenerateDdl(env.getProperty("jpa.generateDdl", Boolean.class));
        return vendorAdapter;
    }

    private Map<String, Object> additionalProperties() {
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("hibernate.validator.apply_to_ddl", false);
        properties.put("hibernate.validator.autoregister_listeners", false);
        properties.put("hibernate.boot.allow_jdbc_metadata_access", false);
        properties.put("hibernate.dialect", env.getProperty("hibernate.dialect"));
        properties.put("hibernate.generate_statistics", generateStatistics);
        // Hibernate 7 resolves these settings through its strategy configuration and
        // expects their external (String) representation rather than Boolean objects.
        properties.put("hibernate.cache.use_second_level_cache", Boolean.toString(enableSecondLevelCache));
        properties.put("hibernate.cache.use_query_cache", Boolean.toString(enableQueryCache));
        properties.put("hibernate.transaction.jta.platform", env.getProperty("hibernate.transaction.jta.platform"));
        properties.put("hibernate.transaction.auto_close_session", env.getProperty("hibernate.transaction.auto_close_session"));
        properties.put("hibernate.default_batch_fetch_size", batchUpdateSize);
        properties.put("hibernate.jdbc.batch_versioned_data", true);
        properties.put("hibernate.order_inserts", true);
        properties.put("hibernate.order_updates", true);
        properties.put("hibernate.connection.provider_disables_autocommit", true);
        properties.put("hibernate.connection.handling_mode", "DELAYED_ACQUISITION_AND_RELEASE_AFTER_STATEMENT");

        // Multitenancy Configuration
        if (multiTenancyEnabled) {
            properties.put("hibernate.database.type", env.getProperty("jpa.database"));
            properties.put("hibernate.multi_tenant_connection_provider", multiTenantSchemaConnectionProvider());
            properties.put("hibernate.tenant_identifier_resolver", domainBasedSchemaTenantIdentifierResolver());
        }
        return properties;
    }

    @Bean
    public TransactionTemplate transactionTemplate() {
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager());
        transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        return transactionTemplate;
    }

    @Bean
    @Lazy
    public MultiTenantSchemaConnectionProvider multiTenantSchemaConnectionProvider() {
        return new MultiTenantSchemaConnectionProvider();
    }

    @Bean
    @Lazy
    public DomainBasedSchemaTenantIdentifierResolver domainBasedSchemaTenantIdentifierResolver() {
        return new DomainBasedSchemaTenantIdentifierResolver();
    }
}
