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
package org.egov.edcr.security.oauth2.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.edcr.security.oauth2.entity.SecuredResource;
import org.egov.edcr.security.oauth2.entity.ResourceDetail;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuration to protect the Api resources with Oauth2 Security
 *
 * @author subhash
 *
 */
@Configuration
@EnableWebSecurity
public class ResourceServerConfiguration {

    private static final Logger LOGGER = LogManager.getLogger(ResourceServerConfiguration.class);
    private static final String APIS_CONFIG = "config/restapi-secured-apis-config.json";
    private static final String APIS_CONFIG_OVERRIDE = "config/restapi-secured-apis-config-override.json";
    private static final String RESOURCE_ID = "egov-edcr";

    @Bean
    @Order(1)
    public SecurityFilterChain resourceSecurityFilterChain(HttpSecurity http) throws Exception {
        SecuredResource securedResource = getSecuredResourceFromResource();
        List<ResourceDetail> resources = securedResource.getResources();
        String[] securedUrls = resources.stream().map(ResourceDetail::getUrl)
                .toArray(String[]::new);

        http.securityMatcher(securedUrls);
        http.csrf(csrf -> csrf.disable());
        http.authorizeHttpRequests(authorize -> resources.forEach(record -> {
            if (StringUtils.isNotEmpty(record.getRoles()))
                authorize.requestMatchers(record.getUrl()).hasAnyRole(extractRoles(record.getRoles()));
            else
                authorize.requestMatchers(record.getUrl()).authenticated();
        }));
        return http.build();
    }

    private SecuredResource getSecuredResourceFromResource() {
        final ObjectMapper mapper = new ObjectMapper();
        InputStream inputStream = null;
        try {
        	inputStream = getResourcesConfig().getInputStream();
            return mapper.readValue(inputStream,
                    SecuredResource.class);
        } catch (IOException e) {
            LOGGER.error("Exception occured while reading data: ", e);
        } finally {
			IOUtils.closeQuietly(inputStream);
        }
        return null;
    }

    private String[] extractRoles(String expression) {
        String arguments = StringUtils.substringBetween(expression, "(", ")");
        if (arguments == null)
            return new String[] { expression };
        return java.util.Arrays.stream(arguments.split(","))
                .map(String::trim)
                .map(role -> StringUtils.strip(role, "'\""))
                .toArray(String[]::new);
    }

    private Resource getResourcesConfig() {
        Resource res = new ClassPathResource(APIS_CONFIG_OVERRIDE);
        if (LOGGER.isDebugEnabled())
            LOGGER.debug("Overridden config present:" + res.exists());
        if (!res.exists())
            res = new ClassPathResource(APIS_CONFIG);
        return res;
    }

}
