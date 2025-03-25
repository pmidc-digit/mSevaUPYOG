package org.egov.ndc.service;

import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.repository.IdGenRepository;
import org.egov.ndc.util.NDCConstants;
import org.egov.ndc.util.NDCUtil;
import org.egov.ndc.web.model.AuditDetails;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.NdcRequest;
import org.egov.ndc.web.model.enums.Status;
import org.egov.ndc.web.model.idgen.IdResponse;
import org.egov.ndc.web.model.workflow.BusinessService;
import org.egov.ndc.web.model.workflow.State;
import org.egov.ndc.workflow.WorkflowService;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;

@Service
public class EnrichmentService {

	@Autowired
	private NDCConfiguration config;

	@Autowired
	private NDCUtil ndcUtil;

	@Autowired
	private IdGenRepository idGenRepository;

	@Autowired
	private WorkflowService workflowService;

	/**
	 * Enriches the ndcReuqest object with puplating the id field with the uuids and
	 * the auditDetails
	 * 
	 * @param ndcRequest
	 * @param mdmsData
	 */
	public void enrichCreateRequest(NdcRequest ndcRequest, Object mdmsData) {
		RequestInfo requestInfo = ndcRequest.getRequestInfo();
		AuditDetails auditDetails = ndcUtil.getAuditDetails(requestInfo.getUserInfo().getUuid(), true);
		ndcRequest.getNdc().setAuditDetails(auditDetails);
		ndcRequest.getNdc().setId(UUID.randomUUID().toString());
		ndcRequest.getNdc().setAccountId(ndcRequest.getNdc().getAuditDetails().getCreatedBy());
		setIdgenIds(ndcRequest);
		if (!CollectionUtils.isEmpty(ndcRequest.getNdc().getDocuments()))
			ndcRequest.getNdc().getDocuments().forEach(document -> {
				if (document.getId() == null) {
					document.setId(UUID.randomUUID().toString());
				}
			});
		if (!ObjectUtils.isEmpty(ndcRequest.getNdc().getWorkflow())
				&& !StringUtils.isEmpty(ndcRequest.getNdc().getWorkflow().getAction())
				&& ndcRequest.getNdc().getWorkflow().getAction().equals(NDCConstants.ACTION_INITIATE)) {

		}
	}

	/**
	 * sets the ids for all the child objects of NDCRequest
	 * @param request
	 */
	private void setIdgenIds(NdcRequest request) {
		RequestInfo requestInfo = request.getRequestInfo();
		String tenantId = request.getNdc().getTenantId();
		Ndc ndc = request.getNdc();

		List<String> applicationNumbers = getIdList(requestInfo, tenantId, config.getApplicationNoIdgenName(), 1);
		ListIterator<String> itr = applicationNumbers.listIterator();

		Map<String, String> errorMap = new HashMap<>();

		if (!errorMap.isEmpty())
			throw new CustomException(errorMap);

		ndc.setApplicationNo(itr.next());
	}

	/**
	 * fetch the list of ids based on the params passed
	 * @param requestInfo
	 * @param tenantId
	 * @param idKey
	 * @param count
	 * @return
	 */
	private List<String> getIdList(RequestInfo requestInfo, String tenantId, String idKey, int count) {
		List<IdResponse> idResponses = idGenRepository.getId(requestInfo, tenantId, idKey, count).getIdResponses();

		if (CollectionUtils.isEmpty(idResponses))
			throw new CustomException("IDGEN ERROR", "No ids returned from idgen Service");

		return idResponses.stream().map(IdResponse::getId).collect(Collectors.toList());
	}

	/**
	 * encriches the udpateRequest request Object populating the ids for documents, auditDetails
	 * @param ndcRequest
	 * @param searchResult
	 */
	public void enrichNdcUpdateRequest(NdcRequest ndcRequest, Ndc searchResult) {

		RequestInfo requestInfo = ndcRequest.getRequestInfo();
		AuditDetails auditDetails = ndcUtil.getAuditDetails(requestInfo.getUserInfo().getUuid(), false);
		ndcRequest.getNdc().setAuditDetails(auditDetails);
		ndcRequest.getNdc().getAuditDetails().setLastModifiedTime(auditDetails.getLastModifiedTime());

		// Ndc Documents
		if (!CollectionUtils.isEmpty(ndcRequest.getNdc().getDocuments()))
			ndcRequest.getNdc().getDocuments().forEach(document -> {
				if (document.getId() == null) {
					document.setId(UUID.randomUUID().toString());
				}
			});
		if (!ObjectUtils.isEmpty(ndcRequest.getNdc().getWorkflow())
				&& !CollectionUtils.isEmpty(ndcRequest.getNdc().getWorkflow().getDocuments())) {
			ndcRequest.getNdc().getWorkflow().getDocuments().forEach(document -> {
				if (document.getId() == null) {
					document.setId(UUID.randomUUID().toString());
				}
			});
		}
		ndcRequest.getNdc().setApplicationNo(searchResult.getApplicationNo());
		ndcRequest.getNdc().getAuditDetails().setCreatedBy(searchResult.getAuditDetails().getCreatedBy());
		ndcRequest.getNdc().getAuditDetails().setCreatedTime(searchResult.getAuditDetails().getCreatedTime());

	}

	/**
	 * called on success of the workflow action. setting the staus based on
	 * applicationStatus updated by workflow and generting the ndc number
	 * 
	 * @param ndcRequest
	 * @param businessServiceValue
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void postStatusEnrichment(NdcRequest ndcRequest, String businessServiceValue) {
		Ndc ndc = ndcRequest.getNdc();

		BusinessService businessService = workflowService.getBusinessService(ndc, ndcRequest.getRequestInfo(),
				businessServiceValue);

		if (businessService != null) {

			State stateObj = workflowService.getCurrentState(ndc.getApplicationStatus(), businessService);
			String state = stateObj != null ? stateObj.getState() : StringUtils.EMPTY;

			if (state.equalsIgnoreCase(NDCConstants.APPROVED_STATE)
					|| state.equalsIgnoreCase(NDCConstants.AUTOAPPROVED_STATE)) {

				Map<String, Object> additionalDetail = null;
				if (ndc.getAdditionalDetails() != null) {
					additionalDetail = (Map) ndc.getAdditionalDetails();
				} else {
					additionalDetail = new HashMap<String, Object>();
					ndc.setAdditionalDetails(additionalDetail);
				}

				List<IdResponse> idResponses = idGenRepository
						.getId(ndcRequest.getRequestInfo(), ndc.getTenantId(), config.getApplicationNoIdgenName(), 1)
						.getIdResponses();
				ndc.setNdcNo(idResponses.get(0).getId());
			}
			if (state.equalsIgnoreCase(NDCConstants.VOIDED_STATUS)) {
				ndc.setStatus(Status.INACTIVE);
			}
		}
		
		if (ndc.getWorkflow() != null && ndc.getWorkflow().getAction().equals(NDCConstants.ACTION_INITIATE)) {
			Map<String, String> details = (Map<String, String>) ndc.getAdditionalDetails();
			details.put(NDCConstants.INITIATED_TIME, Long.toString(System.currentTimeMillis()));
			ndc.setAdditionalDetails(details);
		}
	}

}