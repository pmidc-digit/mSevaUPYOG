package org.egov.garbagecollection.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.repository.GcDaoImpl;
import org.egov.garbagecollection.repository.ServiceRequestRepository;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.validator.ValidateProperty;
import org.egov.garbagecollection.web.models.*;
import org.egov.garbagecollection.workflow.WorkflowService;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;

@Service
@Slf4j
public class PdfFileStoreService {

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private GcServicesUtil gcServiceUtil;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private GCConfiguration config;

	@Autowired
	private GcDaoImpl waterDao;

	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private ValidateProperty validateProperty;

	String tenantIdReplacer = "$tenantId";
	String fileStoreIdsReplacer = "$.filestoreIds";
	String urlReplacer = "url";
	String requestInfoReplacer = "RequestInfo";
	String GarbageConnectionReplacer = "GcConnection";
	String fileStoreIdReplacer = "$fileStoreIds";
	String totalAmount = "totalAmount";
	String applicationFee = "applicationFee";
	String serviceFee = "serviceFee";
	String tax = "tax";
	String pdfTaxhead = "pdfTaxhead";
	String pdfApplicationKey = "$applicationkey";
	String sla = "sla";
	String slaDate = "slaDate";
	String sanctionLetterDate = "sanctionLetterDate";
	String tenantName = "tenantName";
	String service = "service";
	String propertyKey = "property";
	

	/**
	 * Get fileStore Id's
	 *
	 * @param garbageConnectionRequest WaterConnectionRequest Object
	 * @param property                 Property Object
	 * @param applicationKey           ApplicationKey
	 * @return file store id
	 */
	public String getFileStoreId(GarbageConnectionRequest garbageConnectionRequest, Property property, String applicationKey) {
		CalculationCriteria criteria = CalculationCriteria.builder().applicationNo(garbageConnectionRequest.getGarbageConnection().getApplicationNo())
				.garbageConnection(garbageConnectionRequest.getGarbageConnection()).tenantId(property.getTenantId()).build();
		CalculationReq calRequest = CalculationReq.builder().calculationCriteria(Arrays.asList(criteria))
				.requestInfo(garbageConnectionRequest.getRequestInfo()).isconnectionCalculation(false).isDisconnectionRequest(false).isReconnectionRequest(false).build();
		String applicationStatus = workflowService.getApplicationStatus(garbageConnectionRequest.getRequestInfo(),
				garbageConnectionRequest.getGarbageConnection().getApplicationNo(),
				garbageConnectionRequest.getGarbageConnection().getTenantId(),
				config.getBusinessServiceValue());
		try {
			Object response = serviceRequestRepository.fetchResult(gcServiceUtil.getEstimationURL(), calRequest);
			CalculationRes calResponse = mapper.convertValue(response, CalculationRes.class);
			JSONObject waterObject = mapper.convertValue(garbageConnectionRequest.getGarbageConnection(), JSONObject.class);
			if (CollectionUtils.isEmpty(calResponse.getCalculation())) {
				throw new CustomException("NO_ESTIMATION_FOUND", "Estimation not found!!!");
			}
			
			Optional<Calculation> calculationList = calResponse.getCalculation().stream().findFirst();
			if(calculationList.isPresent()) {
				Calculation cal = calculationList.get();
				waterObject.put(totalAmount, cal.getTotalAmount());
				waterObject.put(applicationFee, cal.getFee());
				waterObject.put(serviceFee, cal.getCharge());
				waterObject.put(tax, cal.getTaxAmount());
				cal.getTaxHeadEstimates().forEach(item -> {
					//We need to remove WS_ --> So that PDF configuration refers the common for both Water & Sewerage
					item.setTaxHeadCode(item.getTaxHeadCode().substring(3));
				});
				waterObject.put(pdfTaxhead, cal.getTaxHeadEstimates());
			}
			waterObject.put(sanctionLetterDate, System.currentTimeMillis());
			BigDecimal slaDays = workflowService.getSlaForState(garbageConnectionRequest.getGarbageConnection().getTenantId(), 
					garbageConnectionRequest.getRequestInfo(),applicationStatus, config.getBusinessServiceValue());
			waterObject.put(sla, slaDays.divide(BigDecimal.valueOf(GCConstants.DAYS_CONST)));
			waterObject.put(slaDate, slaDays.add(new BigDecimal(System.currentTimeMillis())));
			String[] tenantDetails = property.getTenantId().split("\\."); 
			String tenantId = tenantDetails[0];
			if(tenantDetails.length > 1)
			{
				waterObject.put(tenantName, tenantDetails[1].toUpperCase());
			}
			waterObject.put(propertyKey, property);
			waterObject.put(service, "WATER");
			return getFileStoreIdFromPDFService(waterObject, garbageConnectionRequest.getRequestInfo(), tenantId, applicationKey);
		} catch (Exception ex) {
			log.error("Calculation response error!!", ex);
			throw new CustomException("WATER_CALCULATION_EXCEPTION", "Calculation response can not parsed!!!");
		}
	}

