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

package org.egov.infra.web.filter;

import static org.egov.infra.utils.ApplicationConstant.CITY_CODE_KEY;
import static org.egov.infra.web.utils.WebUtils.extractRequestDomainURL;
import static org.egov.infra.web.utils.WebUtils.extractRequestedDomainName;

import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.Resource;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.egov.infra.admin.master.entity.City;
import org.egov.infra.admin.master.service.CityService;
import org.egov.infra.config.core.ApplicationThreadLocals;
import org.egov.infra.config.core.EnvironmentSettings;
import org.egov.infra.rest.support.MultiReadRequestWrapper;
import org.egov.infra.utils.TenantUtils;
import org.egov.infra.validation.exception.ApplicationRestException;
import org.egov.infra.web.utils.ThreadLocalLogger;
import org.egov.infra.web.utils.WebUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

public class ApplicationTenantResolverFilter implements Filter {

    @Autowired
    private EnvironmentSettings environmentSettings;

    @Resource(name = "cities")
    private transient List<String> cities;

    public static Map<String, String> tenants = new HashMap<>();

    public static String stateUrl;

    @Autowired
    private TenantUtils tenantUtils;

    @Autowired
    private CityService cityService;

    private static final Logger LOG = LoggerFactory.getLogger(ApplicationTenantResolverFilter.class);
    
    @Value("${is.environment.central.instance}")
    private boolean isEnvironmentCentralInstance;
    
    @Value("${state.tenantid.index.position}")
    private int stateTenantIndex;
    
    @Value("${is.subtenant.schema.based}")
    private boolean isSubTenantSchemaBased;
    
    @Value("${state.level.tenantid.length}")
    private int stateLevelTenantIdLength;
    
    private static final String EDCR_SERVICE_INTERNAL_URL = "egov-edcr.egov";
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        MultiReadRequestWrapper customRequest = new MultiReadRequestWrapper(req);
        HttpSession session = customRequest.getSession();
				
		String commonDomainName = environmentSettings.getProperty("common.domain.name");        
        StringBuilder url = new StringBuilder(customRequest.getRequestURL());
        if (WebUtils.getDomainName(url.toString()).contains(EDCR_SERVICE_INTERNAL_URL)) {
        	int startindex=url.indexOf(EDCR_SERVICE_INTERNAL_URL);
        	LOG.info("startIndex", startindex);
        	int endindex = startindex+EDCR_SERVICE_INTERNAL_URL.length();
        	url.replace(startindex,endindex , commonDomainName);
        	LOG.info("new URL ", url);
        	//commonDomainName="sdc-uat.lgpunjab.gov.in";
        }
				
