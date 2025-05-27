package org.egov.ndc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.NDCRepository;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.util.NDCConstants;
import org.egov.ndc.web.model.ndc.*;
import org.egov.ndc.workflow.WorkflowIntegrator;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NDCService {

	@Autowired
	private WorkflowIntegrator workflowIntegrator;

	@Autowired
	private NDCRepository ndcRepository;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private NDCConfiguration config;

	@Autowired
	private Producer producer;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	public NdcApplicationRequest createNdcApplication(boolean skipWorkFlow, NdcApplicationRequest ndcApplicationRequest) {
		// Save applicant data
		String applicantId = UUID.randomUUID().toString();
		ApplicantRequest applicant = ndcApplicationRequest.getApplicant();
		applicant.setUuid(applicantId);
		applicant.setCreatedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
		applicant.setLastmodifiedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
		applicant.setCreatedtime(System.currentTimeMillis());
		applicant.setLastmodifiedtime(System.currentTimeMillis());
		if(applicant.getActive()==null) {
			applicant.setActive(true);
		}

		// Save NDC details
		List<NdcDetailsRequest> ndcDetails = ndcApplicationRequest.getNdcDetails();
		if(ndcDetails!= null) {
			for (NdcDetailsRequest details : ndcDetails) {
				details.setUuid(UUID.randomUUID().toString());
				details.setApplicantId(applicantId);
			}
		}

		List<DocumentRequest> documents = ndcApplicationRequest.getDocuments();
		if(documents != null) {
			for (DocumentRequest document : documents) {
				if(document.getDocumentAttachment()==null) throw new CustomException("DOCUMENT_ATTACHMENT_NULL", "Document attachment is null");
				if(document.getUuid()==null) throw new CustomException("DOCUMENT_UUID_NULL", "Document uuid is null");
				document.setApplicantId(applicantId);
				document.setCreatedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
				document.setLastmodifiedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
				document.setCreatedtime(System.currentTimeMillis());
				document.setLastmodifiedtime(System.currentTimeMillis());
			}
		}
		System.out.println(ndcApplicationRequest);

		if(!skipWorkFlow) {
			workflowIntegrator.callWorkFlow(ndcApplicationRequest, NDCConstants.NDC_BUSINESS_SERVICE);
		}
		producer.push(config.getSaveTopic(), ndcApplicationRequest);

		return ndcApplicationRequest;
	}

	public NdcApplicationRequest updateNdcApplication(boolean skipWorkFlow,NdcApplicationRequest ndcApplicationRequest) {

		if(ndcApplicationRequest.getApplicant()==null || ObjectUtils.isEmpty(ndcApplicationRequest.getApplicant().getUuid())){
			throw new CustomException("APPLICANT_UUID_NULL", "Applicant details or uuid is null");
		}
		if(!ndcRepository.checkApplicantExists(ndcApplicationRequest.getApplicant().getUuid())) {
			throw new CustomException("APPLICANT_NOT_FOUND", "Applicant details or uuid is not found.");
		}

		ApplicantRequest applicant = ndcApplicationRequest.getApplicant();
		applicant.setLastmodifiedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
		applicant.setLastmodifiedtime(System.currentTimeMillis());

		// Update NDC details
		List<NdcDetailsRequest> ndcDetails = ndcApplicationRequest.getNdcDetails();
		if (ndcDetails != null) {
			Set<String> existingDetailUuids = getExistingUuids("eg_ndc_details", ndcDetails.stream().map(NdcDetailsRequest::getUuid).collect(Collectors.toList()));
			for (NdcDetailsRequest details : ndcDetails) {
				if (details.getUuid() == null || !existingDetailUuids.contains(details.getUuid())) {
					details.setUuid(UUID.randomUUID().toString());
					details.setApplicantId(applicant.getUuid());
				}
			}
		}

		// Update documents
		List<DocumentRequest> documents = ndcApplicationRequest.getDocuments();
		if (documents != null) {
			Set<String> existingDocumentUuids = getExistingUuids("eg_ndc_documents", documents.stream().map(DocumentRequest::getUuid).collect(Collectors.toList()));
			for (DocumentRequest document : documents) {
				if (document.getUuid() == null || !existingDocumentUuids.contains(document.getUuid())) {
					document.setUuid(UUID.randomUUID().toString());
					document.setApplicantId(applicant.getUuid());
					document.setCreatedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
					document.setCreatedtime(System.currentTimeMillis());
				}
				document.setLastmodifiedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
				document.setLastmodifiedtime(System.currentTimeMillis());
			}
		}

		log.info("ndc request :", ndcApplicationRequest);
		if(!skipWorkFlow) {
			workflowIntegrator.callWorkFlow(ndcApplicationRequest, NDCConstants.NDC_BUSINESS_SERVICE);
		}
		// Push to update topic
		producer.push(config.getUpdateTopic(), ndcApplicationRequest);

		return ndcApplicationRequest;
	}

	public NdcApplicationRequest deleteNdcApplication(NdcDeleteRequest ndcDeleteRequest) {

		if(ObjectUtils.isEmpty(ndcDeleteRequest.getUuid())){
			throw new CustomException("APPLICANT_UUID_NULL", "Applicant uuid is null");
		}
		if(!ndcRepository.checkApplicantExists(ndcDeleteRequest.getUuid())) {
			throw new CustomException("APPLICANT_NOT_FOUND", "Applicant uuid not found.");
		}
		NdcApplicationRequest ndcApplicationRequest = searchNdcApplications(NdcApplicationSearchCriteria.builder().uuid(ndcDeleteRequest.getUuid()).build()).get(0);
		ApplicantRequest applicant = ndcApplicationRequest.getApplicant();
		applicant.setLastmodifiedby(ndcDeleteRequest.getRequestInfo().getUserInfo().getUuid());
		applicant.setLastmodifiedtime(System.currentTimeMillis());
		applicant.setActive(ndcDeleteRequest.getActive());
		ndcApplicationRequest.setApplicant(applicant);
		// Push to delete topic
		System.out.println(applicant);
		producer.push(config.getDeleteTopic(), applicant);

		return ndcApplicationRequest;
	}


	private Set<String> getExistingUuids(String tableName, List<String> uuids) {
		if (uuids == null || uuids.isEmpty()) {
			return new HashSet<>();
		}
		return ndcRepository.getExistingUuids(tableName, uuids);
	}

	public List<NdcApplicationRequest> searchNdcApplications(NdcApplicationSearchCriteria criteria) {

		if (StringUtils.isNotBlank(criteria.getUuid())) {
			return ndcRepository.fetchNdcApplications(criteria);
		}

		if (StringUtils.isBlank(criteria.getTenantId())) {
			throw new CustomException("EG_NDC_TENANT_ID_NULL","Tenant ID must not be null or empty when UUID is not provided");
		}

		if (StringUtils.isNotBlank(criteria.getMobileNumber()) ||
				StringUtils.isNotBlank(criteria.getName()) || criteria.getActive()!=null||
				criteria.getStatus() != null) {
			return ndcRepository.fetchNdcApplications(criteria);
		}else{
			throw new CustomException("EG_NDC_TENANT_ID_NULL_PARAM_NULL","Parameter missing with Tenant ID or empty when UUID is not provided");
		}

//		return new ArrayList<>();
	}
}
