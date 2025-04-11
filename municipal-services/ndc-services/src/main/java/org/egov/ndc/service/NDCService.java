package org.egov.ndc.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.repository.NDCRepository;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.util.NDCConstants;
import org.egov.ndc.util.NDCUtil;
import org.egov.ndc.validator.NDCValidator;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.NdcRequest;
import org.egov.ndc.web.model.NdcSearchCriteria;
import org.egov.ndc.web.model.RequestInfoWrapper;
import org.egov.ndc.web.model.bpa.BPA;
import org.egov.ndc.web.model.bpa.BPAResponse;
import org.egov.ndc.web.model.bpa.BPASearchCriteria;
import org.egov.ndc.web.model.workflow.BusinessService;
import org.egov.ndc.web.model.workflow.ProcessInstance;
import org.egov.ndc.web.model.workflow.ProcessInstanceResponse;
import org.egov.ndc.workflow.WorkflowIntegrator;
import org.egov.ndc.workflow.WorkflowService;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NDCService {
	
	@Autowired
	private NDCValidator ndcValidator;
	
	@Autowired
	private WorkflowIntegrator wfIntegrator;
	
	@Autowired
	private NDCUtil ndcUtil;
	
	@Autowired
	private NDCRepository ndcRepository;
	
	@Autowired
	private EnrichmentService enrichmentService;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private NDCConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private ObjectMapper mapper;

	/**
	 * entry point from controller, takes care of next level logic from controller to create NDC application
	 * @param ndcRequest
	 * @return
	 */
	public List<Ndc> create(NdcRequest ndcRequest) {
		String tenantId = ndcRequest.getNdc().getTenantId().split("\\.")[0];
		Object mdmsData = ndcUtil.mDMSCall(ndcRequest.getRequestInfo(), tenantId);
		Map<String, String> additionalDetails = ndcValidator.getOrValidateBussinessService(ndcRequest.getNdc(), mdmsData);
		ndcValidator.validateCreate(ndcRequest,  mdmsData);
		enrichmentService.enrichCreateRequest(ndcRequest, mdmsData);
		if(!ObjectUtils.isEmpty(ndcRequest.getNdc().getWorkflow()) && !StringUtils.isEmpty(ndcRequest.getNdc().getWorkflow().getAction())) {
		  wfIntegrator.callWorkFlow(ndcRequest, additionalDetails.get(NDCConstants.WORKFLOWCODE));
		}else{
		  ndcRequest.getNdc().setApplicationStatus(NDCConstants.CREATED_STATUS);
		}
		ndcRepository.save(ndcRequest);
		return Arrays.asList(ndcRequest.getNdc());
	}
	/**
	 * entry point from controller, takes care of next level logic from controller to update NDC application
	 * @param ndcRequest
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public List<Ndc> update(NdcRequest ndcRequest) {
		String tenantId = ndcRequest.getNdc().getTenantId().split("\\.")[0];
		Object mdmsData = ndcUtil.mDMSCall(ndcRequest.getRequestInfo(), tenantId);
		Map<String, String> additionalDetails  ;
		if(!ObjectUtils.isEmpty(ndcRequest.getNdc().getAdditionalDetails()))  {
			additionalDetails = (Map) ndcRequest.getNdc().getAdditionalDetails();
		} else {
			additionalDetails = ndcValidator.getOrValidateBussinessService(ndcRequest.getNdc(), mdmsData);
		}
		Ndc searchResult = getNdcForUpdate(ndcRequest);
		if(searchResult.getApplicationStatus().equalsIgnoreCase("AUTO_APPROVED")
				&& ndcRequest.getNdc().getApplicationStatus().equalsIgnoreCase("INPROGRESS"))
		{
			log.info("NDC_UPDATE_ERROR_AUTO_APPROVED_TO_INPROGRESS_NOTALLOWED");
			throw new CustomException("AutoApproveException","NDC_UPDATE_ERROR_AUTO_APPROVED_TO_INPROGRESS_NOTALLOWED");
		}
		ndcValidator.validateUpdate(ndcRequest, searchResult, additionalDetails.get(NDCConstants.MODE), mdmsData);
		enrichmentService.enrichNdcUpdateRequest(ndcRequest, searchResult);
		
		if(!ObjectUtils.isEmpty(ndcRequest.getNdc().getWorkflow())
				&& !StringUtils.isEmpty(ndcRequest.getNdc().getWorkflow().getAction())) {
		   wfIntegrator.callWorkFlow(ndcRequest, additionalDetails.get(NDCConstants.WORKFLOWCODE));
		   enrichmentService.postStatusEnrichment(ndcRequest, additionalDetails.get(NDCConstants.WORKFLOWCODE));
		   BusinessService businessService = workflowService.getBusinessService(ndcRequest.getNdc(),
				   ndcRequest.getRequestInfo(), additionalDetails.get(NDCConstants.WORKFLOWCODE));
		   if(businessService == null)
			   ndcRepository.update(ndcRequest, true);
		   else
			   ndcRepository.update(ndcRequest, workflowService.isStateUpdatable(ndcRequest.getNdc().getApplicationStatus(), businessService));
		}else {
           ndcRepository.update(ndcRequest, Boolean.FALSE);
		}
		
		return Arrays.asList(ndcRequest.getNdc());
	}
	/**
	 * entry point from controller,applies the quired fileters and encrich search criteria and
	 * return the ndc application matching the search criteria
	 * @param criteria
	 * @return
	 */
	public List<Ndc> search(NdcSearchCriteria criteria, RequestInfo requestInfo) {
		/*
		 * List<String> uuids = new ArrayList<String>();
		 * uuids.add(requestInfo.getUserInfo().getUuid()); criteria.setAccountId(uuids);
		 */
		BPASearchCriteria bpaCriteria = new BPASearchCriteria();
		ArrayList<String> sourceRef = new ArrayList<String>();
		List<Ndc> ndcs = new ArrayList<Ndc>();

		RequestInfoWrapper requestInfoWrapper = RequestInfoWrapper.builder().requestInfo(requestInfo).build();
		if (criteria.getMobileNumber() != null) {
			StringBuilder uri = new StringBuilder(config.getBpaHost()).append(config.getBpaContextPath())
					.append(config.getBpaSearchEndpoint());
			uri.append("?tenantId=").append(criteria.getTenantId());

			if (criteria.getSourceRefId() != null)
			{   uri.append("&applicationNo=").append(criteria.getSourceRefId());
				uri.append("&mobileNumber=").append(criteria.getMobileNumber());
			}else
			{   uri.append("&mobileNumber=").append(criteria.getMobileNumber());}
			log.info("BPA CALL STARTED");
			LinkedHashMap responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(uri, requestInfoWrapper);
			BPAResponse bpaResponse = mapper.convertValue(responseMap, BPAResponse.class);
			List<BPA> bpas = bpaResponse.getBPA();
			Map<String, String> bpaDetails = new HashMap<String, String>();
			bpas.forEach(bpa -> {
				bpaDetails.put("applicantName", bpa.getLandInfo().getOwners().get(0).getName());
				bpaDetails.put("sourceRef", bpa.getApplicationNo());
				sourceRef.add(bpa.getApplicationNo());
			});
			if (!sourceRef.isEmpty()) {
				criteria.setSourceRefId(sourceRef.toString());
			}
			if(criteria.getMobileNumber() != null && CollectionUtils.isEmpty(bpas)){
				return ndcs;
			}
			log.info("NDC CALL STARTED" + criteria.getSourceRefId());
			ndcs = ndcRepository.getNdcData(criteria);
			ndcs.forEach(ndc -> {
				Map<String, String> additionalDetails = ndc.getAdditionalDetails() != null
						? (Map<String, String>) ndc.getAdditionalDetails()
						: new HashMap<String, String>();
				for (BPA bpa : bpas) {
					if (bpa.getApplicationNo().equals(ndc.getSourceRefId())) {
						additionalDetails.put("applicantName", bpa.getLandInfo().getOwners().get(0).getName());
					}
				}
				StringBuilder url = new StringBuilder(config.getWfHost());
				url.append(config.getWfProcessPath());
				url.append("?businessIds=");
				url.append(ndc.getApplicationNo());
				url.append("&tenantId=");
				url.append(ndc.getTenantId());
					
				log.info("Process CALL STARTED" + url);
				Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);
				ProcessInstanceResponse response = null;
				try {
					response = mapper.convertValue(result, ProcessInstanceResponse.class);
				} catch (IllegalArgumentException e) {
					throw new CustomException(NDCConstants.PARSING_ERROR, "Failed to parse response of Workflow");
				}
				if(response.getProcessInstances()!=null && !response.getProcessInstances().isEmpty()) {
					ProcessInstance ndcProcess = response.getProcessInstances().get(0);
					if (ndcProcess.getAssignee() != null) {
						additionalDetails.put("currentOwner", ndcProcess.getAssignee().getName());
					} else {
						additionalDetails.put("currentOwner", null);
					}
				} else {
					additionalDetails.put("currentOwner", null);
				}
			});

		} else {
			log.info("IN 2 NDC CALL STARTED" + criteria.getSourceRefId());
			ndcs = ndcRepository.getNdcData(criteria);
			ndcs.forEach(ndc -> {
				Map<String, String> additionalDetails = ndc.getAdditionalDetails() != null
						? (Map<String, String>) ndc.getAdditionalDetails()
						: new HashMap<String, String>();

				// BPA CALL
				StringBuilder uri = new StringBuilder(config.getBpaHost()).append(config.getBpaContextPath())
						.append(config.getBpaSearchEndpoint());

				uri.append("?tenantId=").append(ndc.getTenantId());
				uri.append("&applicationNo=").append(ndc.getSourceRefId());
				System.out.println("BPA CALL STARTED");
				LinkedHashMap responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(uri,
						requestInfoWrapper);
				BPAResponse bpaResponse = mapper.convertValue(responseMap, BPAResponse.class);
				List<BPA> bpaList = new ArrayList<BPA>();
				bpaList = bpaResponse.getBPA();
				bpaList.forEach(bpa -> {
					additionalDetails.put("applicantName", bpa.getLandInfo().getOwners().get(0).getName());
				});
				log.info("ADDITIONAL DETAILS :: " + additionalDetails.get("applicantName"));
				// PROCESS CALL
				StringBuilder url = new StringBuilder(config.getWfHost());
				url.append(config.getWfProcessPath());
				url.append("?businessIds=");
				url.append(ndc.getApplicationNo());
				url.append("&tenantId=");
				url.append(ndc.getTenantId());
							
				log.info("Process 2 CALL STARTED" + url);
				Object result = serviceRequestRepository.fetchResult(url, requestInfoWrapper);
				ProcessInstanceResponse response = null;
				try {
					response = mapper.convertValue(result, ProcessInstanceResponse.class);
				} catch (IllegalArgumentException e) {
					throw new CustomException(NDCConstants.PARSING_ERROR, "Failed to parse response of Workflow");
				}
				log.info("ProcessInstance :: " + response.getProcessInstances());
				if(response.getProcessInstances()!=null && !response.getProcessInstances().isEmpty()) {
					ProcessInstance ndcProcess = response.getProcessInstances().get(0);
					if (ndcProcess.getAssignee() != null) {
						additionalDetails.put("currentOwner", ndcProcess.getAssignee().getName());
					} else {
						additionalDetails.put("currentOwner", null);
					}
				}else {
					additionalDetails.put("currentOwner", null);
				}
				log.info("ADDITIONAL DETAILS :: " + additionalDetails.get("currentOwner"));
			});
		}
		return ndcs.isEmpty() ? Collections.emptyList() : ndcs;
	}
	
	/**
	 * Fetch the ndc based on the id to update the NDC record
	 * @param ndcRequest
	 * @return
	 */
	public Ndc getNdcForUpdate(NdcRequest ndcRequest) {		
		List<String> ids = Arrays.asList(ndcRequest.getNdc().getId());
		NdcSearchCriteria criteria = new NdcSearchCriteria();
		criteria.setIds(ids);
		List<Ndc> ndcList = search(criteria, ndcRequest.getRequestInfo());
		if (CollectionUtils.isEmpty(ndcList) ) {
			StringBuilder builder = new StringBuilder();
			builder.append("Ndc Application not found for: ").append(ndcRequest.getNdc().getId()).append(" :ID");
			throw new CustomException("INVALID_NDC_SEARCH", builder.toString());
		}else if( ndcList.size() > 1) {
			StringBuilder builder = new StringBuilder();
			builder.append("Multiple Ndc Application(s) not found for: ").append(ndcRequest.getNdc().getId()).append(" :ID");
			throw new CustomException("INVALID_NDC_SEARCH", builder.toString());
		}
		return ndcList.get(0);
	}
	
	/**
         * entry point from controller,applies the quired fileters and encrich search criteria and
         * return the ndc application count the search criteria
         * @param criteria
         * @return
         */
        public Integer getNdcCount(NdcSearchCriteria criteria, RequestInfo requestInfo) {
                /*List<String> uuids = new ArrayList<String>();
                uuids.add(requestInfo.getUserInfo().getUuid());
                criteria.setAccountId(uuids);*/
                return ndcRepository.getNdcCount(criteria);
        }
	
}
