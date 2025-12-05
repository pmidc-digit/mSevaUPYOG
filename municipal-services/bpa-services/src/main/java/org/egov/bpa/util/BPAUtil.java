package org.egov.bpa.util;

import static org.egov.bpa.util.BPAConstants.BILL_AMOUNT;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

import com.jayway.jsonpath.JsonPath;
import org.egov.bpa.config.BPAConfiguration;
import org.egov.bpa.repository.ServiceRequestRepository;
import org.egov.bpa.web.model.AuditDetails;
import org.egov.bpa.web.model.BPA;
import org.egov.bpa.web.model.BPARequest;
import org.egov.bpa.web.model.RequestInfoWrapper;
import org.egov.common.contract.request.RequestInfo;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.tracer.model.CustomException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.Option;
import com.jayway.jsonpath.spi.json.JacksonJsonProvider;
import com.jayway.jsonpath.spi.json.JsonProvider;
import com.jayway.jsonpath.spi.mapper.JacksonMappingProvider;
import com.jayway.jsonpath.spi.mapper.MappingProvider;

@Component
public class BPAUtil {

	private BPAConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	public BPAUtil(BPAConfiguration config, ServiceRequestRepository serviceRequestRepository) {
		this.config = config;
		this.serviceRequestRepository = serviceRequestRepository;
	}

	/**
	 * Method to return auditDetails for create/update flows
	 *
	 * @param by
	 * @param isCreate
	 * @return AuditDetails
	 */
	public AuditDetails getAuditDetails(String by, Boolean isCreate) {
		Long time = System.currentTimeMillis();
		if (isCreate)
			return AuditDetails.builder().createdBy(by).lastModifiedBy(by).createdTime(time).lastModifiedTime(time)
					.build();
		else
			return AuditDetails.builder().lastModifiedBy(by).lastModifiedTime(time).build();
	}

	/**
	 * Returns the URL for MDMS search end point
	 *
	 * @return URL for MDMS search end point
	 */
	public StringBuilder getMdmsSearchUrl() {
		return new StringBuilder().append(config.getMdmsHost()).append(config.getMdmsEndPoint());
	}

