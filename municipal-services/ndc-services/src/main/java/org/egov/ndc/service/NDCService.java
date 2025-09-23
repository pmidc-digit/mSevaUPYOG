package org.egov.ndc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.NDCRepository;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.util.NDCConstants;
import org.egov.ndc.util.NDCUtil;
import org.egov.ndc.web.model.AuditDetails;
import org.egov.ndc.web.model.OwnerInfo;
import org.egov.ndc.web.model.UserResponse;
import org.egov.ndc.web.model.calculator.CalculationCriteria;
import org.egov.ndc.web.model.calculator.CalculationReq;
import org.egov.ndc.web.model.calculator.CalculationRes;
import org.egov.ndc.web.model.ndc.*;
import org.egov.ndc.web.model.workflow.SearchCriteria;
import org.egov.ndc.workflow.WorkflowIntegrator;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NDCService {

	@Autowired
	NDCUtil ndcUtil;

	@Autowired
	UserService userService;

	@Autowired
	CalculationService calculationService;

	@Autowired
	private WorkflowIntegrator workflowIntegrator;

	@Autowired
	private NDCConfiguration ndcConfiguration;

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

	@Autowired
	private MDMSService mdmsService;

	@Autowired
	private  EnrichmentService enrichmentService;

	public NdcApplicationRequest createNdcApplication(boolean skipWorkFlow, NdcApplicationRequest ndcApplicationRequest) {

		String userUuidFromRequestInfo = ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid();
		for (Application application : ndcApplicationRequest.getApplications()) {

			List<String> idList = ndcUtil.getIdList(ndcApplicationRequest.getRequestInfo(), application.getTenantId(), "ndc.applicationid", "NDC-[cy:yyyy-MM-dd]-[SEQ_EGOV_COMMON]", 1);
			log.info(idList.toString());
			String applicantionId = idList.get(0);
			application.setUuid(applicantionId);
			application.setAuditDetails(AuditDetails.builder().createdBy(userUuidFromRequestInfo)
					.createdTime(System.currentTimeMillis())
					.lastModifiedBy(userUuidFromRequestInfo)
					.lastModifiedTime(System.currentTimeMillis()).build());

			if (application.getActive() == null) application.setActive(true);

			List<NdcDetailsRequest> ndcDetails = application.getNdcDetails();
			if (ndcDetails != null) {
				for (NdcDetailsRequest details : ndcDetails) {
					details.setUuid(UUID.randomUUID().toString());
					details.setApplicationId(applicantionId);
				}
			}

			List<DocumentRequest> documents = application.getDocuments();
			if (documents != null) {
				for (DocumentRequest document : documents) {
					if (document.getDocumentAttachment() == null)
						throw new CustomException("DOCUMENT_ATTACHMENT_NULL", "Document attachment is null");
					if (document.getUuid() == null)
						throw new CustomException("DOCUMENT_UUID_NULL", "Document uuid is null");
					document.setApplicationId(applicantionId);
					document.setCreatedby(userUuidFromRequestInfo);
					document.setLastmodifiedby(userUuidFromRequestInfo);
					document.setCreatedtime(System.currentTimeMillis());
					document.setLastmodifiedtime(System.currentTimeMillis());
				}
			}
			userService.createUser(ndcApplicationRequest.getRequestInfo(),application);
			NdcApplicationRequest ndcApplicationRequest1 = NdcApplicationRequest.builder().requestInfo(ndcApplicationRequest.getRequestInfo()).applications(Collections.singletonList(application)).build();
			if(!skipWorkFlow) {
				workflowIntegrator.callWorkFlow(ndcApplicationRequest1, NDCConstants.NDC_BUSINESS_SERVICE);
			}
		}
		

		log.info("Request: {}", ndcApplicationRequest);



		producer.push(config.getSaveTopic(), ndcApplicationRequest);

		return ndcApplicationRequest;
	}

	public NdcApplicationRequest updateNdcApplication(boolean skipWorkFlow,NdcApplicationRequest ndcApplicationRequest) {
		log.info("ndc request :", ndcApplicationRequest);
		RequestInfo requestInfo = ndcApplicationRequest.getRequestInfo();
		String userUuidFromRequestInfo = requestInfo.getUserInfo().getUuid();
		List<Application> applications = ndcApplicationRequest.getApplications();
		if (applications == null || applications.isEmpty()) {
			throw new CustomException("APPLICATIONS_EMPTY", "No applications found in request.");
		}
		for (Application application : applications) {

            if (ObjectUtils.isEmpty(application.getUuid())) {
                throw new CustomException("APPLICANT_UUID_NULL", "Applicant details or uuid is null");
            }
            if (!ndcRepository.checkApplicationExists(application.getUuid())) {
                throw new CustomException("APPLICANT_NOT_FOUND", "Applicant details or uuid is not found.");
            }

            AuditDetails auditDetails = application.getAuditDetails();
            auditDetails.setLastModifiedBy(userUuidFromRequestInfo);
            auditDetails.setLastModifiedTime(System.currentTimeMillis());
			application.setAuditDetails(auditDetails);

            List<NdcDetailsRequest> ndcDetails = application.getNdcDetails();
            if (ndcDetails != null) {
                Set<String> existingDetailUuids = getExistingUuids("eg_ndc_details", ndcDetails.stream().map(NdcDetailsRequest::getUuid).collect(Collectors.toList()));
                for (NdcDetailsRequest details : ndcDetails) {
                    if (details.getUuid() == null || !existingDetailUuids.contains(details.getUuid())) {
                        details.setUuid(UUID.randomUUID().toString());
                        details.setApplicationId(application.getUuid());
                    }
                }
            }

            List<DocumentRequest> documents = application.getDocuments();
            if (documents != null) {
                Set<String> existingDocumentUuids = getExistingUuids("eg_ndc_documents", documents.stream().map(DocumentRequest::getUuid).collect(Collectors.toList()));
                for (DocumentRequest document : documents) {
                    if (document.getUuid() == null) {
                        throw new CustomException("DOCUMENT_ID_ERR", "Please provide a valid document id.");
                    }
                    if (!existingDocumentUuids.contains(document.getUuid())) {
                        document.setUuid(document.getUuid());
                        document.setApplicationId(application.getUuid());
                        document.setCreatedby(userUuidFromRequestInfo);
                        document.setCreatedtime(System.currentTimeMillis());
                    }
                    document.setLastmodifiedby(userUuidFromRequestInfo);
                    document.setLastmodifiedtime(System.currentTimeMillis());
                }
            }

			List<OwnerInfo> owners = application.getOwners();
			if (owners != null) {
				userService.createUser(requestInfo,application);
			}

			NdcApplicationRequest requestTobeUpdated = NdcApplicationRequest.builder().requestInfo(requestInfo).applications(Collections.singletonList(application)).build();
			log.info("ndc request with current applications :", requestTobeUpdated);
			if (!skipWorkFlow) {
                workflowIntegrator.callWorkFlow(requestTobeUpdated, NDCConstants.NDC_BUSINESS_SERVICE);
            }
            if (application.getWorkflow().getAction().equalsIgnoreCase("APPLY")) {
                getCalculation(requestTobeUpdated);
            }
        }
			producer.push(config.getUpdateTopic(), ndcApplicationRequest);

			return ndcApplicationRequest;
		}

	public NdcApplicationRequest deleteNdcApplication(NdcDeleteRequest ndcDeleteRequest) {

		if(ObjectUtils.isEmpty(ndcDeleteRequest.getUuid())){
			throw new CustomException("APPLICANT_UUID_NULL", "Applicant uuid is null");
		}
		if(ObjectUtils.isEmpty(ndcDeleteRequest.getTenantId())){
			throw new CustomException("APPLICANT_TENANT_NULL", "Applicant tenantId is null");
		}

		if(!ndcRepository.checkApplicationExists(ndcDeleteRequest.getUuid())) {
			throw new CustomException("APPLICANT_NOT_FOUND", "Applicant uuid not found.");
		}
		Application application = searchNdcApplications(NdcApplicationSearchCriteria.builder().tenantId(ndcDeleteRequest.getTenantId()).uuid(Collections.singletonList(ndcDeleteRequest.getUuid())).build(), ndcDeleteRequest.getRequestInfo()).get(0);
		NdcApplicationRequest ndcApplicationRequest = NdcApplicationRequest.builder().requestInfo(ndcDeleteRequest.getRequestInfo()).build();
		AuditDetails auditDetails = application.getAuditDetails();
		auditDetails.setLastModifiedBy(ndcDeleteRequest.getRequestInfo().getUserInfo().getUuid());
		auditDetails.setLastModifiedTime(System.currentTimeMillis());
		application.setAuditDetails(auditDetails);
		application.setActive(ndcDeleteRequest.getActive());
		ndcApplicationRequest.setApplications(Collections.singletonList(application));

		producer.push(config.getDeleteTopic(), application);
		return ndcApplicationRequest;
	}


	private Set<String> getExistingUuids(String tableName, List<String> uuids) {
		if (uuids == null || uuids.isEmpty()) {
			return new HashSet<>();
		}
		return ndcRepository.getExistingUuids(tableName, uuids);
	}

	public List<Application> searchNdcApplications(NdcApplicationSearchCriteria criteria, RequestInfo requestInfo) {
		if (StringUtils.isBlank(criteria.getTenantId())) {
			throw new CustomException("EG_NDC_TENANT_ID_NULL", "Tenant ID must not be null");
		}
		if (criteria.getMobileNumber() != null || criteria.getName() != null) {
			UserResponse userDetailResponse = userService.getUser(criteria, requestInfo);
			if (userDetailResponse.getUser().isEmpty()) {
				return Collections.emptyList();
			}
			criteria.setOwnerIds(userDetailResponse.getUser().stream().map(OwnerInfo::getUuid).collect(Collectors.toSet()));

		}
		List<Application> applications = getApplicationsWithOwnerInfo(criteria, requestInfo);
		SearchCriteria searchCriteria = new SearchCriteria();
		searchCriteria.setTenantId(criteria.getTenantId());
		enrichmentService.enrichProcessInstance(applications, searchCriteria, requestInfo);
		return applications;
	}

	public List<Application> getApplicationsWithOwnerInfo(NdcApplicationSearchCriteria criteria, RequestInfo requestInfo) {
		List<Application> applications = ndcRepository.fetchNdcApplications(criteria);
		if (CollectionUtils.isEmpty(applications))
			return Collections.emptyList();
		enrichmentService.enrichApplicationCriteriaWithOwnerids(criteria, applications);
		UserResponse userDetailResponse = userService.getUser(criteria, requestInfo);
		enrichmentService.enrichOwner(userDetailResponse, applications);
		return applications;
	}

	public void getCalculation(NdcApplicationRequest request){

		List<CalculationCriteria> calculationCriteriaList = new ArrayList<>();
			CalculationCriteria calculationCriteria = CalculationCriteria.builder()
					.ndcApplicationRequest(request)
					.tenantId(request.getApplications().get(0).getTenantId())
					.applicationNumber(request.getApplications().get(0).getUuid())
					.build();
			calculationCriteriaList.add(calculationCriteria);

		CalculationReq calculationReq = CalculationReq.builder()
				.requestInfo(request.getRequestInfo())
				.calculationCriteria(calculationCriteriaList)
				.build();

		StringBuilder url = new StringBuilder().append(ndcConfiguration.getNdcCalculatorHost())
				.append(ndcConfiguration.getNdcCalculatorEndpoint());
		Object response = serviceRequestRepository.fetchResult(url, calculationReq);
		CalculationRes calculationRes = mapper.convertValue(response, CalculationRes.class);
		log.info("Calculation Response: " + calculationRes);
	}

}
