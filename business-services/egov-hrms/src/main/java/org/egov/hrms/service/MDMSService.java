package org.egov.hrms.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.egov.hrms.utils.HRMSConstants;
import org.egov.hrms.utils.MsevaSsoConstants;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.MdmsResponse;
import org.egov.mdms.model.ModuleDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MDMSService {

	@Autowired
	private RestTemplate restTemplate;
	
	@Autowired
	private MsevaSsoConstants msevaSsoConstants;
	
	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsEndpoint;
	
	
	/**
	 * Builds cache for MDMS data, this gets refreshed for every call.
	 * 
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public Map<String, List<String>> getMDMSData(RequestInfo requestInfo, String tenantId){
		MdmsResponse response = fetchMDMSData(requestInfo, tenantId);
		Map<String, List<String>> masterData = new HashMap<>();
		Map<String, List<String>> eachMasterMap = new HashMap<>();
		if(null != response) {
			if(!CollectionUtils.isEmpty(response.getMdmsRes().keySet())) {
				if(null != response.getMdmsRes().get(HRMSConstants.HRMS_MDMS_COMMON_MASTERS_CODE)){
					eachMasterMap = (Map) response.getMdmsRes().get(HRMSConstants.HRMS_MDMS_COMMON_MASTERS_CODE);
					masterData.put(HRMSConstants.HRMS_MDMS_DEPT_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_DEPT_CODE));
					masterData.put(HRMSConstants.HRMS_MDMS_DESG_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_DESG_CODE));
				}
				if(null != response.getMdmsRes().get(HRMSConstants.HRMS_MDMS_HR_MASTERS_CODE)) {
					eachMasterMap = (Map) response.getMdmsRes().get(HRMSConstants.HRMS_MDMS_HR_MASTERS_CODE);
					masterData.put(HRMSConstants.HRMS_MDMS_EMP_STATUS_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_EMP_STATUS_CODE));
					masterData.put(HRMSConstants.HRMS_MDMS_EMP_TYPE_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_EMP_TYPE_CODE));
					masterData.put(HRMSConstants.HRMS_MDMS_QUALIFICATION_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_QUALIFICATION_CODE));
					masterData.put(HRMSConstants.HRMS_MDMS_STREAMS_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_STREAMS_CODE));
					masterData.put(HRMSConstants.HRMS_MDMS_DEPT_TEST_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_DEPT_TEST_CODE));
					masterData.put(HRMSConstants.HRMS_MDMS_DEACT_REASON_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_DEACT_REASON_CODE));
				}
				if(null != response.getMdmsRes().get(HRMSConstants.HRMS_AC_ROLES_MASTERS_CODE)) {
					eachMasterMap = (Map) response.getMdmsRes().get(HRMSConstants.HRMS_AC_ROLES_MASTERS_CODE);
					masterData.put(HRMSConstants.HRMS_MDMS_ROLES_CODE, eachMasterMap.get(HRMSConstants.HRMS_MDMS_ROLES_CODE));
				}
			}
		}

		return masterData;
		
	}



	/**
	 * Makes call to the MDMS service to fetch the MDMS data.
	 *
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsResponse fetchMDMSData(RequestInfo requestInfo, String tenantId) {
		StringBuilder uri = new StringBuilder();
		MdmsCriteriaReq request = prepareMDMSRequest(uri, requestInfo, tenantId);
		MdmsResponse response = null;
		try {
			response = restTemplate.postForObject(uri.toString(), request, MdmsResponse.class);
		}catch(Exception e) {
			log.info("Exception while fetching from MDMS: ",e);
			log.info("Request: "+ request);
		}
		return response;
	}
	
	public MdmsResponse fetchMDMSDataTenant(RequestInfo requestInfo, String tenantId) {
		StringBuilder uri = new StringBuilder();
		MdmsCriteriaReq request = prepareMDMSRequestTenant(uri, requestInfo, tenantId);
		MdmsResponse response = null;
		try {
			response = restTemplate.postForObject(uri.toString(), request, MdmsResponse.class);
		}catch(Exception e) {
			log.info("Exception while fetching from MDMS: ",e);
			log.info("Request: "+ request);
		}
		return response;
	}

	
	public MdmsResponse fetchMDMSDistrictData(RequestInfo requestInfo, String tenantId, String districtName) {
		StringBuilder uri = new StringBuilder();
		MdmsCriteriaReq request = prepareMDMSRequestDistrict(uri, requestInfo, tenantId, districtName);
		MdmsResponse response = null;
		try {
			response = restTemplate.postForObject(uri.toString(), request, MdmsResponse.class);
		}catch(Exception e) {
			log.info("Exception while fetching from MDMS: ",e);
			log.info("Request: "+ request);
		}
		return response;
	}

	/**
	 * Makes call to the MDMS service to fetch the MDMS Boundary data.
	 *
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsResponse fetchMDMSDataLoc(RequestInfo requestInfo, String tenantId) {
		StringBuilder uri = new StringBuilder();
		MdmsCriteriaReq request = prepareMDMSRequestLoc(uri, requestInfo, tenantId);
		MdmsResponse response = null;
		try {
			response = restTemplate.postForObject(uri.toString(), request, MdmsResponse.class);
		}catch(Exception e) {
			log.info("Exception while fetching from MDMS: ",e);
			log.info("Request: "+ request);
		}
		return response;
	}

	/**
	 * Prepares request for MDMS in order to fetch all the required masters for HRMS.
	 * 
	 * @param uri
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsCriteriaReq prepareMDMSRequest(StringBuilder uri, RequestInfo requestInfo, String tenantId) {
		Map<String, List<String>> mapOfModulesAndMasters = new HashMap<>();
		String[] hrMasters = {HRMSConstants.HRMS_MDMS_EMP_STATUS_CODE, HRMSConstants.HRMS_MDMS_EMP_TYPE_CODE, HRMSConstants.HRMS_MDMS_QUALIFICATION_CODE,
				HRMSConstants.HRMS_MDMS_SERVICE_STATUS_CODE, HRMSConstants.HRMS_MDMS_STREAMS_CODE, HRMSConstants.HRMS_MDMS_DEACT_REASON_CODE, HRMSConstants.HRMS_MDMS_DEPT_TEST_CODE};
		String[] commonMasters = {HRMSConstants.HRMS_MDMS_DEPT_CODE, HRMSConstants.HRMS_MDMS_DESG_CODE, HRMSConstants.HRMS_MDMS_YEAR_CODE};
		String[] accessControlRoles = {HRMSConstants.HRMS_MDMS_ROLES_CODE};
		mapOfModulesAndMasters.put(HRMSConstants.HRMS_MDMS_COMMON_MASTERS_CODE, Arrays.asList(commonMasters));
		mapOfModulesAndMasters.put(HRMSConstants.HRMS_MDMS_HR_MASTERS_CODE, Arrays.asList(hrMasters));
		mapOfModulesAndMasters.put(HRMSConstants.HRMS_AC_ROLES_MASTERS_CODE, Arrays.asList(accessControlRoles));
		List<ModuleDetail> moduleDetails = new ArrayList<>();
		for(String module: mapOfModulesAndMasters.keySet()) {
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName(module);
			List<MasterDetail> masterDetails = new ArrayList<>();
			for(String master: mapOfModulesAndMasters.get(module)) {
				MasterDetail masterDetail=null;
				if(module.equals(HRMSConstants.HRMS_AC_ROLES_MASTERS_CODE))
					masterDetail = MasterDetail.builder().name(master).filter(HRMSConstants.HRMS_MDMS_AC_ROLES_FILTER).build();
				else
					masterDetail = MasterDetail.builder().name(master).filter("[?(@.active == true)].code").build();
				masterDetails.add(masterDetail);
			}
			moduleDetail.setMasterDetails(masterDetails);
			moduleDetails.add(moduleDetail);
		}
		uri.append(mdmsHost).append(mdmsEndpoint);
		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().tenantId(tenantId).moduleDetails(moduleDetails).build();
		return MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();
	
	}
	
	public MdmsCriteriaReq prepareMDMSRequestTenant(StringBuilder uri, RequestInfo requestInfo, String tenantId) {
		
		List<ModuleDetail> moduleDetails = new ArrayList<>();
		
			ModuleDetail moduleDetail = new ModuleDetail();
			
			List<MasterDetail> masterDetails = new ArrayList<>();
			
				MasterDetail masterDetail=null;
				
					String master;
					master = msevaSsoConstants.MDMS_FETCH_TENANTS_REQBODY;
					masterDetail = MasterDetail.builder().name(master).build();
						masterDetails.add(masterDetail);
			
			moduleDetail.setMasterDetails(masterDetails);
			moduleDetails.add(moduleDetail);
			moduleDetail.setModuleName(msevaSsoConstants.MDMS_FETCH_TENANT_REQUESTBODY);
		uri.append(mdmsHost).append(mdmsEndpoint);
		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().tenantId(tenantId).moduleDetails(moduleDetails).build();
		return MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();	
	}

	
	public MdmsCriteriaReq prepareMDMSRequestDistrict(StringBuilder uri, RequestInfo requestInfo, String tenantId, String districtName) {

	    List<ModuleDetail> moduleDetails = new ArrayList<>();

	    ModuleDetail moduleDetail = new ModuleDetail();

	    List<MasterDetail> masterDetails = new ArrayList<>();

	    // Master name (TENANTS table / MDMS module)
	    String master = msevaSsoConstants.MDMS_FETCH_DISTRICT_REQUESTBODY;

	    // Add filter to match the district by thirdpartyname
	    MasterDetail masterDetail = MasterDetail.builder()
	            .name(master)
	            .build();

	    masterDetails.add(masterDetail);

	    moduleDetail.setMasterDetails(masterDetails);
	    moduleDetail.setModuleName(msevaSsoConstants.MDMS_FETCH_TENANT_REQUESTBODY);

	    moduleDetails.add(moduleDetail);

	    // Append MDMS endpoint
	    uri.append(mdmsHost).append(mdmsEndpoint);

	    MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
	            .tenantId(tenantId)
	            .moduleDetails(moduleDetails)
	            .build();

	    return MdmsCriteriaReq.builder()
	            .requestInfo(requestInfo)
	            .mdmsCriteria(mdmsCriteria)
	            .build();
	}




	/**
	 * Prepares request for MDMS in order to fetch all the required masters for Boundary Data.
	 *
	 * @param uri
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsCriteriaReq prepareMDMSRequestLoc(StringBuilder uri, RequestInfo requestInfo, String tenantId) {
		Map<String, List<String>> mapOfModulesAndMasters = new HashMap<>();
		String[] egovLoccation = {HRMSConstants.HRMS_MDMS_TENANT_BOUNDARY_CODE};
		mapOfModulesAndMasters.put(HRMSConstants.HRMS_MDMS_EGOV_LOCATION_MASTERS_CODE, Arrays.asList(egovLoccation));
		List<ModuleDetail> moduleDetails = new ArrayList<>();
		for(String module: mapOfModulesAndMasters.keySet()) {
			ModuleDetail moduleDetail = new ModuleDetail();
			moduleDetail.setModuleName(module);
			List<MasterDetail> masterDetails = new ArrayList<>();
			for(String master: mapOfModulesAndMasters.get(module)) {
				MasterDetail masterDetail=null;
				masterDetail = MasterDetail.builder().name(master).build();
				masterDetails.add(masterDetail);
			}
			moduleDetail.setMasterDetails(masterDetails);
			moduleDetails.add(moduleDetail);
		}
		uri.append(mdmsHost).append(mdmsEndpoint);
		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().tenantId(tenantId).moduleDetails(moduleDetails).build();
		return MdmsCriteriaReq.builder().requestInfo(requestInfo).mdmsCriteria(mdmsCriteria).build();

	}

	/**
	 * Fetches BuildingCategory master data under module NOC from MDMS.
	 *
	 * @param requestInfo
	 * @param tenantId
	 * @return List of BuildingCategory master records
	 */
	public List<Map<String, Object>> fetchNocBuildingCategories(RequestInfo requestInfo, String tenantId) {
		StringBuilder uri = new StringBuilder();
		String stateTenantId = tenantId != null ? tenantId.split("\\.")[0] : "pb";

		MasterDetail masterDetail = MasterDetail.builder()
				.name("BuildingCategory")
				.filter("[?(@.active == true)]")
				.build();

		ModuleDetail moduleDetail = ModuleDetail.builder()
				.moduleName("NOC")
				.masterDetails(Collections.singletonList(masterDetail))
				.build();

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
				.tenantId(stateTenantId)
				.moduleDetails(Collections.singletonList(moduleDetail))
				.build();

		MdmsCriteriaReq request = MdmsCriteriaReq.builder()
				.requestInfo(requestInfo)
				.mdmsCriteria(mdmsCriteria)
				.build();

		uri.append(mdmsHost).append(mdmsEndpoint);
		try {
			MdmsResponse response = restTemplate.postForObject(uri.toString(), request, MdmsResponse.class);
			if (response != null && response.getMdmsRes() != null) {
				Map mdmsRes = response.getMdmsRes();
				if (mdmsRes.containsKey("NOC")) {
					Map nocMasters = (Map) mdmsRes.get("NOC");
					if (nocMasters != null && nocMasters.containsKey("BuildingCategory")) {
						Object buildingCatObj = nocMasters.get("BuildingCategory");
						if (buildingCatObj instanceof List) {
							return (List<Map<String, Object>>) buildingCatObj;
						}
					}
				}
			}
		} catch (Exception e) {
			log.error("Exception while fetching NOC BuildingCategory from MDMS: ", e);
		}
		return Collections.emptyList();
	}

}
