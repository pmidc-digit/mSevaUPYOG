//package org.egov.rl.validator;
//
//import java.sql.Timestamp;
//import java.util.Arrays;
//import java.util.HashMap;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.Set;
//
//import org.egov.mdms.model.MasterDetail;
//import org.egov.mdms.model.MdmsCriteria;
//import org.egov.mdms.model.MdmsCriteriaReq;
//import org.egov.mdms.model.ModuleDetail;
//import org.egov.rl.config.RentLeaseConfiguration;
//import org.egov.rl.models.AllotmentClsure;
//import org.egov.rl.models.AllotmentCriteria;
//import org.egov.rl.models.AllotmentDetails;
//import org.egov.rl.models.AllotmentRequest;
//import org.egov.rl.models.ClosureCriteria;
//import org.egov.rl.models.ClsureRequest;
//import org.egov.rl.models.OwnerInfo;
//import org.egov.rl.repository.AllotmentRepository;
//import org.egov.rl.repository.ClsureRepository;
//import org.egov.rl.service.ClsureService;
//import org.egov.rl.util.EncryptionDecryptionUtil;
//import org.egov.tracer.model.CustomException;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Component;
//import org.springframework.util.CollectionUtils;
//import org.springframework.web.client.RestTemplate;
//
//import lombok.extern.slf4j.Slf4j;
//
//@Slf4j
//@Component
//public class ClsureValidator {
//
//	@Autowired
//	private RentLeaseConfiguration configs;
//
//	@Autowired
//	RestTemplate restTemplate;// = new RestTemplate();
//
//	@Autowired
//	AllotmentRepository allotmentRepository;
//
//	@Autowired
//	ClsureRepository clsureRepository;
//
//	@Autowired
//	EncryptionDecryptionUtil encryptionDecryptionUtil;
//
//	/**
//	 * Validate the masterData and ctizenInfo of the given propertyRequest
//	 * 
//	 * @param request PropertyRequest for create
//	 */
//	public void validateCreateClsureRequest(ClsureRequest clsureRequest) {
//
//		AllotmentClsure allotmentClsure = clsureRequest.getAllotmentClsure();
//
//		if (clsureRequest.getAllotmentClsure() == null)
//			throw new CustomException("CLSURE INFO ERROR",
//					"CLSURE cannot be empty, please provide the CLSURE information");
//
////		if (allotmentClsure.getTenantId() == null) {
////			throw new CustomException("CLSURE INFO ERROR",
////					"tenant_id can't be null or empty, please provide the CLSURE information");
////		}
//		
//		AllotmentCriteria allotmentCriteria = new AllotmentCriteria();
//		Set<String> applicationNumber = new HashSet<>();
//		applicationNumber.add(clsureRequest.getAllotmentClsure().getAllotedApplicationNumber());
//		allotmentCriteria.setApplicationNumbers(applicationNumber);
////		allotmentCriteria.setTenantId(allotmentClsure.getTenantId());
//
//		AllotmentDetails alllAllotmentDetails = allotmentRepository.getAllotmentByApplicationNumber(allotmentCriteria).stream()
//				.findAny().orElse(null);
//		if (alllAllotmentDetails == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"Enter valid allotedApplicationNumber , please provide the allotedApplicationNumber information");
//		}else {
//			allotmentClsure.setAllotmentId(alllAllotmentDetails.getId());
//			allotmentClsure.setTenantId(alllAllotmentDetails.getTenantId());
//		}
//
//		if (allotmentClsure.getReasonForClosure() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"reason_for_closure can't be null or empty, please provide the CLSURE information");
//		}
//
//		if (allotmentClsure.getRefundAmount() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"refund_amount can't be null or empty, please provide the CLSURE information");
//		}
//		if (allotmentClsure.getNotesComments() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"notes_comments can't be null or empty, please provide the CLSURE information");
//		}
//		if (allotmentClsure.getAmountToBeDeducted() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"amount_to_be_deducted can't be null or empty, please provide the CLSURE information");
//		}
//
//	}
//
//	public void validateUpdateClsureRequest(ClsureRequest clsureRequest) {
//
//		AllotmentClsure allotmentClsure = clsureRequest.getAllotmentClsure();
//
//		if (clsureRequest.getAllotmentClsure() == null)
//			throw new CustomException("CLSURE INFO ERROR",
//					"CLSURE cannot be empty, please provide the CLSURE information");
//
//		if (clsureRequest.getAllotmentClsure().getId() == null)
//			throw new CustomException("CLSURE INFO ERROR",
//					"Closure's id can't be null or empty, please provide the CLSURE information");
//
//		ClosureCriteria clsureCriteria = new ClosureCriteria();
//		Set<String> ids = new HashSet<>();
//		ids.add(clsureRequest.getAllotmentClsure().getId());
//		clsureCriteria.setIds(ids);
//		clsureCriteria.setTenantId(allotmentClsure.getTenantId());
//
//		List<AllotmentClsure> allotmentClsure2 = clsureRepository.getClsureByIds(clsureCriteria);
//		if (allotmentClsure2.size() < 1)
//			throw new CustomException("CLSURE INFO ERROR",
//					"Enter valid closure's id , please provide the CLSURE information");
////
////		if (allotmentClsure.getTenantId() == null) {
////			throw new CustomException("CLSURE INFO ERROR",
////					"tenant_id can't be null or empty, please provide the CLSURE information");
////		}
//
//		if (allotmentClsure.getReasonForClosure() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"reason_for_closure can't be null or empty, please provide the CLSURE information");
//		}
//
//		if (allotmentClsure.getRefundAmount() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"refund_amount can't be null or empty, please provide the CLSURE information");
//		}
//		if (allotmentClsure.getNotesComments() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"notes_comments can't be null or empty, please provide the CLSURE information");
//		}
//		if (allotmentClsure.getAmountToBeDeducted() == null) {
//			throw new CustomException("CLSURE INFO ERROR",
//					"amount_to_be_deducted can't be null or empty, please provide the CLSURE information");
//		}
//	}
//
//	private void validateAndLoadPropertyData(AllotmentRequest clsureRequest, Map<String, String> errorMap) {
//		String propertyId = Optional.ofNullable(clsureRequest.getAllotment().getPropertyId()).orElse(null);
//		String tenantId = Optional.ofNullable(clsureRequest.getAllotment().getTenantId()).orElse(null);
//
//		MdmsCriteriaReq mdmsCriteriaReq = new MdmsCriteriaReq();
//		mdmsCriteriaReq.setRequestInfo(clsureRequest.getRequestInfo()); // from your context
//		MdmsCriteria mdmsCriteria = new MdmsCriteria();
//		mdmsCriteria.setTenantId(tenantId);
//		ModuleDetail moduleDetail = new ModuleDetail();
//		moduleDetail.setModuleName("rentAndLease");
//		MasterDetail masterDetail = new MasterDetail();
//		masterDetail.setName("RLProperty");
//		masterDetail.setFilter("$.[?(@.propertyId=='" + propertyId + "')]");
//		moduleDetail.setMasterDetails(Arrays.asList(masterDetail));
//		mdmsCriteria.setModuleDetails(Arrays.asList(moduleDetail));
//		mdmsCriteriaReq.setMdmsCriteria(mdmsCriteria);
//
//		String mdmsUrl = configs.getMdmsHost() + configs.getMdmsEndpoint();// "http://<mdms-host>/egov-mdms-service/v1/_search";
//		ResponseEntity<Map> response = restTemplate.postForEntity(mdmsUrl, mdmsCriteriaReq, Map.class);
//		Map<String, Object> body = response.getBody();
//
//		Map<String, Object> mdms = (Map<String, Object>) body.get("MdmsRes");
//		Map<String, Object> rentLease = (Map<String, Object>) mdms.get("rentAndLease");
//		List<Map<String, Object>> rlProps = (List<Map<String, Object>>) rentLease.get("RLProperty");
//		if (rlProps.isEmpty()) {
//			throw new CustomException("PROPERTY ID TENANT ID INFO ERROR",
//					"startDate cannot be wrong, please provide the valid propertyId and tenentId information");
//		}
//		if (!errorMap.isEmpty())
//			throw new CustomException(errorMap);
//	}
//}
