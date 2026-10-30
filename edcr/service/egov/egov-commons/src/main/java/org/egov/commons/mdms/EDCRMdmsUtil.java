
package org.egov.commons.mdms;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import org.egov.commons.mdms.config.MdmsConfiguration;
import org.egov.commons.mdms.model.MasterDetail;
import org.egov.commons.mdms.model.MdmsCriteria;
import org.egov.commons.mdms.model.MdmsCriteriaReq;
import org.egov.commons.mdms.model.ModuleDetail;
import org.egov.commons.service.RestCallService;
import org.egov.infra.microservice.models.RequestInfo;
import org.springframework.stereotype.Service;

/**
 * @author vinoth
 *
 */
@Service
public class EDCRMdmsUtil {
    private RestCallService serviceRequestRepository;
    private MdmsConfiguration mdmsConfiguration;

    public EDCRMdmsUtil(RestCallService serviceRequestRepository, MdmsConfiguration mdmsConfiguration) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.mdmsConfiguration = mdmsConfiguration;
    }

    public List<ModuleDetail> getEDCRModuleRequest() {
        List<MasterDetail> edcrMasterDtls = new ArrayList<>();

        MasterDetail masterDetailDimensionConfig = new MasterDetail();
        masterDetailDimensionConfig.setName("DimensionConfig");
        masterDetailDimensionConfig.setFilter("$.*");
        edcrMasterDtls.add(masterDetailDimensionConfig);
        
        MasterDetail masterDetailDxfToPdfConfig = new MasterDetail();
        masterDetailDxfToPdfConfig.setName("DxfToPdfConfig");
        masterDetailDxfToPdfConfig.setFilter("$.*");
        edcrMasterDtls.add(masterDetailDxfToPdfConfig);
        
        MasterDetail masterDetailDxfToPdfLayerConfig = new MasterDetail();
        masterDetailDxfToPdfLayerConfig.setName("DxfToPdfLayerConfig");
        masterDetailDxfToPdfLayerConfig.setFilter("$.*");
        edcrMasterDtls.add(masterDetailDxfToPdfLayerConfig);

        ModuleDetail edcrModuleDtls = new ModuleDetail();
        edcrModuleDtls.setMasterDetails(edcrMasterDtls);
        edcrModuleDtls.setModuleName("EDCR");
        return Arrays.asList(edcrModuleDtls);
    }
    
    public List<ModuleDetail> getMDMSRolesRequest(String roleCode) {
        // Create a list of MasterDetail objects
        List<MasterDetail> masterDetails = new ArrayList<>();

        // Build JSONPath filter dynamically based on roleCode
        String filter = "$.[?(@.code=='" + roleCode + "')]";

        // Create MasterDetail for "roles"
        MasterDetail masterDetailRoles = new MasterDetail();
        masterDetailRoles.setName("roles");
        masterDetailRoles.setFilter(filter);
        masterDetails.add(masterDetailRoles);

        // Create ModuleDetail for "EDCR-ROLES"
        ModuleDetail moduleDetail = new ModuleDetail();
        moduleDetail.setModuleName("EDCR-ROLES");
        moduleDetail.setMasterDetails(masterDetails);

        // Return the module details list
        return Arrays.asList(moduleDetail);
    }


    /**
     * @param requestInfo
     * @param tenantId
     * @return mdmsSearchCriteria
     */
    private MdmsCriteriaReq getEDCRMDMSRequest(RequestInfo requestInfo, String tenantId) {
        List<ModuleDetail> moduleRequest = getEDCRModuleRequest();
        List<ModuleDetail> moduleDetails = new LinkedList<>();
        moduleDetails.addAll(moduleRequest);
        MdmsCriteria mdmsCriteria = new MdmsCriteria();
        mdmsCriteria.setModuleDetails(moduleDetails);
        mdmsCriteria.setTenantId(tenantId);
        MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
        mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);
        mdmsCriteriaReq.setRequestInfo(requestInfo);
        return mdmsCriteriaReq;
    }
    
    private MdmsCriteriaReq getEDCRMDMSRoleRequest(RequestInfo requestInfo, String tenantId, String roleCode) {
        List<ModuleDetail> moduleRequest = getMDMSRolesRequest(roleCode);
        List<ModuleDetail> moduleDetails = new LinkedList<>();
        moduleDetails.addAll(moduleRequest);
        MdmsCriteria mdmsCriteria = new MdmsCriteria();
        mdmsCriteria.setModuleDetails(moduleDetails);
        mdmsCriteria.setTenantId(tenantId);
        MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
        mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);
        mdmsCriteriaReq.setRequestInfo(requestInfo);
        return mdmsCriteriaReq;
    }

    /**
     * @param requestInfo
     * @param tenantId
     * @return mdmsData
     */
    public Object mDMSCall(RequestInfo requestInfo, String tenantId) {
        MdmsCriteriaReq mdmsCriteriaReq = getEDCRMDMSRequest(requestInfo,
                tenantId);
        Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        return result;
    }

    public Object mdmsRolesCall(RequestInfo requestInfo, String tenantId, String roleCode) {
        MdmsCriteriaReq mdmsCriteriaReq = getEDCRMDMSRoleRequest(requestInfo,
                tenantId, roleCode);
        Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
        return result;
    }
    
    public StringBuilder getMdmsSearchUrl() {
        return new StringBuilder().append(mdmsConfiguration.getMdmsHost()).append(mdmsConfiguration.getMdmsSearchUrl());
    }
}