	/**
	 * Get file store id from PDF service
	 * 
	 * @param waterObject WaterConnection Json Object
	 * @param requestInfo RequestInfo
	 * @param tenantId Tenant Id
	 * @param applicationKey Application Key String
	 * @return file store id
	 */
	private String getFileStoreIdFromPDFService(JSONObject waterObject, RequestInfo requestInfo, String tenantId,
												String applicationKey) {
		JSONArray waterConnectionList = new JSONArray();
		waterConnectionList.add(waterObject);
		JSONObject requestPayload = new JSONObject();
		requestPayload.put(requestInfoReplacer, requestInfo);
		requestPayload.put(GarbageConnectionReplacer, waterConnectionList);
		try {
			StringBuilder builder = new StringBuilder();
			builder.append(config.getPdfServiceHost());
			String pdfLink = config.getPdfServiceLink();
			pdfLink = pdfLink.replace(tenantIdReplacer, tenantId).replace(pdfApplicationKey, applicationKey);
			builder.append(pdfLink);
			Object response = serviceRequestRepository.fetchResult(builder, requestPayload);
			DocumentContext responseContext = JsonPath.parse(response);
			List<Object> fileStoreIds = responseContext.read("$.filestoreIds");
			if (CollectionUtils.isEmpty(fileStoreIds)) {
				throw new CustomException("EMPTY_FILESTORE_IDS_FROM_PDF_SERVICE",
						"NO file store id found from pdf service");
			}
			return fileStoreIds.get(0).toString();
		} catch (Exception ex) {
			throw new CustomException("WATER_FILESTORE_PDF_EXCEPTION", "PDF response can not parsed!!!");
		}
	}

	@SuppressWarnings("unchecked")
	public void process(GarbageConnectionRequest garbageConnectionRequest, String topic) {

		Property property = validateProperty.getOrValidateProperty(garbageConnectionRequest);

		HashMap<String, Object> addDetail = mapper
				.convertValue(garbageConnectionRequest.getGarbageConnection().getAdditionalDetails(), HashMap.class);
		if (garbageConnectionRequest.getGarbageConnection().getApplicationStatus()
				.equalsIgnoreCase(GCConstants.PENDING_APPROVAL_FOR_CONNECTION_CODE)) {
			addDetail.put(GCConstants.ESTIMATION_DATE_CONST, System.currentTimeMillis());
			garbageConnectionRequest.getGarbageConnection().setAdditionalDetails(addDetail);
			addDetail.put(GCConstants.ESTIMATION_FILESTORE_ID,
					getFileStoreId(garbageConnectionRequest, property, GCConstants.PDF_ESTIMATION_KEY));
		}
		if (garbageConnectionRequest.getGarbageConnection().getProcessInstance().getAction()
				.equalsIgnoreCase(GCConstants.ACTION_PAY)
				&& addDetail.getOrDefault(GCConstants.SANCTION_LETTER_FILESTORE_ID, null) == null) {
			addDetail.put(GCConstants.SANCTION_LETTER_FILESTORE_ID,
					getFileStoreId(garbageConnectionRequest, property, GCConstants.PDF_SANCTION_KEY));
		}
		garbageConnectionRequest.getGarbageConnection().setAdditionalDetails(addDetail);
		waterDao.saveFileStoreIds(garbageConnectionRequest);
	}
}
