package org.egov.pgr.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pgr.contract.ServiceRequest;
import org.egov.pgr.model.user.UserResponse;
import org.egov.pgr.producer.PGRProducer;
import org.egov.pgr.service.GrievanceService;
import org.egov.pgr.utils.PGRConstants;
import org.egov.pgr.utils.ReportUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.egov.pgr.contract.Address;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;
import java.util.stream.Collectors;

/**
 * DgrIntegration - integrates with DGR & grievance APIs.
 * Kept original flow intact; cleaned and formatted.
 */
@Service
@Slf4j
public class DgrIntegration {

	@Value("${dgr.host}")
    public String DGR_HOST;

    @Value("${dgr.g2g.host}")
    public String DGR_G2G_HOST;
    
    @Value("${kafka.topic.store.dgr.complaint.id}")
    public String drgPgrId;

    @Value("${kafka.topic.store.failed.topic}")
    public String failedDgrTopic;


    // URLs
    @Value("${dgr.token.url}")
    public String TOKEN_URL;

    @Value("${dgr.create.grievance.url}")
    public String CREATE_GRIEVANCE_URL;

    @Value("${dgr.district.list.url}")
    public String DISTRICT_LIST_URL;

    @Value("${dgr.tehsil.by.district.url}")
    public String TEHSIL_BY_DISTRICT_URL;

    @Value("${dgr.village.by.tehsil.url}")
    public String VILLAGE_BY_TEHSIL_URL;

    @Value("${dgr.municipality.by.tehsil.url}")
    public String MUNICIPALITY_BY_TEHSIL_URL;

    // Token Keys
    @Value("${dgr.token.access.key}")
    public String TOKEN_ACCESS_KEY;

    @Value("${dgr.token.public.key}")
    public String TOKEN_PUBLIC_KEY;
    
    
    @Autowired
    private GrievanceService grievanceService;

    @Autowired
    private ReportUtils reportUtils;

    @Autowired
    private PGRConstants constants;
    
	@Autowired
	private PGRProducer pGRProducer;


    /* =========================
       Kafka Listener
       ========================= */
    @KafkaListener(topics = {"${kafka.topics.save.dgr.service}"})
    public void listen(final HashMap<String, Object> record,
                       @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

        String tokenResponse = generateLoginToken();
        log.info("Generated Token: {}", tokenResponse);
        if (tokenResponse == null || tokenResponse.trim().isEmpty() 
                || "Invalid credentials!".equalsIgnoreCase(tokenResponse.trim())) {            log.error("Failed to generate token. Aborting DGR grievance creation.");
            return;
        }
        log.info("Token API Response: {}", tokenResponse);

        ObjectMapper mapper = new ObjectMapper();
        ServiceRequest serviceReqRequest = new ServiceRequest();

        try {
            serviceReqRequest = mapper.convertValue(record, ServiceRequest.class);

            Map<String, Object> reqInfoMap = (Map<String, Object>) record.get("RequestInfo");
            RequestInfo requestInfo = mapper.convertValue(reqInfoMap, RequestInfo.class);

            List<Map<String, Object>> services = (List<Map<String, Object>>) record.get("services");
            String tenantId = (String) services.get(0).get("tenantId");
            
            Map<String, Object> userInfo = (Map<String, Object>) reqInfoMap.get("userInfo");
            Long userId = Long.valueOf(userInfo.get("id").toString());
            List<Long> userIds = Collections.singletonList(userId);

            UserResponse userResponse = grievanceService.getUsers(requestInfo, tenantId, userIds);

            String grievanceResponse = createGrievance(serviceReqRequest, tokenResponse, userResponse);

            log.info("UserResponse = {}", userResponse);
            log.info("CreateGrievance Response = {}", grievanceResponse);

        } catch (Exception ex) {
            ex.printStackTrace();
            log.error("Error converting record: {}", ex.getMessage());
        }
    }

    /* =========================
       Token generation
       ========================= */

    public String generateLoginToken() {
        try {
            String url = TOKEN_URL;
            log.info("Generating login token. URL: {}", url);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("Access_Key", TOKEN_ACCESS_KEY);
            requestBody.put("Public_Key", TOKEN_PUBLIC_KEY);
            log.info("Token request body: {}", requestBody);
            log.info("Access Key: {}", TOKEN_ACCESS_KEY);
            log.info("Public_Key Key: {}", TOKEN_PUBLIC_KEY);
            log.debug("Token request body prepared");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            RestTemplate restTemplate = new RestTemplate();
            log.info("Calling token API");

            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            log.info("Token API response status: {}", response.getStatusCode());
            log.info("Token API response body: {}", response.getBody());

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> json = mapper.readValue(response.getBody(), Map.class);

            String token = (String) json.get("sys_message");
            log.info("Login token generated successfully");

            return token;

        } catch (Exception ex) {
            log.error("Error while generating login token", ex);
            return null;
        }
    }


