package org.egov.ndc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.NDCRepository;
import org.egov.ndc.repository.ServiceRequestRepository;
import org.egov.ndc.util.NDCConstants;
import org.egov.ndc.web.model.RequestInfoWrapper;
import org.egov.ndc.web.model.bill.BillResponse;
import org.egov.ndc.web.model.ndc.*;
import org.egov.ndc.web.model.property.PropertyResponse;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class NDCService {

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

	public NdcApplicationRequest createNdcApplication(NdcApplicationRequest ndcApplicationRequest) {
		// Save applicant data
		String applicantId = UUID.randomUUID().toString();
		ApplicantRequest applicant = ndcApplicationRequest.getApplicant();
		applicant.setUuid(applicantId);
		applicant.setCreatedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
		applicant.setLastmodifiedby(ndcApplicationRequest.getRequestInfo().getUserInfo().getUuid());
		applicant.setCreatedtime(System.currentTimeMillis());
		applicant.setLastmodifiedtime(System.currentTimeMillis());

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

		producer.push(config.getSaveTopic(), ndcApplicationRequest);

		return ndcApplicationRequest;
	}

	public DuesDetails checkNoDuesForProperty(PendingDuesRequest pendingDuesRequest, RequestInfo requestInfo) {
		DuesDetails duesDetails = new DuesDetails();
		// Check property details
		BigDecimal propertyNoDues = checkNoDues(pendingDuesRequest, requestInfo, config.getPropertyServicePath(), config.getPropertySearchPath(), NDCConstants.PROPERTY_BUSINESS_SERVICE_CODE);
		duesDetails.setPropertyDues(propertyNoDues);

		// Check water connection details
		BigDecimal waterNoDues = checkNoDues(pendingDuesRequest, requestInfo, config.getWaterConnectionServicePath(), config.getWaterSearchPath(), NDCConstants.WATER_TAX_SERVICE_CODE);
		duesDetails.setPropertyDues(waterNoDues);

		// Check sewerage connection details
		BigDecimal sewerageNoDues = checkNoDues(pendingDuesRequest, requestInfo, config.getSewerageConnectionServicePath(), config.getSewerageSearchPath(), NDCConstants.SEWERAGE_TAX_SERVICE_CODE);
		duesDetails.setPropertyDues(sewerageNoDues);

		return duesDetails;
	}

	public BigDecimal checkNoDues(PendingDuesRequest pendingDuesRequest, RequestInfo requestInfo, String servicePath, String searchPath, String businessService) {
		// Check if the entity exists
		StringBuilder url = buildUrl(servicePath, searchPath, pendingDuesRequest.getTenantId(), pendingDuesRequest.getMobileNumber(), pendingDuesRequest.getPropertyId(), pendingDuesRequest.getFullName());

		LinkedHashMap responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(url, pendingDuesRequest);
		PropertyResponse propertyResponse = mapper.convertValue(responseMap, PropertyResponse.class);
		if (propertyResponse == null || CollectionUtils.isEmpty(propertyResponse.getProperties()) || !propertyResponse.getProperties().get(0).getPropertyId().equals(pendingDuesRequest.getPropertyId())) {
			throw new CustomException("Entity not found", "Entity not found");
		}

		// Check if dues exist
		return getDues(pendingDuesRequest, requestInfo, businessService);
	}

	private BigDecimal getDues(PendingDuesRequest pendingDuesRequest, RequestInfo requestInfo, String businessService) {
		BillResponse billResponse = fetchBill(pendingDuesRequest.getTenantId(), pendingDuesRequest.getPropertyId(), businessService, requestInfo);
		if (billResponse == null || CollectionUtils.isEmpty(billResponse.getBill()) || billResponse.getBill().get(0).getTotalAmount().equals(BigDecimal.valueOf(0.0))) {
			return BigDecimal.valueOf(0.0);
		} else {
			return billResponse.getBill().get(0).getTotalAmount();
		}
	}

	public BillResponse fetchBill(String tenantId, String connectionNo, String businessService, RequestInfo requestInfo) {
		BillResponse billResponse;
		try {
			Object result = serviceRequestRepository.fetchResult(getFetchBillURL(tenantId, connectionNo, businessService), RequestInfoWrapper.builder().requestInfo(requestInfo).build());
			billResponse = mapper.convertValue(result, BillResponse.class);
		} catch (Exception ex) {
			throw new CustomException("FETCH_BILL_ERRORCODE", "Error while fetching the bill for " + businessService + " " + ex.getMessage());
		}
		return billResponse;
	}

	private StringBuilder buildUrl(String servicePath, String searchPath, String tenantId, String mobileNumber, String propertyId, String fullName) {
		StringBuilder urlBuilder = new StringBuilder(servicePath).append(searchPath);
		urlBuilder.append("?tenantId=").append(tenantId);
		urlBuilder.append("&mobileNumber=").append(mobileNumber);
		urlBuilder.append("&propertyIds=").append(propertyId);
		if (fullName != null && !fullName.isEmpty()) {
			urlBuilder.append("&name=").append(fullName);
		}
		return urlBuilder;
	}

	private StringBuilder getFetchBillURL(String tenantId, String consumerCode,String businessService) {

		return new StringBuilder()
				.append(config.getBillingServicePath()).append(config.getFetchBillPath())
				.append("?tenantId=").append(tenantId).append("&consumerCode=")
				.append(consumerCode).append("&businessservice=").append(businessService);
	}
}
