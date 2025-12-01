package org.egov.rl.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.AuditDetails;
import org.egov.rl.models.ClsureCriteria;
import org.egov.rl.models.ClsureRequest;
import org.egov.rl.models.Document;
import org.egov.rl.models.OwnerInfo;
import org.egov.common.contract.request.Role;
import org.egov.rl.models.enums.ApplicationType;
import org.egov.rl.models.enums.Channel;
import org.egov.rl.models.enums.Status;
import org.egov.rl.models.user.User;
import org.egov.rl.util.RLConstants;
import org.egov.rl.util.PropertyUtil;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.repository.ClsureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.databind.JsonNode;

@Service
public class ClsureEnrichmentService {


    @Autowired
    private PropertyUtil propertyutil;

    @Autowired
    private BoundaryService boundaryService;

    @Autowired
    private RentLeaseConfiguration config;

	
	@Autowired
	private ClsureRepository clsureRepository;

    /**
     * Assigns UUIDs to all id fields and also assigns acknowledgement-number and assessment-number generated from id-gen
     * @param request  PropertyRequest received for property creation
     */
	
	public void enrichCreateRequest(ClsureRequest clsureRequest) {
		RequestInfo requestInfo = clsureRequest.getRequestInfo();
		AllotmentClsure	clusure=clsureRequest.getAllotmentClsure();
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), true);
		clusure.setAuditDetails(auditDetails);
		setIdgenIds(clsureRequest);
	}

    /**
     * Assigns UUID for new fields that are added and sets propertyDetail and address id from propertyId
     * 
     * @param request  PropertyRequest received for property update
     * @param propertyFromDb Properties returned from DB
     */
    public void enrichUpdateRequest(ClsureRequest clsureRequest) {
    	AllotmentClsure allotmentClsure = clsureRequest.getAllotmentClsure();
        RequestInfo requestInfo = clsureRequest.getRequestInfo();
		
    	ClsureCriteria clsureCriteria=new ClsureCriteria();
		Set<String> id=new HashSet<>();
		id.add(allotmentClsure.getId());
		clsureCriteria.setIds(id);
		
//		Set<String> allotmentId=new HashSet<>();
//		allotmentId.add(allotmentClsure.getAllotmentId());
//		clsureCriteria.setIds(allotmentId);
		
		clsureCriteria.setTenantId(allotmentClsure.getTenantId());
		AllotmentClsure allotmentDbClsure= searchClsure(clsureRequest.getRequestInfo(), clsureCriteria).get(0);
		
		AuditDetails auditDetails = propertyutil.getAuditDetails(requestInfo.getUserInfo().getUuid().toString(), false);
		auditDetails.setCreatedBy(allotmentDbClsure.getAuditDetails().getCreatedBy());
		auditDetails.setCreatedTime(allotmentDbClsure.getAuditDetails().getCreatedTime());
		
		allotmentDbClsure.setAuditDetails(auditDetails);
		allotmentDbClsure.setAmountToBeDeducted(allotmentClsure.getAmountToBeDeducted());
		allotmentDbClsure.setAmountToBeRefund(allotmentClsure.getAmountToBeRefund());
		allotmentDbClsure.setReasonForClosure(allotmentClsure.getReasonForClosure());
		allotmentDbClsure.setRefundAmount(allotmentClsure.getRefundAmount());
		allotmentDbClsure.setUploadProof(allotmentClsure.getUploadProof());
		allotmentDbClsure.setStatus(allotmentClsure.getWorkflow().getStatus());
		allotmentDbClsure.setNotesComments(allotmentClsure.getNotesComments());
		allotmentDbClsure.setWorkflow(allotmentClsure.getWorkflow());
		clsureRequest.setAllotmentClsure(allotmentDbClsure);
		System.out.println("---------allotmentDbClsure--------"+allotmentDbClsure.getAmountToBeDeducted());
		
    }
    public List<AllotmentClsure> searchClsure(RequestInfo requestInfo,
		    ClsureCriteria clsureCriteria) {
			return clsureRepository.getClsureByIds(clsureCriteria);
		}

    /**
	 * Sets the acknowledgement and assessment Numbers for given PropertyRequest
	 * 
	 * @param request PropertyRequest which is to be created
	 */
	private void setIdgenIds(ClsureRequest clsureRequest) {

		AllotmentClsure allotmentClsure=clsureRequest.getAllotmentClsure();
		allotmentClsure.setId(UUID.randomUUID().toString());
		String tenantId = clsureRequest.getAllotmentClsure().getTenantId();
		RequestInfo requestInfo = clsureRequest.getRequestInfo();
		if (config.getIsWorkflowEnabled()) {
			allotmentClsure.setStatus(allotmentClsure.getWorkflow().getStatus());
		}
		clsureRequest.setAllotmentClsure(allotmentClsure);
		
		String applicationNumber = propertyutil.getIdList(requestInfo, tenantId, config.getAllotmentApplicationNummberGenName(), config.getAllotmentApplicationNummberGenNameFormat(), 1).get(0);
		allotmentClsure.setClosedApplicationNumber(applicationNumber);
		clsureRequest.setAllotmentClsure(allotmentClsure);
	}

}