	/**
	 * Creates request to search ApplicationType and etc from MDMS
	 * 
	 * @param requestInfo
	 *            The requestInfo of the request
	 * @param tenantId
	 *            The tenantId of the BPA
	 * @return request to search ApplicationType and etc from MDMS
	 */
	public List<ModuleDetail> getBPAModuleRequest() {

		// master details for BPA module
		List<MasterDetail> bpaMasterDtls = new ArrayList<>();

		// filter to only get code field from master data
		final String filterCode = "$.[?(@.active==true)].code";

		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.APPLICATION_TYPE).filter(filterCode).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.SERVICE_TYPE).filter(filterCode).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.DOCUMENT_TYPE_MAPPING).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.RISKTYPE_COMPUTATION).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.OCCUPANCY_TYPE).filter(filterCode).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.SUB_OCCUPANCY_TYPE).filter(filterCode).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.USAGES).filter(filterCode).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.CalculationType).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.CHECKLIST_NAME).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.NOC_TYPE_MAPPING).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.BUILDING_HEIGHT).build());
		bpaMasterDtls.add(MasterDetail.builder().name(BPAConstants.WORKFLOW_CONFIG).build());
		ModuleDetail bpaModuleDtls = ModuleDetail.builder().masterDetails(bpaMasterDtls)
				.moduleName(BPAConstants.BPA_MODULE).build();

		// master details for common-masters module
		List<MasterDetail> commonMasterDetails = new ArrayList<>();
		commonMasterDetails
				.add(MasterDetail.builder().name(BPAConstants.OWNERSHIP_CATEGORY).filter(filterCode).build());
		commonMasterDetails.add(MasterDetail.builder().name(BPAConstants.OWNER_TYPE).filter(filterCode).build());
		commonMasterDetails.add(MasterDetail.builder().name(BPAConstants.DOCUMENT_TYPE).filter(filterCode).build());
		ModuleDetail commonMasterMDtl = ModuleDetail.builder().masterDetails(commonMasterDetails)
				.moduleName(BPAConstants.COMMON_MASTERS_MODULE).build();
		
		// master details for NOC module
		List<MasterDetail> nocMasterDetails = new ArrayList<>();
		nocMasterDetails
				.add(MasterDetail.builder().name(BPAConstants.NOC_TYPE).build());
		ModuleDetail nocMDtl = ModuleDetail.builder().masterDetails(nocMasterDetails)
				.moduleName(BPAConstants.NOC_MODULE).build();
		
		//Tenant module for Ulb type 
		List<MasterDetail> tenantMasterDetails = new ArrayList<>();
		tenantMasterDetails
				.add(MasterDetail.builder().name(BPAConstants.TENANTS).build());
		ModuleDetail tenantMDtl = ModuleDetail.builder().masterDetails(tenantMasterDetails)
				.moduleName(BPAConstants.TENANT_MODULE).build();

		return Arrays.asList(bpaModuleDtls, commonMasterMDtl, nocMDtl, tenantMDtl);

	}

	/**
	 * prepares the mdms request object
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsCriteriaReq getMDMSRequest(RequestInfo requestInfo, String tenantId) {
		List<ModuleDetail> moduleRequest = getBPAModuleRequest();

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.addAll(moduleRequest);

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId).build();

		MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria).requestInfo(requestInfo)
				.build();
		return mdmsCriteriaReq;
	}

	/**
	 * makes mdms call with the given criteria and reutrn mdms data
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public Object mDMSCall(RequestInfo requestInfo, String tenantId) {
		MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequest(requestInfo, tenantId);
		Object result = serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
		return result;
	}
	
	/**
	 * json path's defuault cofig to read/parse the json
	 */
	public void defaultJsonPathConfig() {
		Configuration.setDefaults(new Configuration.Defaults() {

			private final JsonProvider jsonProvider = new JacksonJsonProvider();
			private final MappingProvider mappingProvider = new JacksonMappingProvider();

			@Override
			public JsonProvider jsonProvider() {
				return jsonProvider;
			}

			@Override
			public MappingProvider mappingProvider() {
				return mappingProvider;
			}

			@Override
			public Set<Option> options() {
				return EnumSet.noneOf(Option.class);
			}
		});
	}

	/**
	 * fetch the busniess servce of the current record
	 * @param applicationType
	 * @param serviceType
	 * @return
	 */
	public ArrayList<String> getBusinessService(String applicationType, String serviceType) {
		Map<String, Map<String, String>> appSrvTypeBussSrvCode = config.getAppSrvTypeBussSrvCode();
		String[] codes = null;
		Map<String, String> serviceTypeMap = appSrvTypeBussSrvCode.get(applicationType);
		if (!CollectionUtils.isEmpty(serviceTypeMap)) {
			if (serviceType != null) {
				String serviceCodes = serviceTypeMap.get(serviceType);
				codes = serviceCodes.split(",");
			} else {
				codes = (String[]) serviceTypeMap.values().toArray(new String[serviceTypeMap.size()]);
				codes = codes[0].toString().split(",");
			}
		}else{
			codes = new String[0];
		}
		return  new ArrayList<String>(Arrays.asList(codes));
	}

	/**
	 * Fetch the demand amount of the BPA
	 * @param bpaRequest
	 * @return
	 */
	public BigDecimal getDemandAmount(BPARequest bpaRequest) {
		BPA bpa = bpaRequest.getBPA();
		RequestInfo requestInfo = bpaRequest.getRequestInfo();
		LinkedHashMap responseMap = (LinkedHashMap) serviceRequestRepository.fetchResult(getBillUri(bpa),
				new RequestInfoWrapper(requestInfo));
		JSONObject jsonObject = new JSONObject(responseMap);
		double amount = 0.0;
		try {
			JSONArray demandArray = (JSONArray) jsonObject.get("Demands");
			if (demandArray != null && demandArray.length() > 0) {
				JSONObject firstElement = (JSONObject) demandArray.get(0);
				if (firstElement != null) {
					JSONArray demandDetails = (JSONArray) firstElement.get("demandDetails");
					if (demandDetails != null) {
						for (int i = 0; i < demandDetails.length(); i++) {
							JSONObject object = (JSONObject) demandDetails.get(i);
							Double taxAmt = Double.valueOf((object.get("taxAmount").toString()));
							amount = amount + taxAmt;
						}
					}
				}
			}
			return BigDecimal.valueOf(amount);
		} catch (Exception e) {
			throw new CustomException("PARSING ERROR", "Failed to parse the response using jsonPath: " + BILL_AMOUNT);
		}
	}

	/**
	 * gererate bill url with the query params
	 * @param bpa
	 * @return
	 */
	public StringBuilder getBillUri(BPA bpa) {
		String code = getFeeBusinessSrvCode(bpa);

		StringBuilder builder = new StringBuilder(config.getBillingHost());
		builder.append(config.getDemandSearchEndpoint());
		builder.append("?tenantId=");
		builder.append(bpa.getTenantId());
		builder.append("&consumerCode=");
		builder.append(bpa.getApplicationNo());
		builder.append("&businessService=");
		builder.append(code);
		return builder;
	}
	
	/**
	 * return the FeeBusiness Service code based on the BPA workflowCode, BPA Status
	 * @param bpa
	 * @return
	 */
	public String getFeeBusinessSrvCode(BPA bpa) {
		Map<String, Map<String, String>> wfStBSrvMap = config.getWorkflowStatusFeeBusinessSrvMap();
		String businessSrvCode = null;
		Map<String, String> statusBusSrvMap = wfStBSrvMap.get(bpa.getBusinessService());
		if (!CollectionUtils.isEmpty(statusBusSrvMap)) {
			if (bpa.getStatus() != null) {
				businessSrvCode = statusBusSrvMap.get(bpa.getStatus());
			} 
		}
		return businessSrvCode;
		
	}
	
	/**
	 * Returns the URL for Process Instances search for Auto Escalation end point
	 *
	 * @return URL for MDMS search end point
	 */
	public StringBuilder getAutoEscalationApplicationsURL(Map<String, Object> autoEscalationMdmsData) {
		StringBuilder uri = new StringBuilder(config.getWfHost());
		uri.append(config.getWfAutoEscalationPath());
		uri.append("?businessService=");
		uri.append(autoEscalationMdmsData.get("businessService"));
		uri.append("&moduleName=");
		uri.append(autoEscalationMdmsData.get("module"));
		uri.append("&sla=");
		uri.append(autoEscalationMdmsData.get("stateSLA").toString());
		uri.append("&startSlaState=");
		uri.append(autoEscalationMdmsData.get("startSlaState"));
		uri.append("&currentStates=");
		uri.append(autoEscalationMdmsData.get("state"));
		
		
		return uri;
	}
	
	/**
	 * prepares the mdms request object
	 * @param requestInfo
	 * @param tenantId
	 * @return
	 */
	public MdmsCriteriaReq getMDMSRequestForAutoEscalationData(RequestInfo requestInfo, String tenantId) {
		final String filterCode = "$.[?(@.active=='true' && @.module=='bpa-service' && @.businessService == 'BPA_LOW' )]";

		ModuleDetail bpaModuleDtls = ModuleDetail.builder()
				.masterDetails(Arrays.asList(MasterDetail.builder().name("AutoEscalation").filter(filterCode).build()))
				.moduleName("Workflow").build();
		List<ModuleDetail> moduleRequest = Arrays.asList(bpaModuleDtls);

		List<ModuleDetail> moduleDetails = new LinkedList<>();
		moduleDetails.addAll(moduleRequest);

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder().moduleDetails(moduleDetails).tenantId(tenantId).build();

		MdmsCriteriaReq mdmsCriteriaReq = MdmsCriteriaReq.builder().mdmsCriteria(mdmsCriteria).requestInfo(requestInfo)
				.build();
		return mdmsCriteriaReq;
	}


	public MdmsCriteriaReq getMDMSRequestForHolidays(RequestInfo requestInfo, String tenantId, List<Integer> years) {
		String filter = buildYearFilter(years);

		ModuleDetail holidaysModule = ModuleDetail.builder()
				.moduleName("common-masters")
				.masterDetails(Arrays.asList(
						MasterDetail.builder()
								.name("Holidays")
								.filter(filter)
								.build()))
				.build();

		MdmsCriteria mdmsCriteria = MdmsCriteria.builder()
				.moduleDetails(Arrays.asList(holidaysModule))
				.tenantId(tenantId)
				.build();

		return MdmsCriteriaReq.builder()
				.mdmsCriteria(mdmsCriteria)
				.requestInfo(requestInfo)
				.build();
	}


	/**
	 * Build the JSONPath filter for multiple years.
	 */
	private String buildYearFilter(List<Integer> years) {
		if (CollectionUtils.isEmpty(years)) {
			return "$.*";
		}
		String joined = years.stream()
				.map(y -> "@.year==" + y)
				.collect(Collectors.joining(" || "));
		// Note the dot after $ to filter top-level master list
		return "$.[?(" + joined + ")]";
	}

	/**
	 * Makes MDMS call for Holidays for the given years.
	 */
	public Object mDMSCallForHolidays(RequestInfo requestInfo, String tenantId, List<Integer> years) {
		MdmsCriteriaReq mdmsCriteriaReq = getMDMSRequestForHolidays(requestInfo, tenantId, years);
		return serviceRequestRepository.fetchResult(getMdmsSearchUrl(), mdmsCriteriaReq);
	}

	// ---------------------------------------------------------------------
	// Parsing utilities – build a year->month->days map from MdmsRes
	// ---------------------------------------------------------------------

	/**
	 * Builds a lookup map: year -> month (1..12) -> List<day>.
	 * Uses JSONPath over MdmsRes to extract common-masters/Holidays entries.
	 */
	@SuppressWarnings("unchecked")
	public Map<Integer, Map<Integer, List<Integer>>> toYearMonthDaysMap(Object mdmsRes) {
		defaultJsonPathConfig();
		Map<Integer, Map<Integer, List<Integer>>> yearMonthDays = new HashMap<>();

		List<Map<String, Object>> entries = JsonPath.read(mdmsRes, "$.MdmsRes['common-masters']['Holidays']");
		if (entries == null) return yearMonthDays;

		for (Map<String, Object> entry : entries) {
			Integer year = (Integer) entry.get("year");
			if (year == null) continue;

			List<Map<String, Object>> months = (List<Map<String, Object>>) entry.get("months");
			Map<Integer, List<Integer>> monthToDays = yearMonthDays.computeIfAbsent(year, k -> new HashMap<>());

			if (months != null) {
				for (Map<String, Object> m : months) {
					Integer monthNum = (Integer) m.get("month"); // 1..12
					if (monthNum == null) continue;
					List<Integer> days = (List<Integer>) m.get("holidays");
					monthToDays.put(monthNum, (days != null) ? days : Collections.emptyList());
				}
			}
		}
		return yearMonthDays;
	}

	/**
	 * Converts stored day integers to a Set<LocalDate> for a given YearMonth.
	 * Invalid day values (e.g., 31 in a 30-day month) are ignored defensively.
	 */
	public Set<LocalDate> toLocalDateSet(YearMonth ym, Map<Integer, Map<Integer, List<Integer>>> yearMonthDays) {
		List<Integer> days = yearMonthDays
				.getOrDefault(ym.getYear(), Collections.emptyMap())
				.getOrDefault(ym.getMonthValue(), Collections.emptyList());

		if (days.isEmpty()) return Collections.emptySet();

		Set<LocalDate> out = new LinkedHashSet<>();
		int max = ym.lengthOfMonth();
		for (Integer d : days) {
			if (d != null && d >= 1 && d <= max) {
				out.add(LocalDate.of(ym.getYear(), ym.getMonthValue(), d));
			}
		}
		return out;
	}

	// ---------------------------------------------------------------------
	// Core API – return holiday dates as Set<LocalDate> for prev/current/next
	// ---------------------------------------------------------------------

	/**
	 * Given an anchor date, returns a map of YearMonth -> Set<LocalDate>
	 * for the previous month, current month, and next month.
	 *
	 * Example keys: { 2025-11, 2025-12, 2026-01 }
	 */
	public Map<YearMonth, Set<LocalDate>> getHolidayDateSetsForMonthWindow(RequestInfo requestInfo,
																		   String tenantId,
																		   LocalDate anchorDate) {
		YearMonth currentYM = YearMonth.from(anchorDate);
		YearMonth prevYM = currentYM.minusMonths(1);
		YearMonth nextYM = currentYM.plusMonths(1);

		// Fetch all distinct years needed in one MDMS call
		Set<Integer> yearsToFetch = new HashSet<>(Arrays.asList(prevYM.getYear(), currentYM.getYear(), nextYM.getYear()));
		Object mdmsRes = mDMSCallForHolidays(requestInfo, tenantId, new ArrayList<>(yearsToFetch));

		// Build lookup and convert to LocalDate sets
		Map<Integer, Map<Integer, List<Integer>>> ymd = toYearMonthDaysMap(mdmsRes);

		Map<YearMonth, Set<LocalDate>> result = new LinkedHashMap<>();
		result.put(prevYM, toLocalDateSet(prevYM, ymd));
		result.put(currentYM, toLocalDateSet(currentYM, ymd));
		result.put(nextYM, toLocalDateSet(nextYM, ymd));
		return result;
	}

	/**
	 * Convenience overload accepting dd-MM-yyyy string.
	 */
	public Map<YearMonth, Set<LocalDate>> getHolidayDateSetsForMonthWindow(RequestInfo requestInfo,
																		   String tenantId,
																		   String ddMMyyyy) {
		String[] p = ddMMyyyy.split("-");
		int day = Integer.parseInt(p[0]);
		int month = Integer.parseInt(p[1]);
		int year = Integer.parseInt(p[2]);
		LocalDate anchor = LocalDate.of(year, month, day);
		return getHolidayDateSetsForMonthWindow(requestInfo, tenantId, anchor);
	}

	/**
	 * Returns a single merged Set<LocalDate> for previous+current+next month.
	 * (If you prefer one collection instead of a map by month.)
	 */
	public Set<LocalDate> getMergedHolidayDateSetForMonthWindow(RequestInfo requestInfo,
																String tenantId,
																LocalDate anchorDate) {
		Map<YearMonth, Set<LocalDate>> byMonth = getHolidayDateSetsForMonthWindow(requestInfo, tenantId, anchorDate);
		Set<LocalDate> merged = new LinkedHashSet<>();
		byMonth.values().forEach(merged::addAll);
		return merged;
	}

	public Set<LocalDate> getMergedHolidayDateSetForMonthWindow(RequestInfo requestInfo,
																String tenantId,
																String ddMMyyyy) {
		Map<YearMonth, Set<LocalDate>> byMonth = getHolidayDateSetsForMonthWindow(requestInfo, tenantId, ddMMyyyy);
		Set<LocalDate> merged = new LinkedHashSet<>();
		byMonth.values().forEach(merged::addAll);
		return merged;
	}

	// ---------------------------------------------------------------------
	// Bonus helpers – check single date or build nested filter MDMS request
	// ---------------------------------------------------------------------

	/**
	 * Returns true if a given date exists in Holidays (year-month-day present).
	 * Uses year-only MDMS filter and validates in code.
	 */
	public boolean isHoliday(RequestInfo requestInfo, String tenantId, String ddMMyyyy) {
		String[] p = ddMMyyyy.split("-");
		int day = Integer.parseInt(p[0]);
		int month = Integer.parseInt(p[1]);
		int year = Integer.parseInt(p[2]);

		Object mdmsRes = mDMSCallForHolidays(requestInfo, tenantId, Arrays.asList(year));

		defaultJsonPathConfig();
		List<Integer> days = JsonPath.read(mdmsRes,
				"$.MdmsRes['common-masters']['Holidays'][?(@.year==" + year + ")].months[?(@.month==" + month + ")].holidays[?(@==" + day + ")]"
		);
		return days != null && !days.isEmpty();
	}


}
