package org.egov.layout.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.repository.ServiceRequestRepository;
import org.egov.layout.web.model.AuditDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LAYOUTUtil {

	private LAYOUTConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	public LAYOUTUtil(LAYOUTConfiguration config, ServiceRequestRepository serviceRequestRepository) {
		this.config = config;
		this.serviceRequestRepository = serviceRequestRepository;
	}

	/**
	 * Method to return auditDetails for create/update flows
	 *
	 * @param by
	 * @param isCreate
	 * @return AuditDetails
	 */
	public AuditDetails getAuditDetails(String by, Boolean isCreate) {
		Long time = System.currentTimeMillis();
		if (isCreate)
			return AuditDetails.builder().createdBy(by).lastModifiedBy(by).createdTime(time).lastModifiedTime(time)
					.build();
		else
			return AuditDetails.builder().lastModifiedBy(by).lastModifiedTime(time).build();
	}

	/**
	 * Returns the URL for MDMS search end point
	 *
	 * @return URL for MDMS search end point
	 */
	public StringBuilder getMdmsSearchUrl() {
		return new StringBuilder().append(config.getMdmsHost()).append(config.getMdmsEndPoint());
	}

	/**
	 * prepares the MDMSCriteria to make MDMS Request
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId) {
		List<ModuleDetail> moduleRequest = getNOCModuleRequest();

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.addAll(moduleRequest);

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId).build();

		MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria).requestInfo(requestInfo)
				.build();
		return mdmsCriteriaReq;
	}
	/**
	 * fetches the layout documentTypes and nocTypes mdms data
	 * @return
	 */
	public List<ModuleDetail> getNOCModuleRequest() {
		List<MasterDetail> nocMasterDtls = new ArrayList<>();

		final String nocFilterCode = "$.[?(@.isActive==true)]";

		nocMasterDtls.add(MasterDetail.builder().name(LAYOUTConstants.LAYOUT_TYPE).filter(nocFilterCode).build());
		nocMasterDtls.add(MasterDetail.builder().name(LAYOUTConstants.NOC_DOC_TYPE_MAPPING).build());
		ModuleDetail nocModuleDtls = ModuleDetail.builder().masterDetails(nocMasterDtls)
				.moduleName(LAYOUTConstants.LAYOUT_MODULE).build();
		
		final String filterCode = "$.[?(@.active==true)]";

		List<MasterDetail> commonMasterDetails = new ArrayList<>();
			commonMasterDetails.add(MasterDetail.builder().name(LAYOUTConstants.DOCUMENT_TYPE).filter(filterCode).build());
		ModuleDetail commonMasterMDtl = ModuleDetail.builder().masterDetails(commonMasterDetails)
				.moduleName(LAYOUTConstants.COMMON_MASTERS_MODULE).build();

		return Arrays.asList(nocModuleDtls, commonMasterMDtl);
	}	

	/**
	 * prepares MDMS call 
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public Object mDMSCall(RequestInfo requestInfo, String tenantId) {
		MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo, tenantId);
		Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
		return result;
	}



	public Object mDMSLayoutCall(RequestInfo requestInfo, String tenantId, String ulbType,String buildingCategory,String area) {
		MdmsCriteriaReq mdmsCriteriaReq = getLayoutMDMSRequest(requestInfo, tenantId,ulbType,buildingCategory,area);
		Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
		return result;
	}

	private String buildLayoutWorkflowFilter(String ulbType, String buildingCategory, String area) {
		String safeUlbType = escapeForJsonPathLiteral(ulbType);
		String safeBuildingCategory = escapeForJsonPathLiteral(buildingCategory);

		// Most MDMS configs keep minArea/maxArea as integers. We floor the value to be safe.


		return String.format(
				"$[?(@.ulbType=='%s' && @.buildingCategory=='%s' && @.minArea<=%s && @.maxArea>=%s)]",
				safeUlbType, safeBuildingCategory, area, area
		);
	}

	/**
	 * Escapes a single-quoted JSONPath literal for safety.
	 */
	private String escapeForJsonPathLiteral(String input) {
		if (input == null) return "";
		// Escape single quotes by backslash for the JSONPath literal
		return input.replace("'", "\\'");
	}

	/**
	 * Normalizes area to integer String (floors decimals).
	 */


	/**
	 * Prepare only the LAYOUT module request with WorkflowConfig + filter.
	 */
	public List<ModuleDetail> getLayoutModuleRequest(String ulbType, String buildingCategory, String area) {
		String filter = buildLayoutWorkflowFilter(ulbType, buildingCategory, area);

		List<MasterDetail> layoutMasterDetails = new ArrayList<>();
		layoutMasterDetails.add(MasterDetail.builder()
				.name(LAYOUTConstants.WORKFLOW_CONFIG)
				.filter(filter)
				.build());

		List<ModuleDetail> result = new LinkedList<>();
		result.add(ModuleDetail.builder()
				.moduleName(LAYOUTConstants.LAYOUT_MODULE)
				.masterDetails(layoutMasterDetails)
				.build());

		return result;
	}

	/**
	 * Builds MdmsCriteriaReq for LAYOUT → WorkflowConfig with JSONPath filter.
	 */
	public MdmsCriteriaReq getLayoutMDMSRequest(RequestInfo requestInfo, String tenantId,
												String ulbType, String buildingCategory, String area) {

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.addAll(getLayoutModuleRequest(ulbType, buildingCategory, area));

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
				.moduleDetails(moduleDetails)
				.tenantId(tenantId)
				.build();

		return MdmsCriteriaReq.builder()
				.mdmsCriteria(mdmsCriteria)
				.requestInfo(requestInfo)
				.build();
	}


}