        ThreadLocalLogger.logAllThreadLocalValues("Tenant filter --Before request processing");
        LOG.info("Request URL--> {}", customRequest.getRequestURL());
        LOG.info("Request URI--> {}", customRequest.getRequestURI());
        //String commonDomainName = environmentSettings.getProperty("common.domain.name");
        LOG.info("Central instance: {}, Common domain name: {}", isEnvironmentCentralInstance, commonDomainName);
        String domainURL = extractRequestDomainURL(customRequest, false, isEnvironmentCentralInstance, commonDomainName);
        LOG.info("Extracted domain URL: {}", domainURL);
        String domainName = extractRequestedDomainName(customRequest, isEnvironmentCentralInstance, commonDomainName);
        LOG.info("Setting tenant id to localThread from env : {} values from env {} " + domainName ,environmentSettings.schemaName(domainName) );
        ApplicationThreadLocals.setTenantID(environmentSettings.schemaName(domainName));
        ApplicationThreadLocals.setDomainName(domainName);
        ApplicationThreadLocals.setDomainURL(domainURL);
        prepareRestService(customRequest, session);
        LOG.info("***Tenant ID--> {}", ApplicationThreadLocals.getTenantID());
        LOG.info("***Filestore Tenant ID--> {}", ApplicationThreadLocals.getFilestoreTenantID());
        ThreadLocalLogger.logAllThreadLocalValues("Tenant filter --After request processing");
        chain.doFilter(customRequest, response);
    }

    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {
        // Nothing to be initialized
    }

    @Override
    public void destroy() {
        // Nothing to be cleaned up
    }

    private void prepareRestService(MultiReadRequestWrapper customRequest, HttpSession session) {
    	LOG.info("inside prepareRestService method");
        if (tenants == null || tenants.isEmpty()) {
            tenants = tenantUtils.tenantsMap();
        }

        // restricted only the state URL to access the rest API
        // LOG.info("***********Enter to set tenant id and custom header**************" + req.getRequestURL().toString());
        String requestURL = new StringBuilder().append(ApplicationThreadLocals.getDomainURL())
                .append(customRequest.getRequestURI()).toString();
        LOG.info("Request URL after append domainUrl and requestURI : " + requestURL);
        if (requestURL.contains(tenants.get("state"))
                && (requestURL.contains("/edcr/") && (requestURL.contains("/rest/")
                        || requestURL.contains("/oauth/")))) {
        	LOG.info("Request URL contains state, edcr and rest or oauth check passed");

        LOG.debug("Tenant map (from config): {}", tenants);
        LOG.info("State-level tenant domain URL: {}", tenants.get("state"));
            LOG.info("Inside method to set tenant id and custom header");
            String tenantFromBody = StringUtils.EMPTY;
            tenantFromBody = setCustomHeader(requestURL, tenantFromBody, customRequest);
        LOG.info("Tenant from request body: {}", tenantFromBody);
            String fullTenant = customRequest.getParameter("tenantId");
        LOG.info("Tenant from request param: {}", fullTenant);
            if (StringUtils.isBlank(fullTenant)) {
                fullTenant = tenantFromBody;
            }
	    if(ApplicationThreadLocals.getFilestoreTenantID() == null)
        	ApplicationThreadLocals.setFilestoreTenantID(fullTenant);
		if ((isEnvironmentCentralInstance || !isSubTenantSchemaBased) && WebUtils
				.getDomainName(customRequest.getRequestURL().toString()).contains(EDCR_SERVICE_INTERNAL_URL)) {
			String domainName = environmentSettings.getDomainNameFromSchema(getStateLevelTenant(fullTenant));
			ApplicationThreadLocals.setDomainName(domainName);
			String domainURL = extractRequestDomainURL(customRequest, false, isEnvironmentCentralInstance, domainName);
			ApplicationThreadLocals.setDomainURL(domainURL);
			requestURL = new StringBuilder().append(domainURL).append(customRequest.getRequestURI()).toString();
		}
    
        String[] tenantArr = fullTenant.split("\\.");
        String stateName;
        if(isEnvironmentCentralInstance || !isSubTenantSchemaBased) {
        	String stateTenantId = getStateLevelTenant(fullTenant);
        	ApplicationThreadLocals.setStateName(stateTenantId);
            stateName = stateTenantId;
        } else {
            stateName = "state";
        }
        LOG.info("Request URL for REST access check: {}", requestURL);
        LOG.info("Mapped tenant domain URL for stateName '{}': {}", stateName, tenants.get(stateName));
        ApplicationThreadLocals.setFullTenantID(fullTenant);
       // restricted only the state URL to access the rest API
        if (requestURL.contains(tenants.get(stateName))
                && (requestURL.contains("/edcr/") && (requestURL.contains("/rest/")
                        || requestURL.contains("/oauth/")))) {
            if (StringUtils.isBlank(fullTenant)) {
                throw new ApplicationRestException("incorrect_request", "RestUrl does not contain tenantId: " + fullTenant);
            }
            String tenant;
            if(isEnvironmentCentralInstance || !isSubTenantSchemaBased) {
            	LOG.info("Tenant array length: {}", tenantArr.length);
            	tenant = getStateLevelTenant(fullTenant);
            	LOG.info("Resolved state-level tenant: {}", tenant);
                if (tenantArr.length == 3) {
                    ApplicationThreadLocals.setStateName(stateName);
                    ApplicationThreadLocals.setCityName(tenantArr[2]);
                    ApplicationThreadLocals.setFilestoreTenantID(fullTenant);
                    /* To support backward compatibility of rule processing,
                     * some dummy value is setting for district name, citycode and ULB grade
                     */
                    ApplicationThreadLocals.setCityCode(tenantArr[2]);
                    ApplicationThreadLocals.setDistrictName(tenantArr[2]);
                    ApplicationThreadLocals.setGrade(tenantArr[2]);
                } else if (tenantArr.length == 2) {
                    ApplicationThreadLocals.setCityName(tenantArr[1]);
                    ApplicationThreadLocals.setCityCode(tenant);
                    ApplicationThreadLocals.setDistrictName(tenantArr[1]);
                    ApplicationThreadLocals.setGrade(tenantArr[1]);
                    ApplicationThreadLocals.setFilestoreTenantID(fullTenant);
                } else {
                    ApplicationThreadLocals.setFilestoreTenantID(fullTenant);
                }
            } else {
                if (tenantArr.length == 3) {
                    tenant = tenantArr[1];
                    ApplicationThreadLocals.setStateName(stateName);
                    ApplicationThreadLocals.setCityName(tenantArr[2]);
                    ApplicationThreadLocals.setFilestoreTenantID(fullTenant);
                    /* To support backward compatibility of rule processing,
                     * some dummy value is setting for district name, citycode and ULB grade
                     */
                    ApplicationThreadLocals.setCityCode(tenantArr[2]);
                    ApplicationThreadLocals.setDistrictName(tenantArr[2]);
                    ApplicationThreadLocals.setGrade(tenantArr[2]);
                } else if (tenantArr.length == 2) {
                    tenant = tenantArr[1];
                    ApplicationThreadLocals.setFilestoreTenantID(tenant);
                } else {
                    tenant = tenantArr[0];
                    ApplicationThreadLocals.setFilestoreTenantID(tenant);
                }
            }
            
            LOG.info("Final resolved tenant for REST request: {}", tenant);
            LOG.info("City code from session: {}", session.getAttribute(CITY_CODE_KEY));
            boolean found = false;
            City stateCity = cityService.fetchStateCityDetails();
            if (tenant.equalsIgnoreCase("generic") || tenant.equalsIgnoreCase("state")) {
                ApplicationThreadLocals.setTenantID(tenant);
                found = true;
            } else if (stateCity != null && tenant.equalsIgnoreCase(stateCity.getCode())) {
                ApplicationThreadLocals.setTenantID("state");
                found = true;
            } else {
                for (String city : tenants.keySet()) {
                	
                    LOG.info("Checking tenant: Key={}, Value={}, Request Tenant={}", city, tenants.get(city), tenant);

                    if (tenants.get(city).contains(tenant) || city.equals(tenant)) {
                        ApplicationThreadLocals.setTenantID(city);
                        found = true;
                        break;
                    } else {
                    	found = false;
                    }
                }
            }
            if (!found) {
                throw new ApplicationRestException("invalid_tenant", "Invalid Tenant Id: " + tenant);
            }
        }
      }
        
        
    }

    /*
     * public Map<String, String> tenantsMap() { URL url; LOG.info("cities" + applicationConfiguration.cities()); try { url = new
     * URL(ApplicationThreadLocals.getDomainURL()); // first get from override properties
     * environment.getPropertySources().iterator().forEachRemaining(propertySource -> { LOG.info( "Property Source" +
     * propertySource.getName() + " Class Name" + propertySource.getClass().getSimpleName()); if
     * (propertySource.getName().contains("egov-erp-override.properties") && propertySource instanceof MapPropertySource) {
     * ((MapPropertySource) propertySource).getSource().forEach((key, value) -> { if (key.startsWith(TENANT)) {
     * tenants.put(value.toString(), url.getProtocol() + "://" + key.replace(TENANT, "")); LOG.info("*****override tenants******"
     * + value.toString() + url.getProtocol() + "://" + key.replace(TENANT, "")); } }); } }); // second get from application
     * config only properties if it is not overriden environment.getPropertySources().iterator().forEachRemaining(propertySource
     * -> { LOG.info( "Property Source" + propertySource.getName() + " Class Name" + propertySource.getClass().getSimpleName());
     * if (propertySource.getName().contains("application-config.properties") && propertySource instanceof MapPropertySource) {
     * ((MapPropertySource) propertySource).getSource().forEach((key, value) -> { if (key.startsWith(TENANT) &&
     * !tenants.containsKey(value)) { tenants.put(value.toString(), url.getProtocol() + "://" + key.replace(TENANT, ""));
     * LOG.info( "*****application config tenants******" + value.toString() + url.getProtocol() + "://" + key.replace(TENANT,
     * "")); } }); } }); } catch (MalformedURLException e) { LOG.error("Error occurred, while forming URL", e); } return tenants;
     * }
     */

    private String setCustomHeader(String requestURL, String tenantAtBody,
            MultiReadRequestWrapper multiReadRequestWrapper) {

        if (requestURL.contains("/rest/")) {
            LOG.info("***********Inside method to fetch auth token and tenant from reqbody**************");
            try {
                StringWriter writer = new StringWriter();
                IOUtils.copy(multiReadRequestWrapper.getInputStream(), writer, StandardCharsets.UTF_8);
                String reqBody = String.valueOf(writer);
                if (StringUtils.isNoneBlank(reqBody)) {
                    Pattern p = Pattern.compile("\\{.*?\\}");
                    Matcher m = p.matcher(reqBody);
                    while (m.find()) {
                        CharSequence charSequence = m.group().subSequence(1, m.group().length() - 1);
                        String[] reqBodyParams = String.valueOf(charSequence).split(",");
                        if (LOG.isDebugEnabled())
                            LOG.debug("***********Request Body Params************** {}", String.valueOf(charSequence));
                        for (String param : reqBodyParams) {
                            if (LOG.isDebugEnabled())
                                LOG.debug("************************* {}", param);
                            if (param.contains("userInfo") && StringUtils.isNotBlank(tenantAtBody))
                                break;

                            if (param.contains("tenantId")) {
                                String[] tenant = param.split(":");
                                if (tenant[1].startsWith("\"") && tenant[1].endsWith("\""))
                                    tenantAtBody = tenant[1].substring(1, tenant[1].length() - 1);
                                else
                                    tenantAtBody = tenant[1];
                                if (LOG.isDebugEnabled())
                                    LOG.debug("############Tenant From Body###### {}", tenantAtBody);
                            } /*
                               * else if (param.contains("authToken")) { String[] authTokenVal = param.split(":"); // Next to
                               * 'bearer' word space is required to differentiate token type and access token String tokenType =
                               * "bearer "; if (authTokenVal[1].startsWith("\"") && authTokenVal[1].endsWith("\"")) { String
                               * authToken = authTokenVal[1].substring(1, authTokenVal[1].length() - 1);
                               * LOG.info("############Auth Token######" + tokenType + authToken);
                               * multiReadRequestWrapper.putHeader("Authorization", tokenType + authToken); } else {
                               * multiReadRequestWrapper.putHeader("Authorization", tokenType + authTokenVal[1]); } }
                               */
                        }
                    }
                }

            } catch (IOException e) {
                LOG.error("Error occurred, while parsing request body into json", e);
            }

        }
        return tenantAtBody;
    }
    
    private String getStateLevelTenant(String tenantId) {

		String[] tenantArray = tenantId.split("\\.");
		String stateTenant = tenantArray[0];
		
		if (stateLevelTenantIdLength < tenantArray.length) {
			for (int i = 1; i < stateLevelTenantIdLength; i++)
				stateTenant = stateTenant.concat(".").concat(tenantArray[i]);
		} else {
			stateTenant = tenantId;
		}
	
		return stateTenant;
	}

}
