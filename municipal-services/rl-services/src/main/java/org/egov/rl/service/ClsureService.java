package org.egov.rl.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.ClosureCriteria;
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
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

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

	@Autowired
	UserService userService;
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
	
	public List<AllotmentClsure> searchClosedApplications(RequestInfo requestInfo,
			ClosureCriteria closureCriteria) {

// Handle mobile number search by converting to owner UUIDs
		if (!ObjectUtils.isEmpty(closureCriteria.getMobileNumber())) {
			System.out.println("DEBUG: Searching by mobile number: " + closureCriteria.getMobileNumber());

			List<String> userUuids1 = userService.getUserUuidsByMobileNumber(
					closureCriteria.getMobileNumber(), closureCriteria.getTenantId(),
					requestInfo);
			Set<String> userUuidSet = new HashSet<>(userUuids1);
			System.out.println("DEBUG: Found user UUIDs: " + userUuidSet);

			if (CollectionUtils.isEmpty(userUuidSet)) {
// No users found for this mobile number, return empty list
				System.out.println("DEBUG: No users found for mobile number, returning empty list");
				return new ArrayList<>();
			}

// Set owner UUIDs for search and clear mobile number
			closureCriteria.setOwnerIds(userUuidSet);
			closureCriteria.setMobileNumber(null);
			System.out.println("DEBUG: Set ownerUuids in criteria: " + closureCriteria.getOwnerIds());
		}

		List<AllotmentClsure> applications = clsureRepository.getClosuredApplications(closureCriteria);
//		applications=applications.stream().map(d->{
//		d.setOwnerInfo(allotmentRepository.getOwnerInfoListByAllotmentId(d.getId()));
//		return d;}).collect(Collectors.toList());
		if (CollectionUtils.isEmpty(applications))
			return new ArrayList<>();
//		allotmentEnrichmentService.enrichOwnerDetailsFromUserService(applications, requestInfo);

		return applications;
	}
}
