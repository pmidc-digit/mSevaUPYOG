package org.egov.ndc.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.web.model.AuditDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NDCUtil {

	private NDCConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	public NDCUtil(NDCConfiguration config, ServiceRequestRepository serviceRequestRepository) {
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
		List<ModuleDetail> moduleRequest = getNDCModuleRequest();

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.addAll(moduleRequest);

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId).build();

		MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria).requestInfo(requestInfo)
				.build();
		return mdmsCriteriaReq;
	}
	/**
	 * fetches the ndc documentTypes and ndcTypes mdms data
	 * @return
	 */
	public List<ModuleDetail> getNDCModuleRequest() {
		List<MasterDetail> ndcMasterDtls = new ArrayList<>();

		final String ndcFilterCode = "$.[?(@.isActive==true)]";

		ndcMasterDtls.add(MasterDetail.builder().name(NDCConstants.NDC_TYPE).filter(ndcFilterCode).build());
		ndcMasterDtls.add(MasterDetail.builder().name(NDCConstants.NDC_DOC_TYPE_MAPPING).build());
		ModuleDetail ndcModuleDtls = ModuleDetail.builder().masterDetails(ndcMasterDtls)
				.moduleName(NDCConstants.NDC_MODULE).build();
		
		final String filterCode = "$.[?(@.active==true)]";

		List<MasterDetail> commonMasterDetails = new ArrayList<>();
			commonMasterDetails.add(MasterDetail.builder().name(NDCConstants.DOCUMENT_TYPE).filter(filterCode).build());
		ModuleDetail commonMasterMDtl = ModuleDetail.builder().masterDetails(commonMasterDetails)
				.moduleName(NDCConstants.COMMON_MASTERS_MODULE).build();

		return Arrays.asList(ndcModuleDtls, commonMasterMDtl);
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
	
}