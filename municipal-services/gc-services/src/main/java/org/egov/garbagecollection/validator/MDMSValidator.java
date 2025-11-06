package org.egov.garbagecollection.validator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.garbagecollection.web.models.GarbageConnection;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.repository.ServiceRequestRepository;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class MDMSValidator {
	@Autowired
	private GcServicesUtil gcServicesUtil;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsEndpoint;
    
	/**
	 * Validate Master data for given request
	 * 
	 * @param request
	 * @param reqType
	 */
	public void validateMasterData(GarbageConnectionRequest request, int reqType) {
		switch (reqType) {
			case GCConstants.UPDATE_APPLICATION:
				validateMasterDataForUpdateConnection(request);
				break;
			case GCConstants.MODIFY_CONNECTION:
				validateMasterDataForModifyConnection(request);
				break;
			case GCConstants.DISCONNECT_CONNECTION:
				validateMasterDataForDisconnection(request);
				break;
			default:
				break;
		}
	}
	private void validateMasterDataForDisconnection(GarbageConnectionRequest request) {
		if (request.getGarbageConnection().getProcessInstance().getAction()
				.equalsIgnoreCase(GCConstants.EXECUTE_DISCONNECTION)) {
			String jsonPath = GCConstants.JSONPATH_ROOT;
			String taxjsonPath = GCConstants.TAX_JSONPATH_ROOT;
			String tenantId = request.getGarbageConnection().getTenantId();
			List<String> names = new ArrayList<>(Arrays.asList(GCConstants.MDMS_WC_CONNECTION_TYPE,
					GCConstants.MDMS_WC_CONNECTION_CATEGORY, GCConstants.MDMS_WC_WATER_SOURCE));
			Map<String, List<String>> codes = getAttributeValues(tenantId, GCConstants.MDMS_WC_MOD_NAME, names,
					"$.*.code", jsonPath, request.getRequestInfo());
			List<String> taxModelnames = new ArrayList<>(Arrays.asList(GCConstants.WC_ROADTYPE_MASTER));
			Map<String, List<String>> codeFromCalculatorMaster = getAttributeValues(tenantId, GCConstants.WS_TAX_MODULE,
					taxModelnames, "$.*.code", taxjsonPath, request.getRequestInfo());
			// merge codes
			String[] finalmasterNames = {GCConstants.MDMS_WC_CONNECTION_TYPE, GCConstants.MDMS_WC_CONNECTION_CATEGORY,
					GCConstants.MDMS_WC_WATER_SOURCE, GCConstants.WC_ROADTYPE_MASTER};
			Map<String, List<String>> finalcodes = Stream.of(codes, codeFromCalculatorMaster).map(Map::entrySet)
					.flatMap(Collection::stream).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
			validateMDMSData(finalmasterNames, finalcodes);
			validateCodesForDisconnection(request.getGarbageConnection(), finalcodes);
		}
	}

	private void validateCodesForDisconnection(GarbageConnection garbageConnection, Map<String, List<String>> codes) {
		Map<String, String> errorMap = new HashMap<>();
		StringBuilder messageBuilder = new StringBuilder();
		if (!StringUtils.isEmpty(garbageConnection.getConnectionType())
				&& !codes.get(GCConstants.MDMS_WC_CONNECTION_TYPE).contains(garbageConnection.getConnectionType())) {
			messageBuilder = new StringBuilder();
			messageBuilder.append("Connection type value is invalid, please enter proper value! ");
			errorMap.put("INVALID_WATER_CONNECTION_TYPE", messageBuilder.toString());
		}
//		if (!StringUtils.isEmpty(garbageConnection.getWaterSource())
//				&& !codes.get(GCConstants.MDMS_WC_WATER_SOURCE).contains(garbageConnection.getWaterSource())) {
//			messageBuilder = new StringBuilder();
//			messageBuilder.append("Water Source / Water Sub Source value is invalid, please enter proper value! ");
//			errorMap.put("INVALID_WATER_CONNECTION_SOURCE", messageBuilder.toString());
//		}
		if (!errorMap.isEmpty())
			throw new CustomException(errorMap);
	}

	public void validateMasterDataForUpdateConnection(GarbageConnectionRequest request) {
		if (request.getGarbageConnection().getProcessInstance().getAction()
				.equalsIgnoreCase(GCConstants.ACTIVATE_CONNECTION_CONST)) {
			String jsonPath = GCConstants.JSONPATH_ROOT;
			String taxjsonPath = GCConstants.TAX_JSONPATH_ROOT;
			String tenantId = request.getGarbageConnection().getTenantId();
			List<String> names = new ArrayList<>(Arrays.asList(GCConstants.MDMS_WC_CONNECTION_TYPE,
					GCConstants.MDMS_WC_CONNECTION_CATEGORY, GCConstants.MDMS_WC_WATER_SOURCE));
			Map<String, List<String>> codes = getAttributeValues(tenantId, GCConstants.MDMS_WC_MOD_NAME, names,
					"$.*.code", jsonPath, request.getRequestInfo());
			List<String> taxModelnames = new ArrayList<>(Arrays.asList(GCConstants.WC_ROADTYPE_MASTER));
			Map<String, List<String>> codeFromCalculatorMaster = getAttributeValues(tenantId, GCConstants.WS_TAX_MODULE,
					taxModelnames, "$.*.code", taxjsonPath, request.getRequestInfo());

			// merge codes
			String[] finalmasterNames = {GCConstants.MDMS_WC_CONNECTION_TYPE, GCConstants.MDMS_WC_CONNECTION_CATEGORY,
					GCConstants.MDMS_WC_WATER_SOURCE, GCConstants.WC_ROADTYPE_MASTER};
			Map<String, List<String>> finalcodes = Stream.of(codes, codeFromCalculatorMaster).map(Map::entrySet)
					.flatMap(Collection::stream).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
			validateMDMSData(finalmasterNames, finalcodes);
			validateCodes(request.getGarbageConnection(), finalcodes);
		}
	}

	public Map<String, List<String>> getAttributeValues(String tenantId, String moduleName, List<String> names,
			String filter, String jsonPath, RequestInfo requestInfo) {
		StringBuilder uri = new StringBuilder(mdmsHost).append(mdmsEndpoint);
		MdmsCriteriaReq criteriaReq = gcServicesUtil.prepareMdMsRequest(tenantId, moduleName, names, filter,
				requestInfo);
		try {

			Object result = serviceRequestRepository.fetchResult(uri, criteriaReq);
			return JsonPath.read(result, jsonPath);
		} catch (Exception e) {
			throw new CustomException(GCConstants.INVALID_CONNECTION_TYPE, GCConstants.INVALID_CONNECTION_TYPE);
		}
	}
 


	private void validateMDMSData(String[] masterNames, Map<String, List<String>> codes) {
		Map<String, String> errorMap = new HashMap<>();
		for (String masterName : masterNames) {
			if (CollectionUtils.isEmpty(codes.get(masterName))) {
				errorMap.put("MDMS DATA ERROR ", "Unable to fetch " + masterName + " codes from MDMS");
			}
		}
		if (!errorMap.isEmpty())
			throw new CustomException(errorMap);
	}

	/**
	 * validateCodes will validate for given fields and return error map if codes
	 * are not matching
	 * 
	 * @param garbageConnection
	 *            GarbageConnection Object
	 * @param codes
	 *            List of codes
	 * @return error map for given fields
	 */
	@SuppressWarnings("unchecked")
	private void validateCodes(GarbageConnection garbageConnection, Map<String, List<String>> codes) {
		Map<String, String> errorMap = new HashMap<>();
		StringBuilder messageBuilder = new StringBuilder();
		if (!StringUtils.isEmpty(garbageConnection.getConnectionType())
				&& !codes.get(GCConstants.MDMS_WC_CONNECTION_TYPE).contains(garbageConnection.getConnectionType())) {
			messageBuilder = new StringBuilder();
			messageBuilder.append("Connection type value is invalid, please enter proper value! ");
			errorMap.put("INVALID_WATER_CONNECTION_TYPE", messageBuilder.toString());
		}
		
//		if (!StringUtils.isEmpty(garbageConnection.getWaterSource())
//				&& !codes.get(GCConstants.MDMS_WC_WATER_SOURCE).contains(garbageConnection.getWaterSource())) {
//			messageBuilder = new StringBuilder();
//			messageBuilder.append("Water Source / Water Sub Source value is invalid, please enter proper value! ");
//			errorMap.put("INVALID_WATER_CONNECTION_SOURCE", messageBuilder.toString());
//		}
		/*if (!StringUtils.isEmpty(waterConnection.getRoadType())
				&& !codes.get(GCConstants.WC_ROADTYPE_MASTER).contains(waterConnection.getRoadType())) {
			messageBuilder = new StringBuilder();
			messageBuilder.append("Road type value is invalid, please enter proper value! ");
			errorMap.put("INVALID_WATER_ROAD_TYPE", messageBuilder.toString());
		}*/
		Map<String, String> additionaldetails= new HashMap<String, String>();
		additionaldetails=(Map<String, String>) garbageConnection.getAdditionalDetails();
		String connectionCategory=additionaldetails.get("connectionCategory");
		String applicationType = garbageConnection.getApplicationType();
		if(!applicationType.equalsIgnoreCase("MODIFY_WATER_CONNECTION")) {
//			if (garbageConnection.getRoadCuttingInfo() == null
//			        && connectionCategory != null
//			        && !(connectionCategory.equalsIgnoreCase("REGULARIZED")
//			             || connectionCategory.equalsIgnoreCase("LEGACY"))) {
//			    errorMap.put("INVALID_ROAD_INFO", "Road Cutting Information should not be empty");
//			}

		}

//		if(garbageConnection.getRoadCuttingInfo() != null){
//			for(RoadCuttingInfo roadCuttingInfo : garbageConnection.getRoadCuttingInfo()){
//				if (!StringUtils.isEmpty(roadCuttingInfo.getRoadType())
//						&& !codes.get(GCConstants.WC_ROADTYPE_MASTER).contains(roadCuttingInfo.getRoadType())) {
//					messageBuilder = new StringBuilder();
//					messageBuilder.append("Road type value is invalid, please enter proper value! ");
//					errorMap.put("INVALID_WATER_ROAD_TYPE", messageBuilder.toString());
//				}
//			}
//		}
		if (!errorMap.isEmpty())
			throw new CustomException(errorMap);
	}

	/**
	 * Validate master data of water connection request
	 *
	 * @param request waterconnection request
	 */
	public void validateMasterForCreateRequest(GarbageConnectionRequest request) {
		// calling property related master
		List<String> propertyModuleMasters = new ArrayList<>(Arrays.asList(GCConstants.PROPERTY_OWNERTYPE));
		Map<String, List<String>> codesFromPropetyMasters = getAttributeValues(request.getGarbageConnection().getTenantId(),
				GCConstants.PROPERTY_MASTER_MODULE, propertyModuleMasters, "$.*.code",
				GCConstants.PROPERTY_JSONPATH_ROOT, request.getRequestInfo());
		// merge codes
		String[] finalmasterNames = {GCConstants.PROPERTY_OWNERTYPE};
		validateMDMSData(finalmasterNames, codesFromPropetyMasters);
		validateCodesForCreateRequest(request, codesFromPropetyMasters);
	}

	/**
	 *
	 * @param request Water connection request
	 * @param codes list of master data codes to varify against the water connection request
	 */
	public void validateCodesForCreateRequest(GarbageConnectionRequest request, Map<String, List<String>> codes) {
		Map<String, String> errorMap = new HashMap<>();
		if (!CollectionUtils.isEmpty(request.getGarbageConnection().getConnectionHolders())) {
			request.getGarbageConnection().getConnectionHolders().forEach(holderDetail -> {
				if (!StringUtils.isEmpty(holderDetail.getOwnerType())
						&& !codes.get(GCConstants.PROPERTY_OWNERTYPE).contains(holderDetail.getOwnerType())) {
					errorMap.put("INVALID_CONNECTION_HOLDER_TYPE",
							"The Connection holder type '" + holderDetail.getOwnerType() + "' does not exists");
				}
			});
		}

		if (!errorMap.isEmpty())
			throw new CustomException(errorMap);
	}
	
	public void validateMasterDataForModifyConnection(GarbageConnectionRequest request) {
		if (request.getGarbageConnection().getProcessInstance().getAction()
				.equalsIgnoreCase(GCConstants.APPROVE_CONNECTION)) {
			String jsonPath = GCConstants.JSONPATH_ROOT;
			String taxjsonPath = GCConstants.TAX_JSONPATH_ROOT;
			String tenantId = request.getGarbageConnection().getTenantId();
			List<String> names = new ArrayList<>(Arrays.asList(GCConstants.MDMS_WC_CONNECTION_TYPE,
					GCConstants.MDMS_WC_CONNECTION_CATEGORY, GCConstants.MDMS_WC_WATER_SOURCE));
			Map<String, List<String>> codes = getAttributeValues(tenantId, GCConstants.MDMS_WC_MOD_NAME, names,
					"$.*.code", jsonPath, request.getRequestInfo());
			List<String> taxModelnames = new ArrayList<>(Arrays.asList(GCConstants.WC_ROADTYPE_MASTER));
			Map<String, List<String>> codeFromCalculatorMaster = getAttributeValues(tenantId, GCConstants.WS_TAX_MODULE,
					taxModelnames, "$.*.code", taxjsonPath, request.getRequestInfo());
			// merge codes
			String[] finalmasterNames = {GCConstants.MDMS_WC_CONNECTION_TYPE, GCConstants.MDMS_WC_CONNECTION_CATEGORY,
					GCConstants.MDMS_WC_WATER_SOURCE, GCConstants.WC_ROADTYPE_MASTER};
			Map<String, List<String>> finalcodes = Stream.of(codes, codeFromCalculatorMaster).map(Map::entrySet)
					.flatMap(Collection::stream).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
			validateMDMSData(finalmasterNames, finalcodes);
			validateCodes(request.getGarbageConnection(), finalcodes);
		}
	}
}
