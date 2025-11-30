package org.egov.rl.service;

import java.util.HashSet;
import java.util.Set;

import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.ClsureCriteria;
import org.egov.rl.models.ClsureRequest;
import org.egov.rl.producer.PropertyProducer;
import org.egov.rl.repository.ClsureRepository;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.validator.AllotmentValidator;
import org.egov.rl.validator.ClsureValidator;
import org.egov.rl.workflow.AllotmentWorkflowService;
import org.egov.rl.workflow.ClosureWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

@Service
public class ClsureService {
	
	@Autowired
	private PropertyProducer producer;

	@Autowired
	private RentLeaseConfiguration config;
	
	@Autowired
	private ClsureEnrichmentService enrichmentService;
	
	@Autowired
	private ClsureValidator validator;

	@Autowired
	private ClosureWorkflowService wfService;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;
	
	@Autowired
	BoundaryService boundaryService;
	
	@Autowired
	ClsureRepository clsureRepository;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 * @param request PropertyRequest containing list of properties to be created
	 * @return List of properties successfully created
	 */

	public AllotmentClsure clsureCreate(ClsureRequest clsureRequest){

		validator.validateCreateClsureRequest(clsureRequest);
		enrichmentService.enrichCreateRequest(clsureRequest);
		
		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(clsureRequest);
		} else {
			clsureRequest.getAllotmentClsure().setStatus("ACTIVE");
		}

		producer.push(config.getSaveRLClsureTopic(), clsureRequest);
		return clsureRequest.getAllotmentClsure();
	}
	
	public AllotmentClsure clsureUpdate(ClsureRequest clsureRequest){
	    
		validator.validateUpdateClsureRequest(clsureRequest);
     	enrichmentService.enrichUpdateRequest(clsureRequest);
     	if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(clsureRequest);
		} else {
			clsureRequest.getAllotmentClsure().setStatus("ACTIVE");
		}
		
		producer.push(config.getUpdateRLClsureTopic(), clsureRequest);
		return clsureRequest.getAllotmentClsure();
	}
	
	public ClsureRequest clsureSearch(ClsureRequest clsureRequest){
		ClsureCriteria clsureCriteria=new ClsureCriteria();
		Set<String> id=new HashSet<>();
		id.add(clsureRequest.getAllotmentClsure().getId());
		clsureCriteria.setIds(id);
//		clsureCriteria.setTenantId(clsureRequest.getAllotmentClsure().getTenantId());
		clsureRequest.setAllotmentClsure(clsureRepository.getClsureByIds(clsureCriteria).get(0));
//		JsonNode additionalDetails=boundaryService.loadPropertyData(allotmentRequest);
//		AllotmentDetails allotmentDetails= allotmentEnrichmentService.searchAllotment(allotmentRequest.getRequestInfo(), allotmentCriteria);
//		allotmentDetails.setAdditionalDetails(additionalDetails);
//		allotmentRequest.setAllotment(allotmentDetails);
	    return clsureRequest;
	}
}