    /* =========================
       Main createGrievance flow (unchanged)
       ========================= */
    public String createGrievance(ServiceRequest serviceReqRequest, String bearerToken, UserResponse userResponse) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = CREATE_GRIEVANCE_URL;

            // 1. Get district list from DGR API
            List<Map<String, Object>> districtList = fetchDataFromApi(DISTRICT_LIST_URL);

            // 2. Tenant ids for MDMS calls
            List<String> tenantIds = Collections.singletonList(serviceReqRequest.getServices().get(0).getTenantId());
            String tenantId = serviceReqRequest.getServices().get(0).getTenantId();
            String rawName = tenantId.substring(tenantId.lastIndexOf('.') + 1);
            String tehsilSearchName = rawName.substring(0, 1).toUpperCase() + rawName.substring(1).toLowerCase();

            // 3. Get mseva district name from tenant MDMS
            Object msevaDistrictByTenantid = reportUtils.getDisrict(
                    serviceReqRequest.getRequestInfo(),
                    PGRConstants.MDMS_TENANTS_MASTERS_MASTER_NAME,
                    tenantIds,
                    "pb"
            );
         // 1. Get district from tenant MDMS (KEEP THIS)
            String districtName = JsonPath.read(
                msevaDistrictByTenantid,
                "$.MdmsRes.tenant.tenants[0].city.districtName"
            );

//            // 2. Match it in mapping JSON
//            String districtName = JsonPath.read(
//                msevaDistrictByTenantid,
//                "$.thirdpartydistrictmapping[0].districts[?(@.msevaname=='"
//                + msevaDistrict + "')].msevaname[0]"
//            );


            // 4. Get third-party mapping from MDMS
            Object thirdyPartyDistrictName = reportUtils.getDisrict(
                    serviceReqRequest.getRequestInfo(),
                    PGRConstants.MDMS_THIRD_PART_MASTERS_MASTER_NAME,
                    tenantIds,
                    "pb"
            );

            // 5. Get categories list from MDMS
            Object categoryList = reportUtils.getDisrict(
                    serviceReqRequest.getRequestInfo(),
                    PGRConstants.MDMS_DISTRICT_CATEGORY_MASTER_NAME,
                    tenantIds,
                    "pb"
            );

            // 6. Extract Address from ServiceRequest
            Address addr = serviceReqRequest.getServices().get(0).getAddressDetail();
            String houseNo = (addr != null && addr.getHouseNoAndStreetName() != null) ? addr.getHouseNoAndStreetName() : "";
            String city = (addr != null && addr.getCity() != null) ? addr.getCity() : "";
            String landmark = (addr != null && addr.getLandmark() != null) ? addr.getLandmark() : "";

            // 7. Extract Mohalla codes into a List<String>
            List<String> mohallaCodes = new ArrayList<>();
            if (addr != null && addr.getMohalla() != null && !addr.getMohalla().isEmpty()) {
                String[] codes = addr.getMohalla().split(",");
                for (String code : codes) {
                    mohallaCodes.add(code.trim());
                }
            }

            // 8. Get mohalla names from grievanceService
            Map<String, String> mohallaMap = grievanceService.getMohallNames(
                    serviceReqRequest.getRequestInfo(),
                    addr.getTenantId(),
                    mohallaCodes,
                    PGRConstants.LOCATION__BOUNDARY_HIERARCHYTYPE_ADMIN,
                    PGRConstants.LOCATION__BOUNDARY_BOUNDARYTYPE_LOCALITY
            );

            // 9. Build mohalla name string (comma separated if multiple)
            String mohallaName = mohallaCodes.stream()
                    .map(code -> mohallaMap.getOrDefault(code, code)) // fallback to code if not found
                    .collect(Collectors.joining(", "));

            // 10. Build full address
            String fullAddress =
                    (houseNo.isEmpty() ? "" : "House Number: " + houseNo + ", ") +
                    (mohallaName.isEmpty() ? "" : "Mohalla: " + mohallaName + ", ") +
                    (tehsilSearchName.isEmpty() ? "" : "City: " + tehsilSearchName) +
                    (landmark.isEmpty() ? "" : ", Landmark: " + landmark);

