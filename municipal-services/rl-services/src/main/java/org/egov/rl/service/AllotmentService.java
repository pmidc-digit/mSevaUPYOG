package org.egov.rl.service;

import java.util.HashSet;
import java.util.Set;

import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.producer.PropertyProducer;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.validator.AllotmentValidator;
import org.egov.rl.workflow.AllotmentWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

@Service
public class AllotmentService {
	
	@Autowired
	private PropertyProducer producer;

	@Autowired
	private RentLeaseConfiguration config;
	
	@Autowired
	private AllotmentEnrichmentService allotmentEnrichmentService;
	
	@Autowired
	private AllotmentValidator allotmentValidator;


	@Autowired
	private AllotmentWorkflowService wfService;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;
	
	@Autowired
	BoundaryService boundaryService;

	/**
	 * Enriches the Request and pushes to the Queue
	 *
	 * @param request PropertyRequest containing list of properties to be created
	 * @return List of properties successfully created
	 */

	public AllotmentDetails allotmentCreate(AllotmentRequest allotmentRequest){

		allotmentValidator.validateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichCreateRequest(allotmentRequest);
		
		if (config.getIsWorkflowEnabled()) {
			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().setStatus("ACTIVE");
		}
		String previousApplicationNumber=allotmentRequest.getAllotment().getPreviousApplicationNumber();
		if(previousApplicationNumber!=null&&previousApplicationNumber.trim().length()>0){
		    AllotmentDetails allotment=allotmentRequest.getAllotment();
		    allotment.setApplicationType("RENEWAL");
			allotmentRequest.setAllotment(allotment);			
		}else {
			AllotmentDetails allotment=allotmentRequest.getAllotment();
		    allotment.setApplicationType("NEW");
			allotmentRequest.setAllotment(allotment);
		}
		producer.push(config.getSaveRLAllotmentTopic(), allotmentRequest);
		allotmentRequest.getAllotment().setWorkflow(null);
		return allotmentRequest.getAllotment();
	}
	
	public AllotmentDetails allotmentUpdate(AllotmentRequest allotmentRequest){
		
		allotmentValidator.validateAllotementRequest(allotmentRequest);
		allotmentEnrichmentService.enrichUpdateRequest(allotmentRequest);
		AllotmentDetails allotmentDetails=allotmentRequest.getAllotment();
		allotmentRequest.setAllotment(allotmentDetails);
		if (config.getIsWorkflowEnabled()) {
//			wfService.updateWorkflowStatus(allotmentRequest);
		} else {
			allotmentRequest.getAllotment().setStatus("ACTIVE");
		}
		
		producer.push(config.getUpdateRLAllotmentTopic(), allotmentRequest);
		allotmentRequest.getAllotment().setWorkflow(null);
		return allotmentRequest.getAllotment();
	}
	
	public AllotmentRequest allotmentSearch(AllotmentRequest allotmentRequest){
		AllotmentCriteria allotmentCriteria=new AllotmentCriteria();
		Set<String> id=new HashSet<>();
		id.add(allotmentRequest.getAllotment().getId());
		allotmentCriteria.setAllotmentIds(id);
		allotmentCriteria.setTenantId(allotmentRequest.getAllotment().getTenantId());
		
		
		JsonNode additionalDetails=boundaryService.loadPropertyData(allotmentRequest);
		AllotmentDetails allotmentDetails= allotmentEnrichmentService.searchAllotment(allotmentRequest.getRequestInfo(), allotmentCriteria);
		allotmentDetails.setAdditionalDetails(additionalDetails);
		allotmentRequest.setAllotment(allotmentDetails);
	    return allotmentRequest;
	}
}
