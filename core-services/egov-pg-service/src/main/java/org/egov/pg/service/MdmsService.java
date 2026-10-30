package org.egov.pg.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.*;
import org.egov.pg.config.AppProperties;
import org.egov.pg.repository.ServiceCallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MdmsService {

	private ServiceCallRepository serviceCallRepository;
	
	private AppProperties appProperties;
	
	@Autowired
	public MdmsService(ServiceCallRepository serviceCallRepository, AppProperties appProperties) {
		this.serviceCallRepository = serviceCallRepository;
		this.appProperties = appProperties;
	}
	
	public Object getMdmsdata(RequestInfo requestInfo, String tenantId) {
		MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo, tenantId);
		return serviceCallRepository.fetchResult(getMdmsSearchUrl().toString(), mdmsCriteriaReq).get();
	}
	
	/**
	 * Returns the URL for MDMS search end point
	 *
	 * @return URL for MDMS search end point
	 */
	private StringBuilder getMdmsSearchUrl() {
		return new StringBuilder().append(appProperties.getMdmsHost()).append(appProperties.getMdmsSearchEndpoint());
	}
	
	/**
	 * Builds MdmsCriteriaReq
	 */
	private MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId) {

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.addAll(getModuleDetails(tenantId));

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
				.moduleDetails(moduleDetails)
				.tenantId(appProperties.getStateLevelTenantId())
				.build();

		return MdmsCriteriaReq.builder()
				.mdmsCriteria(mdmsCriteria)
				.requestInfo(requestInfo)
				.build();
	}
	
	/**
	 * Get MDMS Module Details
	 */
	private List<ModuleDetail> getModuleDetails(String tenantId) {
		String filter = "$.[?(@.code == '" + tenantId + "')]";

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.add(ModuleDetail.builder()
				.moduleName("tenant")
				.masterDetails(Collections.singletonList(MasterDetail.builder()
						.name("tenants")
						.filter(filter)
						.build()))
				.build());
		
		moduleDetails.add(ModuleDetail.builder()
				.moduleName("PAYMENT")
				.masterDetails(Collections.singletonList(MasterDetail.builder()
						.name("ServiceCodeMapping")
						.build()))
				.build());

		return moduleDetails;
	}
}