            // Fallback if everything is empty
            if (fullAddress.trim().isEmpty()) {
                fullAddress = constants.DEFAULT_ADDRESS;
            }

            // 11. Extract category & sub-category IDs
            Map<String, String> catSubCat = mapServiceCodeToCategory(serviceReqRequest.getServices().get(0).getServiceCode(), categoryList);

            // 12. Map district
            List<Map<String, Object>> districts = JsonPath.read(
                    thirdyPartyDistrictName,
                    "$.MdmsRes.tenant.thirdpartydistrictmapping[0].districts"
            );

            
            String mohallaCode = mohallaCodes.stream()
                    .collect(Collectors.joining(", "));

            String dgrName = districts.stream()
                    .filter(dist -> districtName.trim().equalsIgnoreCase(String.valueOf(dist.get("msevaname")).trim()))
                    .map(dist -> String.valueOf(dist.get("thirdpartyname")))
                    .findFirst()
                    .orElseGet(() -> {

                        if (districtList == null || districtList.isEmpty()) {
                            return ""; 
                        }

                        Object fallback = districtList.get(0).get("District_Name");

                        return fallback != null ? fallback.toString().trim() : "";
                    });

            Map<String, Object> finalDistrict = districtList.stream()
                    .filter(d -> String.valueOf(d.get("District_Name")).trim().equalsIgnoreCase(dgrName.trim()))
                    .findFirst()
                    .orElse(districtList.get(0)); // fallback to 0th district

            String districtId = String.valueOf(finalDistrict.get("District_ID"));
            String districtNameGgr = String.valueOf(finalDistrict.get("District_Name"));
            String stateId = String.valueOf(finalDistrict.get("State_ID"));

            // 13. Get tehsils by district id
            List<Map<String, Object>> tehsilList = fetchDataFromApi(TEHSIL_BY_DISTRICT_URL + districtId);

            Map<String, Object> matchedTehsil = tehsilList.stream()
                    .filter(t -> String.valueOf(t.get("Tehsil_Name")).toLowerCase().contains(tehsilSearchName.toLowerCase()))
                    .findFirst()
                    .orElse(tehsilList.get(0)); // fallback to 0th tehsil

            String tehsilId = String.valueOf(matchedTehsil.get("Respective_GOI_LGD_Code"));
            String tehsilName = String.valueOf(matchedTehsil.get("Tehsil_Name"));
            String tehsilNameLocal = String.valueOf(matchedTehsil.get("Tehsil_Name_Local_language"));

            // 14. Get first village by tehsil
            List<Map<String, Object>> villageList = fetchDataFromApi(VILLAGE_BY_TEHSIL_URL + tehsilId);
            Map<String, Object> firstVillage = (villageList != null && !villageList.isEmpty()) ? villageList.get(0) : Collections.emptyMap();
            String villageId = firstVillage.get("Respective_GOI_LGD_Code") != null ? String.valueOf(firstVillage.get("Village_ID")) : "0";
            String villageName = firstVillage.get("Village_Name") != null ? String.valueOf(firstVillage.get("Village_Name")) : "";
            String villageNameLocal = firstVillage.get("Village_Name_Local_Lang") != null ? String.valueOf(firstVillage.get("Village_Name_Local_Lang")) : "";

            // 15. Get first municipality by tehsil
            List<Map<String, Object>> municipalityList =
                    fetchDataFromApi(MUNICIPALITY_BY_TEHSIL_URL + tehsilId);

            Map<String, Object> selectedMunicipality = Collections.emptyMap();

            if (municipalityList != null && !municipalityList.isEmpty()) {

                // Try to find by matching name
                selectedMunicipality = municipalityList.stream()
                        .filter(m -> tehsilSearchName.equalsIgnoreCase(
                                safeString(m.get("Municipality_Name"))
                        ))
                        .findFirst()
                        .orElse(municipalityList.get(0));   // fallback to 0th
            }

            String municipalityId = safeString(selectedMunicipality.get("Respective_GOI_LGD_Code"), "0");
            String municipalityName = safeString(selectedMunicipality.get("Municipality_Name"));
            String municipalityNameLocal = safeString(selectedMunicipality.get("Municipality_Name_Local_Lang"));
            org.egov.pgr.model.Service pgrService =
                    serviceReqRequest.getServices().get(0);

            // Name
         // Name
            String citizenName = safeValue(
                    pgrService.getFirstName(), // old structure
                    pgrService.getCitizen() != null ? pgrService.getCitizen().getName() : null, // new JSON
                    userResponse != null && userResponse.getUser() != null && !userResponse.getUser().isEmpty()
                            ? userResponse.getUser().get(0).getName() : null, // fallback from userResponse
                    constants.DEFAULT_CITIZEN_NAME // final default
            );

