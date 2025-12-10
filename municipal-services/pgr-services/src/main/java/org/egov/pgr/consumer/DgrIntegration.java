package org.egov.pgr.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.pgr.web.models.Address;
import org.egov.common.contract.request.User;

import org.egov.pgr.web.models.Boundary;
import org.egov.pgr.web.models.ServiceRequest;
import org.egov.pgr.service.PGRService;
import org.egov.pgr.util.PGRConstants;
import org.egov.pgr.util.MDMSUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    private PGRService grievanceService;

    @Autowired
    private MDMSUtils reportUtils;

    @Autowired
    private PGRConstants constants;

    /* =========================
       Kafka Listener
       ========================= */
    @KafkaListener(topics = {"${kafka.topics.save.dgr.service}"})
    public void listen(final HashMap<String, Object> record,
                       @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

        try {
            // 1. Generate token
            String tokenResponse = generateLoginToken();
            if (tokenResponse == null || tokenResponse.trim().isEmpty() 
                    || "Invalid credentials!".equalsIgnoreCase(tokenResponse.trim())) {
                log.error("Failed to generate token. Aborting DGR grievance creation.");
                return;
            }
            log.info("Token API Response: {}", tokenResponse);

            // 2. Convert record to ServiceRequest
            ObjectMapper mapper = new ObjectMapper();
            ServiceRequest serviceReqRequest = mapper.convertValue(record, ServiceRequest.class);

            // 3. Call grievance creation
            String grievanceResponse = createGrievance(serviceReqRequest, tokenResponse);
            log.info("CreateGrievance Response = {}", grievanceResponse);

        } catch (IllegalArgumentException e) {
            log.error("Error converting Kafka record to ServiceRequest: {}", e.getMessage(), e);
        } catch (Exception ex) {
            log.error("Unexpected error in Kafka listener: {}", ex.getMessage(), ex);
        }
    }


    /* =========================
       Token generation
       ========================= */
    public String generateLoginToken() {
        try {
            String url = TOKEN_URL;

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("Access_Key", TOKEN_ACCESS_KEY);
            requestBody.put("Public_Key", TOKEN_PUBLIC_KEY);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> json = mapper.readValue(response.getBody(), Map.class);

            return (String) json.get("sys_message");

        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    /* =========================
       Main createGrievance flow (unchanged)
       ========================= */
    public String createGrievance(ServiceRequest serviceReqRequest, String bearerToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = CREATE_GRIEVANCE_URL;

            // Fetch required data
            List<Map<String, Object>> districtList = fetchDataFromApi(DISTRICT_LIST_URL);
            List<String> tenantIds = Collections.singletonList(serviceReqRequest.getService().getTenantId());
            String tenantId = serviceReqRequest.getService().getTenantId();
            String rawName = tenantId.substring(tenantId.lastIndexOf('.') + 1);
            String tehsilSearchName = rawName.substring(0, 1).toUpperCase() + rawName.substring(1).toLowerCase();

            Object msevaDistrictByTenantid = reportUtils.getDisrict(
                    serviceReqRequest.getRequestInfo(),
                    PGRConstants.MDMS_TENANTS_MASTERS_MASTER_NAME,
                    tenantIds,
                    "pb"
            );
            String districtName = JsonPath.read(msevaDistrictByTenantid, "$.MdmsRes.tenant.tenants[0].city.districtName");

            Object thirdyPartyDistrictName = reportUtils.getDisrict(
                    serviceReqRequest.getRequestInfo(),
                    PGRConstants.MDMS_THIRD_PART_MASTERS_MASTER_NAME,
                    tenantIds,
                    "pb"
            );

            Object categoryList = reportUtils.getDisrict(
                    serviceReqRequest.getRequestInfo(),
                    PGRConstants.MDMS_DISTRICT_CATEGORY_MASTER_NAME,
                    tenantIds,
                    "pb"
            );

            // Build request body
            Map<String, Object> requestBody = buildRequestBody(serviceReqRequest, districtList, districtName, thirdyPartyDistrictName, categoryList, tehsilSearchName);

            // Call CreateGrievance API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + bearerToken);
            headers.set("Accept", "application/json, text/plain, */*");
            headers.set("Accept-Language", "en-US,en;q=0.9");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            log.info("CreateGrievance Response Body: {}", response.getBody());
            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling CreateGrievance API: " + e.getMessage();
        }
    }

    private Map<String, Object> buildRequestBody(ServiceRequest serviceReqRequest,
                                                 List<Map<String, Object>> districtList,
                                                 String districtName,
                                                 Object thirdPartyDistrictName,
                                                 Object categoryList,
                                                 String tehsilSearchName) {

        Address addr = serviceReqRequest.getService().getAddress();

        // Extract address details safely
        String doorNo = safeString(addr != null ? addr.getDoorNo() : null);
        String plotNo = safeString(addr != null ? addr.getPlotNo() : null);
        String landmark = safeString(addr != null ? addr.getLandmark() : null);
        String city = safeString(addr != null ? addr.getCity() : null);
        String district = safeString(addr != null ? addr.getDistrict() : null);
        String state = safeString(addr != null ? addr.getState() : null);
        String country = safeString(addr != null ? addr.getCountry() : null);
        String pincode = safeString(addr != null ? addr.getPincode() : null);
        String buildingName = safeString(addr != null ? addr.getBuildingName() : null);
        String street = safeString(addr != null ? addr.getStreet() : null);

        String localityName = "";
        String localityCode = "";
        if (addr != null && addr.getLocality() != null) {
            Boundary locality = addr.getLocality();
            localityName = safeString(locality.getName());

            	localityCode = safeString(locality.getCode());

        }

        String latitude = "";
        String longitude = "";
        if (addr != null && addr.getGeoLocation() != null) {
            latitude = addr.getGeoLocation().getLatitude() != null ? addr.getGeoLocation().getLatitude().toString() : "";
            longitude = addr.getGeoLocation().getLongitude() != null ? addr.getGeoLocation().getLongitude().toString() : "";
        }

        String fullAddress = Stream.of(
                buildingName, "Door No: " + doorNo, "Plot No: " + plotNo, street,
                "Locality: " + localityName, city, district, state, country,
                "Pincode: " + pincode, "Landmark: " + landmark
        ).filter(s -> s != null && !s.trim().isEmpty())
         .collect(Collectors.joining(", "));

        if (fullAddress.trim().isEmpty()) fullAddress = constants.DEFAULT_ADDRESS;

        // Category & sub-category mapping
        Map<String, String> catSubCat = mapServiceCodeToCategory(serviceReqRequest.getService().getServiceCode(), categoryList);

        // District mapping
        List<Map<String, Object>> districts = JsonPath.read(
                thirdPartyDistrictName,
                "$.MdmsRes.tenant.thirdpartydistrictmapping[0].thirdpartydistrictmapping.districts"
        );

        String dgrName = districts.stream()
                .filter(dist -> districtName.trim().equalsIgnoreCase(String.valueOf(dist.get("msevaname")).trim()))
                .map(dist -> String.valueOf(dist.get("thirdpartyname")))
                .findFirst()
                .orElseGet(() -> districtList != null && !districtList.isEmpty()
                        ? String.valueOf(districtList.get(0).get("District_Name")).trim()
                        : "");

        Map<String, Object> finalDistrict = districtList.stream()
                .filter(d -> String.valueOf(d.get("District_Name")).trim().equalsIgnoreCase(dgrName.trim()))
                .findFirst()
                .orElse(districtList.get(0));

        String districtId = String.valueOf(finalDistrict.get("District_ID"));
        String districtNameGgr = String.valueOf(finalDistrict.get("District_Name"));
        String stateId = String.valueOf(finalDistrict.get("State_ID"));

        // Tehsil, Village, Municipality
        List<Map<String, Object>> tehsilList = fetchDataFromApi(TEHSIL_BY_DISTRICT_URL + districtId);
        Map<String, Object> matchedTehsil = tehsilList.stream()
                .filter(t -> String.valueOf(t.get("Tehsil_Name")).toLowerCase().contains(tehsilSearchName.toLowerCase()))
                .findFirst()
                .orElse(tehsilList.get(0));

        String tehsilId = String.valueOf(matchedTehsil.get("Respective_GOI_LGD_Code"));
        String tehsilName = String.valueOf(matchedTehsil.get("Tehsil_Name"));
        String tehsilNameLocal = String.valueOf(matchedTehsil.get("Tehsil_Name_Local_language"));

        List<Map<String, Object>> villageList = fetchDataFromApi(VILLAGE_BY_TEHSIL_URL + tehsilId);
        Map<String, Object> firstVillage = (villageList != null && !villageList.isEmpty()) ? villageList.get(0) : Collections.emptyMap();
        String villageId = safeString(firstVillage.get("Respective_GOI_LGD_Code"), "0");
        String villageName = safeString(firstVillage.get("Village_Name"));
        String villageNameLocal = safeString(firstVillage.get("Village_Name_Local_Lang"));

        
        
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

        // User info
        User userInfo = serviceReqRequest.getRequestInfo() != null ? serviceReqRequest.getRequestInfo().getUserInfo() : null;

        String citizenName = safeValue(userInfo != null ? userInfo.getName() : null, constants.DEFAULT_CITIZEN_NAME);
        String citizenEmail = safeValue(userInfo != null ? userInfo.getEmailId() : null, constants.DEFAULT_CITIZEN_EMAIL);
        String citizenMobile = safeValue(userInfo != null ? userInfo.getMobileNumber() : null, constants.DEFAULT_CITIZEN_MOBILE);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("Referrence_ID", serviceReqRequest.getService().getServiceRequestId());

        requestBody.put("Citizen_Name", citizenName);
        requestBody.put("Citizen_Email", citizenEmail);
        requestBody.put("Citizen_Mobile_No", citizenMobile);
        requestBody.put("Citizen_Address", fullAddress);
        requestBody.put("Citizen_District_ID", districtId);
        requestBody.put("Citizen_Tehsil_ID", tehsilId);
        requestBody.put("Citizen_Village_ID", 0);
        requestBody.put("Citizen_Municipality_ID", municipalityId);
        requestBody.put("Citizen_District", districtNameGgr);
        requestBody.put("Citizen_Tehsil", tehsilName);
        requestBody.put("Citizen_Village", null);
        requestBody.put("Citizen_Municipality", municipalityName);
        requestBody.put("Citizen_State", constants.STATE_NAME);
        requestBody.put("Citizen_State_ID", stateId);
        requestBody.put("Application_Department", constants.DEPARTMENT_ID);
        requestBody.put("locationtype", "2");
        requestBody.put("Application_District", districtId);
        requestBody.put("Application_District_Name", districtNameGgr);
        requestBody.put("Category_ID", catSubCat.getOrDefault("Category_ID", "0"));
        requestBody.put("Sub_Category_ID", catSubCat.getOrDefault("Sub_Category_ID", "0"));
        requestBody.put("Application_Title", safeValue(serviceReqRequest.getService().getDescription(), constants.DEFAULT_CITIZEN_NAME));
        requestBody.put("Application_Description", safeValue(serviceReqRequest.getService().getDescription(), constants.DEFAULT_CITIZEN_NAME));
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
        requestBody.put("Town_Name", tehsilSearchName);
        requestBody.put("Locality_Code", localityCode);
        requestBody.put("Locality_Name", localityName);
        requestBody.put("Citizen_EA_User_ID", "933838");
        requestBody.put("Citizen_State_Local_Lang", constants.STATE_LOCAL_LANG);
        requestBody.put("Citizen_District_Local_Lang", districtNameGgr);
        requestBody.put("Citizen_Tehsil_Local_Lang", tehsilNameLocal);
        requestBody.put("Citizen_Village_Local_Lang", villageNameLocal);
        requestBody.put("Citizen_Town_Local_Lang", "");
        requestBody.put("Application_Department_Local_Lang", constants.DEPARTMENT_LOCAL_LANG);
        requestBody.put("Application_District_Local_Lang", districtNameGgr);

        log.info("District ID: {}", districtId);
        log.info("Tehsil ID: {}", tehsilId);
        log.info("Village ID: {}", villageId);
        log.info("Municipality ID: {}", municipalityId);
        log.info("Category ID: {}", catSubCat.get("Category_ID"));
        log.info("Sub-Category ID: {}", catSubCat.get("Sub_Category_ID"));

        return requestBody;
    }

    private String safeString(Object obj) {
        return obj != null ? obj.toString().trim() : "";
    }

    private String safeString(Object obj, String defaultValue) {
        return obj != null ? obj.toString().trim() : defaultValue;
    }

    // Helper method for safe value
    private String safeValue(String value, String defaultVal) {
        return (value == null || value.trim().isEmpty()) ? defaultVal : value;
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
}