            // Email
            String citizenEmail = safeValue(
                    pgrService.getEmail(),
                    pgrService.getCitizen() != null ? pgrService.getCitizen().getEmailId() : null,
                    userResponse != null && userResponse.getUser() != null && !userResponse.getUser().isEmpty()
                            ? userResponse.getUser().get(0).getEmailId() : null,
                    constants.DEFAULT_CITIZEN_EMAIL
            );

            // Mobile
            String citizenMobile = safeValue(
                    pgrService.getPhone(),
                    pgrService.getCitizen() != null ? pgrService.getCitizen().getMobileNumber() : null,
                    userResponse != null && userResponse.getUser() != null && !userResponse.getUser().isEmpty()
                            ? userResponse.getUser().get(0).getMobileNumber() : null,
                    constants.DEFAULT_CITIZEN_MOBILE
            );





            // 16. Prepare payload
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("Citizen_Name", citizenName);
            requestBody.put("Citizen_Email", citizenEmail);
            requestBody.put("Citizen_Mobile_No", citizenMobile);
            requestBody.put("Citizen_Address", fullAddress);

            requestBody.put("Citizen_District_ID", districtId);
            requestBody.put("Citizen_Tehsil_ID", tehsilId);
            requestBody.put("Citizen_Village_ID", villageId);
            requestBody.put("Citizen_Municipality_ID", municipalityId);
            requestBody.put("Citizen_District", districtNameGgr);
            requestBody.put("Citizen_Tehsil", tehsilName);
            requestBody.put("Citizen_Village", villageName);
            requestBody.put("Citizen_Municipality", municipalityName);
            requestBody.put("Citizen_State", constants.STATE_NAME);
            requestBody.put("Citizen_State_ID", stateId);
            requestBody.put("Referrence_ID", serviceReqRequest.getServices().get(0).getServiceRequestId());

            requestBody.put("Application_Department", constants.DEPARTMENT_ID);
            requestBody.put("locationtype", "2");
            requestBody.put("Application_District", districtId);
            requestBody.put("Application_District_Name", districtNameGgr);
            requestBody.put("Category_ID",
                    catSubCat.get("Category_ID") != null && !catSubCat.get("Category_ID").toString().trim().isEmpty()
                            ? catSubCat.get("Category_ID").toString()
                            : "0");

            requestBody.put("Sub_Category_ID",
                    catSubCat.get("Sub_Category_ID") != null && !catSubCat.get("Sub_Category_ID").toString().trim().isEmpty()
                            ? catSubCat.get("Sub_Category_ID").toString()
                            : "0");

            requestBody.put("Application_Title", safeValue(serviceReqRequest.getServices().get(0).getDescription(), constants.DEFAULT_CITIZEN_NAME));
            requestBody.put("Application_Description", safeValue(serviceReqRequest.getServices().get(0).getDescription(), constants.DEFAULT_CITIZEN_NAME));
            requestBody.put("Application_Department_Name", constants.DEPARTMENT_NAME);
            requestBody.put("reopen", true);
            requestBody.put("Citizen_Type", constants.CITIZEN_TYPE);
            requestBody.put("Citizen_Company_Name", "");
            requestBody.put("Citizen_Company_Designation_Name", "");
            requestBody.put("Flow_Type", constants.FLOW_TYPE);
            requestBody.put("System_type", constants.SYSTEM_TYPE);
            requestBody.put("Service_Code", constants.SERVICE_CODE_DEFAULT);
            requestBody.put("Selected_Locale", constants.SELECTED_LOCALE);
            requestBody.put("doc", new ArrayList<>());
            requestBody.put("Town_ID", 0);
            requestBody.put("Previous_Grievance", 0);
            requestBody.put("Town_Name",tehsilSearchName);
            requestBody.put("Locality_Code", mohallaCode);
            requestBody.put("Locality_Name", mohallaName);
            requestBody.put("Citizen_State_Local_Lang", constants.STATE_LOCAL_LANG);
            requestBody.put("Citizen_District_Local_Lang", districtNameGgr);
            requestBody.put("Citizen_Tehsil_Local_Lang", tehsilNameLocal);
            requestBody.put("Citizen_Village_Local_Lang", villageNameLocal);
            requestBody.put("Citizen_Town_Local_Lang", "");
            requestBody.put("Application_Department_Local_Lang", constants.DEPARTMENT_LOCAL_LANG);
            requestBody.put("Application_District_Local_Lang", districtNameGgr);
            requestBody.put("Citizen_EA_User_ID", "933838");

            log.info("District ID: {}", districtId);
            log.info("Tehsil ID: {}", tehsilId);
            log.info("Village ID: {}", villageId);
            log.info("Municipality ID: {}", municipalityId);
            log.info("Category ID: {}", catSubCat.get("Category_ID"));
            log.info("Sub-Category ID: {}", catSubCat.get("Sub_Category_ID"));

            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("serviceRequest", serviceReqRequest);
            eventPayload.put("timestamp", System.currentTimeMillis());
            // 17. Call CreateGrievance API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + bearerToken);
            headers.set("Accept", "application/json, text/plain, */*");
            headers.set("Accept-Language", "en-US,en;q=0.9");

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            String responseBody;

            try {
                ResponseEntity<String> response =
                        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
                responseBody = response.getBody();

            } catch (Exception ex) {

                log.error("Error calling CreateGrievance API", ex);

                Map<String, Object> failedPayload = new HashMap<>();
                failedPayload.put("serviceRequest", serviceReqRequest);
                failedPayload.put("error", ex.getMessage());
                failedPayload.put("status", "FAILED");

                pGRProducer.push(failedDgrTopic,serviceReqRequest.getServices().get(0).getServiceRequestId(), failedPayload);

                return "Error calling CreateGrievance API: " + ex.getMessage();
            }

            String grievanceId = null;
            try {
                grievanceId = JsonPath.read(responseBody, "$.data[0].Grievance_id");
            } catch (Exception e) {
                log.error("Grievance_id not found in response");
            }

            if (grievanceId != null && !grievanceId.trim().isEmpty()) {

                log.info("DGR Grievance ID: {}", grievanceId);

                serviceReqRequest.getServices().get(0).setDgrPgrId(grievanceId);


                pGRProducer.push(drgPgrId, grievanceId,serviceReqRequest);

            } else {

                log.error("DGR Grievance ID missing. Response: {}", responseBody);

                Map<String, Object> failedPayload = new HashMap<>();
                failedPayload.put("serviceRequest", serviceReqRequest);
                failedPayload.put("dgrResponse", responseBody);
                failedPayload.put("error", "DGR_GRIEVANCE_ID_MISSING");
                failedPayload.put("status", "FAILED");

                pGRProducer.push(failedDgrTopic,serviceReqRequest.getServices().get(0).getServiceRequestId(), failedPayload);
            }
		
            return responseBody;
        }
        finally {
            log.info("CreateGrievance API call completed");
        }
    }
    // Helper method for safe value
    private String safeValue(String defaultVal, String... values) {
        if (values != null) {
            for (String v : values) {
                if (v != null && !v.trim().isEmpty()) {
                    return v;
                }
            }
        }
        return defaultVal;
    }
    /* =========================
       Helper APIs
       ========================= */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchDataFromApi(String url) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json, text/plain, */*");
            headers.set("Content-Type", "application/json");

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) return null;

            // Most of your APIs return { "data": [ ... ] }
            return (List<Map<String, Object>>) responseBody.get("data");

        } catch (Exception e) {
            log.info("Error fetching data from API [{}]: {}", url, e.getMessage());
            return null;
        }
    }

    public Map<String, String> mapServiceCodeToCategory(String serviceCode, Object categoryList) {
        Map<String, String> result = new HashMap<>();
        String normalizedCode = serviceCode.replaceAll("\\s+", "").toLowerCase();

        List<Map<String, Object>> categories = JsonPath.read(
                categoryList, "$.MdmsRes.tenant.dgrIntegration[0].categories"
        );

        for (Map<String, Object> category : categories) {
            List<Map<String, Object>> subcategories = (List<Map<String, Object>>) category.get("subcategories");
            for (Map<String, Object> sub : subcategories) {
                String label = String.valueOf(sub.get("label")).replaceAll("\\s+", "").toLowerCase();
                if (label.equals(normalizedCode)) {
                    result.put("Category_ID", String.valueOf(category.get("Category_ID")));
                    result.put("Sub_Category_ID", String.valueOf(sub.get("id")));
                    return result;
                }
            }
        }
        // default if not found
        result.put("Category_ID", "0");
        result.put("Sub_Category_ID", "0");
        return result;
    }
    
    private String safeString(Object obj) {
        return obj != null ? obj.toString().trim() : "";
    }
    private String safeString(Object obj, String defaultValue) {
        return obj != null ? obj.toString().trim() : defaultValue;
    }
}
