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
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.egov.pgr.contract.Address;
import org.springframework.beans.factory.annotation.Value;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Base64;

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

    // FileStore config
    @Value("${egov.filestore.host}")
    public String FILESTORE_HOST;

    @Value("${egov.filestore.url.endpoint}")
    public String FILESTORE_URL_ENDPOINT;

    // DGR Document upload URL
    @Value("${dgr.upload.document.url}")
    public String DGR_UPLOAD_DOCUMENT_URL;

    // DGR Search grievance by ReferenceId + Mobile
    @Value("${dgr.search.grievance.url}")
    public String DGR_SEARCH_GRIEVANCE_URL;


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
    @KafkaListener(topics = {"${kafka.topics.save.dgr.service}"},
    		concurrency = "${kafka.config.consumer.concurrency.count}")
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

            // Safeguard: If complaint already has a DGR ID, skip to avoid duplicate creation in DGR
            if (serviceReqRequest.getServices() != null && !serviceReqRequest.getServices().isEmpty()) {
                String existingDgrId = serviceReqRequest.getServices().get(0).getDgrPgrId();
                if (existingDgrId != null && !existingDgrId.trim().isEmpty()) {
                    log.info("DGR Grievance ID already exists: {}. Skipping CreateGrievance to avoid duplicate.", existingDgrId);
                    return;
                }
            }

            Map<String, Object> reqInfoMap = (Map<String, Object>) record.get("RequestInfo");
            RequestInfo requestInfo = reqInfoMap != null ? mapper.convertValue(reqInfoMap, RequestInfo.class) : null;

            List<Map<String, Object>> services = (List<Map<String, Object>>) record.get("services");
            String tenantId = (services != null && !services.isEmpty() && services.get(0) != null)
                    ? String.valueOf(services.get(0).get("tenantId")) : "pb";

            UserResponse userResponse = null;
            try {
                if (reqInfoMap != null && reqInfoMap.get("userInfo") != null) {
                    Map<String, Object> userInfo = (Map<String, Object>) reqInfoMap.get("userInfo");
                    if (userInfo.get("id") != null) {
                        Long userId = Long.valueOf(userInfo.get("id").toString());
                        List<Long> userIds = Collections.singletonList(userId);
                        userResponse = grievanceService.getUsers(requestInfo, tenantId, userIds);
                    }
                }
            } catch (Exception e) {
                log.warn("Could not fetch user info for tenant [{}]: {}", tenantId, e.getMessage());
            }

            // Step: Check if grievance already exists in DGR using ReferenceId + Mobile
            String serviceRequestId = (serviceReqRequest.getServices() != null && !serviceReqRequest.getServices().isEmpty())
                    ? serviceReqRequest.getServices().get(0).getServiceRequestId() : null;
            String phone = (serviceReqRequest.getServices() != null && !serviceReqRequest.getServices().isEmpty())
                    ? serviceReqRequest.getServices().get(0).getPhone() : null;

            if ((phone == null || phone.trim().isEmpty()) && userResponse != null
                    && userResponse.getUser() != null && !userResponse.getUser().isEmpty()) {
                phone = userResponse.getUser().get(0).getMobileNumber();
            }

            if (serviceRequestId != null && phone != null && !phone.trim().isEmpty()) {
                String existingGrievanceId = searchGrievanceByReferenceId(serviceRequestId, phone, tokenResponse);
                if (existingGrievanceId != null && !existingGrievanceId.trim().isEmpty()) {
                    log.info("DGR Grievance already exists on DGR for serviceRequestId={}, Grievance_ID={}. Updating DB only.",
                            serviceRequestId, existingGrievanceId);
                    pushDgrIdUpdate(existingGrievanceId, serviceReqRequest);
                    return;
                }
            }

            String grievanceResponse = createGrievance(serviceReqRequest, tokenResponse, userResponse);

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

            RestTemplate restTemplate = createRestTemplate(10000, 15000);
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
            log.error("Error while generating login token: {}", ex.getMessage());
            return null;
        }
    }


    /* =========================
       Main createGrievance flow (unchanged)
       ========================= */
    public String createGrievance(ServiceRequest serviceReqRequest, String bearerToken, UserResponse userResponse) {
        try {
            RestTemplate restTemplate = createRestTemplate(10000, 25000);
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
           
            String citizenName = safeValue(
                    constants.DEFAULT_CITIZEN_NAME,                 // DEFAULT FIRST
                    pgrService.getFirstName(),                      // old structure
                    pgrService.getCitizen() != null
                            ? pgrService.getCitizen().getName()
                            : null,
                    userResponse != null && userResponse.getUser() != null && !userResponse.getUser().isEmpty()
                            ? userResponse.getUser().get(0).getName()
                            : null
            );
            
            String citizenEmail = safeValue(
                    constants.DEFAULT_CITIZEN_EMAIL,
                    pgrService.getEmail(),
                    pgrService.getCitizen() != null
                            ? pgrService.getCitizen().getEmailId()
                            : null,
                    userResponse != null && userResponse.getUser() != null && !userResponse.getUser().isEmpty()
                            ? userResponse.getUser().get(0).getEmailId()
                            : null
            );

            
            String citizenMobile = safeValue(
                    constants.DEFAULT_CITIZEN_MOBILE,
                    pgrService.getPhone(),
                    pgrService.getCitizen() != null
                            ? pgrService.getCitizen().getMobileNumber()
                            : null,
                    userResponse != null && userResponse.getUser() != null && !userResponse.getUser().isEmpty()
                            ? userResponse.getUser().get(0).getMobileNumber()
                            : null
            );





            // 16. Prepare payload
            Map<String, Object> requestBody = new HashMap<>();
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
            requestBody.put("Referrence_ID", serviceReqRequest.getServices().get(0).getServiceRequestId());

            requestBody.put("Application_Department",  Optional.ofNullable(catSubCat.get("Department_ID"))
                    .filter(s -> !s.trim().isEmpty())
                    .orElse("0"));

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

            String applicationTitle = safeValue(
            	    constants.DEFAULT_DESCRIPTION_NAME,
            	    serviceReqRequest.getServices().get(0).getDescription()
            	);

            	requestBody.put(
            	    "Application_Title",
            	    applicationTitle + " - " + serviceReqRequest.getServices().get(0).getServiceRequestId()
            	);

            	requestBody.put(
            	    "Application_Description",
            	    safeValue(constants.DEFAULT_DESCRIPTION_NAME,
            	              serviceReqRequest.getServices().get(0).getDescription())
            	);
            	requestBody.put("Application_Department_Name",   Optional.ofNullable(catSubCat.get("Department_Name"))
                        .filter(s -> !s.trim().isEmpty())
                        .orElse("Department of Local Government"));
            requestBody.put("reopen", true);
            requestBody.put("Citizen_Type", constants.CITIZEN_TYPE);
            requestBody.put("Citizen_Company_Name", "");
            requestBody.put("Citizen_Company_Designation_Name", "");
            requestBody.put("Flow_Type", constants.FLOW_TYPE);
            requestBody.put("System_type", constants.SYSTEM_TYPE);
            requestBody.put("Service_Code", constants.SERVICE_CODE_DEFAULT);
            requestBody.put("Selected_Locale", constants.SELECTED_LOCALE);
            // Collect media UUIDs from ActionInfo and upload documents to DGR
            List<String> mediaIds = Collections.emptyList();
            if (serviceReqRequest.getActionInfo() != null
                    && !serviceReqRequest.getActionInfo().isEmpty()
                    && serviceReqRequest.getActionInfo().get(0).getMedia() != null) {
                mediaIds = serviceReqRequest.getActionInfo().get(0).getMedia();
            }
            List<Map<String, Object>> uploadedDocs = uploadDocumentsToDgr(
                    mediaIds,
                    bearerToken,
                    serviceReqRequest.getServices().get(0).getTenantId()
            );
            requestBody.put("doc", uploadedDocs);
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
            requestBody.put("Application_Department_Local_Lang",  Optional.ofNullable(catSubCat.get("Department_Name_Local"))
                    .filter(s -> !s.trim().isEmpty())
                    .orElse(" ਸਥਾਨਕ ਸਰਕਾਰ ਵਿਭਾਗ"));
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
            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            ObjectMapper mapper = new ObjectMapper();
            String reqId = serviceReqRequest.getServices().get(0).getServiceRequestId();
            try {
                log.info("DGR CreateGrievance request payload for serviceRequestId [{}]: {}", reqId, mapper.writeValueAsString(requestBody));
            } catch (Exception e) {
                log.info("DGR CreateGrievance request payload for serviceRequestId [{}]: {}", reqId, requestBody);
            }

            String responseBody;

            try {
                ResponseEntity<String> response =
                        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
                responseBody = response.getBody();

            } catch (Exception ex) {

                log.error("Error calling CreateGrievance API for serviceRequestId [{}]: {}", reqId, ex.getMessage(), ex);

                Map<String, Object> failedPayload = new HashMap<>();
                failedPayload.put("serviceRequest", serviceReqRequest);
                failedPayload.put("DgrCreate", sanitizeRequestBodyForFailure(requestBody));
                failedPayload.put("error", ex.getMessage());
                failedPayload.put("status", "FAILED");

                pGRProducer.push(failedDgrTopic, reqId, failedPayload);
                log.warn("Pushed failed DGR record to topic [{}] for serviceRequestId: {}, error: {}", failedDgrTopic, reqId, ex.getMessage());

                return "Error calling CreateGrievance API: " + ex.getMessage();
            }

            String grievanceId = null;
            try {
                grievanceId = JsonPath.read(responseBody, "$.data[0].Grievance_id");
            } catch (Exception e) {
                log.error("Grievance_id not found in response");
            }

            if (grievanceId != null && !grievanceId.trim().isEmpty()) {

                log.info("DGR Grievance ID: {} created successfully for serviceRequestId: {}", grievanceId, reqId);

                serviceReqRequest.getServices().get(0).setDgrPgrId(grievanceId);

                pGRProducer.push(drgPgrId, grievanceId, serviceReqRequest);
                log.info("Pushed DGR ID [{}] mapping to topic [{}] for serviceRequestId: {}", grievanceId, drgPgrId, reqId);

            } else {

                log.error("DGR Grievance ID missing for serviceRequestId [{}]. Response: {}", reqId, responseBody);

                Map<String, Object> failedPayload = new HashMap<>();
                failedPayload.put("serviceRequest", serviceReqRequest);
                failedPayload.put("dgrResponse", responseBody);
                failedPayload.put("DgrCreate", sanitizeRequestBodyForFailure(requestBody));
                failedPayload.put("error", "DGR_GRIEVANCE_ID_MISSING");
                failedPayload.put("status", "FAILED");

                pGRProducer.push(failedDgrTopic, reqId, failedPayload);
                log.warn("Pushed failed DGR record to topic [{}] for serviceRequestId: {}. DGR response: {}", failedDgrTopic, reqId, responseBody);
            }
		
            return responseBody;
        }
        finally {
            log.info("CreateGrievance API call completed");
        }
    }

    /**
     * Helper to push updated DGR ID mapping to Kafka topic (update-dgr-pgrid)
     * so that eg_pgr_service is updated in PostgreSQL.
     */
    public void pushDgrIdUpdate(String grievanceId, ServiceRequest serviceReqRequest) {
        if (grievanceId != null && !grievanceId.trim().isEmpty() && serviceReqRequest != null) {
            String reqId = (serviceReqRequest.getServices() != null && !serviceReqRequest.getServices().isEmpty())
                    ? serviceReqRequest.getServices().get(0).getServiceRequestId() : "UNKNOWN";
            serviceReqRequest.getServices().get(0).setDgrPgrId(grievanceId);
            pGRProducer.push(drgPgrId, grievanceId, serviceReqRequest);
            log.info("Pushed DGR ID [{}] mapping to topic [{}] for serviceRequestId: {}", grievanceId, drgPgrId, reqId);
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
       DGR Search Grievance by ReferenceId + Mobile
       ========================= */
    /**
     * Calls DGR's GetGrievanceIdByMobileAndReferenceId API to check if a grievance
     * already exists in DGR for the given serviceRequestId + mobile number.
     *
     * @param referenceId     Our serviceRequestId (e.g. "25/08/2026/356974")
     * @param citizenMobileNo Citizen's mobile number from phone column
     * @param bearerToken     DGR bearer token
     * @return The DGR Grievance_ID if found, or null if not found / error
     */
    @SuppressWarnings("unchecked")
    public String searchGrievanceByReferenceId(String referenceId, String citizenMobileNo, String bearerToken) {
        if (referenceId == null || referenceId.trim().isEmpty()) {
            log.warn("searchGrievanceByReferenceId: referenceId is null/empty");
            return null;
        }
        if (citizenMobileNo == null || citizenMobileNo.trim().isEmpty()) {
            log.warn("searchGrievanceByReferenceId: citizenMobileNo is null/empty for referenceId={}", referenceId);
            return null;
        }

        try {
            RestTemplate restTemplate = createRestTemplate(10000, 15000);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("ReferenceId", referenceId.trim());
            requestBody.put("CitizenMobileNo", citizenMobileNo.trim());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + bearerToken);
            headers.set("Accept", "application/json, text/plain, */*");

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Calling DGR SearchGrievance API: {} with ReferenceId={}, Mobile={}",
                    DGR_SEARCH_GRIEVANCE_URL, referenceId, citizenMobileNo);

            ResponseEntity<String> response = restTemplate.exchange(
                    DGR_SEARCH_GRIEVANCE_URL, HttpMethod.POST, entity, String.class);

            String responseBody = response.getBody();
            log.info("DGR SearchGrievance response for ReferenceId={}: {}", referenceId, responseBody);

            if (responseBody == null) return null;

            // Parse response: { "response": 1, "data": [{ "Grievance_ID": "20260105809" }], ... }
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> json = mapper.readValue(responseBody, Map.class);

            Object responseFlag = json.get("response");
            if (responseFlag != null && "1".equals(String.valueOf(responseFlag))) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) json.get("data");
                if (data != null && !data.isEmpty()) {
                    Object grievanceId = data.get(0).get("Grievance_ID");
                    if (grievanceId != null && !String.valueOf(grievanceId).trim().isEmpty()) {
                        String gId = String.valueOf(grievanceId).trim();
                        log.info("DGR Grievance found! ReferenceId={} -> Grievance_ID={}", referenceId, gId);
                        return gId;
                    }
                }
            }

            log.info("No existing DGR Grievance found for ReferenceId={}", referenceId);
            return null;

        } catch (Exception e) {
            log.warn("Error searching DGR grievance for ReferenceId={}: {}", referenceId, e.getMessage());
            return null;
        }
    }

    /* =========================
       Helper APIs
       ========================= */
    private RestTemplate createRestTemplate(int connectTimeoutMs, int readTimeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(factory);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchDataFromApi(String url) {
        try {
            RestTemplate restTemplate = createRestTemplate(10000, 15000);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json, text/plain, */*");
            headers.set("Content-Type", "application/json");

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) return new ArrayList<>();

            // Most of your APIs return { "data": [ ... ] }
            Object dataObj = responseBody.get("data");
            if (dataObj instanceof List) {
                return (List<Map<String, Object>>) dataObj;
            }
            return new ArrayList<>();

        } catch (Exception e) {
            log.warn("Error fetching data from API [{}]: {}", url, e.getMessage());
            return new ArrayList<>();
        }
    }

    public Map<String, String> mapServiceCodeToCategory(String serviceCode, Object mdmsResponse) {
        Map<String, String> result = new HashMap<>();
        String normalizedCode = serviceCode.replaceAll("\\s+", "").toLowerCase();

        try {
            // Read categories array from MDMS response
            List<Map<String, Object>> categories = JsonPath.read(
                    mdmsResponse, "$.MdmsRes.tenant.dgrIntegration[0].categories"
            );

            for (Map<String, Object> category : categories) {
                List<Map<String, Object>> subcategories = (List<Map<String, Object>>) category.get("subcategories");
                for (Map<String, Object> sub : subcategories) {
                    String label = String.valueOf(sub.get("msevaServiceCode")).replaceAll("\\s+", "").toLowerCase();
                    if (label.equals(normalizedCode)) {
                        result.put("Category_ID", String.valueOf(category.get("Category_ID")));
                        result.put("Sub_Category_ID", String.valueOf(sub.get("id")));
                        result.put("Department_ID", String.valueOf(category.get("departmentId")));
                        result.put("Department_Name", String.valueOf(category.get("departmentName"))); // Original English
                        result.put("Department_Name_Local", String.valueOf(category.get("departmentNameLocal"))); // Punjabi/Local
                        return result;
                    }
                }
            }

            // Default if not found
            result.put("Category_ID", "0");
            result.put("Sub_Category_ID", "0");
            result.put("Department_ID", "0");
            result.put("Department_Name", "Department of Local Government");
            result.put("Department_Name_Local", "");
        } catch (Exception e) {
            // In case JSON path fails or structure is invalid
            result.put("Category_ID", "0");
            result.put("Sub_Category_ID", "0");
            result.put("Department_ID", "0");
            result.put("Department_Name", "Department of Local Government");
            result.put("Department_Name_Local", "ਸਥਾਨਕ ਸਰਕਾਰ ਵਿਭਾਗ");
        }

        return result;
    }
    
    private String safeString(Object obj) {
        return obj != null ? obj.toString().trim() : "";
    }
    private String safeString(Object obj, String defaultValue) {
        return obj != null ? obj.toString().trim() : defaultValue;
    }

    /* =========================
       Document Upload to DGR
       ========================= */
    /**
     * Fetches file URLs from the FileStore for the given media UUIDs,
     * downloads each file, base64-encodes it, and uploads to the DGR
     * Uploaddocument API.
     *
     * @param mediaIds    list of FileStore UUIDs from ActionInfo.media
     * @param bearerToken DGR bearer token from generateLoginToken()
     * @param tenantId    tenantId for FileStore API call
     * @return list of uploaded doc objects to include in the CreateGrievance payload
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> uploadDocumentsToDgr(
            List<String> mediaIds, String bearerToken, String tenantId) {

        List<Map<String, Object>> result = new ArrayList<>();

        if (mediaIds == null || mediaIds.isEmpty()) {
            log.info("No media IDs found — skipping document upload.");
            return result;
        }

        try {
            // 1. Build FileStore URL API call
            String fileStoreIds = String.join(",", mediaIds);
            String fileStoreApiUrl = FILESTORE_HOST + FILESTORE_URL_ENDPOINT
                    + "?tenantId=pb&fileStoreIds=" + fileStoreIds;

            log.info("Calling FileStore URL API: {}", fileStoreApiUrl);

            RestTemplate restTemplate = createRestTemplate(10000, 30000);
            HttpHeaders fsHeaders = new HttpHeaders();
            fsHeaders.set("Accept", "application/json, text/plain, */*");
            HttpEntity<String> fsEntity = new HttpEntity<>(fsHeaders);

            ResponseEntity<Map> fsResponse = restTemplate.exchange(
                    fileStoreApiUrl, HttpMethod.GET, fsEntity, Map.class);

            Map<String, Object> fsBody = fsResponse.getBody();
            if (fsBody == null) {
                log.warn("FileStore API returned null body.");
                return result;
            }

            // 2. Extract fileStoreIds array from response: [{ "id": "...", "url": "..." }]
            List<Map<String, Object>> fileStoreList =
                    (List<Map<String, Object>>) fsBody.get("fileStoreIds");

            if (fileStoreList == null || fileStoreList.isEmpty()) {
                log.warn("No fileStoreIds entries in FileStore response.");
                return result;
            }

            // 3. Build list of doc maps: download + base64-encode each file
            List<Map<String, Object>> docFiles = new ArrayList<>();
            for (Map<String, Object> entry : fileStoreList) {
                String publicUrl = String.valueOf(entry.get("url"));
                log.info("FileStore public URL: {}", publicUrl);

                // Replace public domain with the configured internal FileStore host
                // so the download happens via the internal network
                String downloadUrl = publicUrl;
                try {
                    URI uri = new URI(publicUrl);
                    String publicOrigin = uri.getScheme() + "://" + uri.getHost()
                            + (uri.getPort() != -1 ? ":" + uri.getPort() : "");
                    downloadUrl = publicUrl.replace(publicOrigin, FILESTORE_HOST);
                } catch (Exception e) {
                    log.warn("Could not parse URL for domain replacement [{}]: {}", publicUrl, e.getMessage());
                }

                log.info("Downloading file from: {}", downloadUrl);

                try {
                    byte[] fileBytes = downloadFileBytes(downloadUrl);
                    if (fileBytes == null || fileBytes.length == 0) {
                        log.warn("Empty file bytes for URL: {}", downloadUrl);
                        continue;
                    }

                    String base64Content = Base64.getEncoder().encodeToString(fileBytes);

                    // Derive filename: prefer query param 'name', fallback to path segment
                    String filename = "attachment";
                    try {
                        URI parsedUri = new URI(publicUrl);
                        String query = parsedUri.getQuery(); // e.g. "name=pb/undefined/August/25/xyz.pdf"
                        if (query != null && query.contains("name=")) {
                            String nameParam = query.substring(query.indexOf("name=") + 5);
                            if (nameParam.contains("&")) {
                                nameParam = nameParam.substring(0, nameParam.indexOf("&"));
                            }
                            // Take only the last segment of the path inside the name param
                            filename = nameParam.contains("/")
                                    ? nameParam.substring(nameParam.lastIndexOf('/') + 1)
                                    : nameParam;
                        } else {
                            String urlPath = parsedUri.getPath();
                            String seg = urlPath.contains("/")
                                    ? urlPath.substring(urlPath.lastIndexOf('/') + 1) : urlPath;
                            if (!seg.isEmpty()) filename = seg;
                        }
                        // URL-decode
                        filename = java.net.URLDecoder.decode(filename, "UTF-8");
                    } catch (Exception e) {
                        log.warn("Could not derive filename from URL [{}]: {}", publicUrl, e.getMessage());
                    }

                    // Detect content-type from filename extension
                    String contentType = "application/octet-stream";
                    String lowerFilename = filename.toLowerCase();
                    if (lowerFilename.endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (lowerFilename.endsWith(".png")) {
                        contentType = "image/png";
                    }

                    Map<String, Object> docEntry = new HashMap<>();
                    docEntry.put("filename", filename);
                    docEntry.put("filesize", String.valueOf(fileBytes.length));
                    docEntry.put("filetype", contentType);
                    docEntry.put("base64", base64Content);
                    docFiles.add(docEntry);

                    log.info("File prepared for DGR upload: name={}, size={}, type={}",
                            filename, fileBytes.length, contentType);

                } catch (Exception e) {
                    log.error("Failed to download/encode file from [{}]: {}", downloadUrl, e.getMessage(), e);
                }
            }

            if (docFiles.isEmpty()) {
                log.info("No files downloaded successfully — sending empty doc list.");
                return result;
            }

            // 4. POST to DGR Uploaddocument API
            Map<String, Object> uploadPayload = new HashMap<>();
            uploadPayload.put("files", docFiles);

            HttpHeaders uploadHeaders = new HttpHeaders();
            uploadHeaders.setContentType(MediaType.APPLICATION_JSON);
            uploadHeaders.set("Authorization", "Bearer " + bearerToken);
            uploadHeaders.set("Accept", "application/json, text/plain, */*");

            HttpEntity<Map<String, Object>> uploadEntity = new HttpEntity<>(uploadPayload, uploadHeaders);

            log.info("Calling DGR Uploaddocument API: {}", DGR_UPLOAD_DOCUMENT_URL);
            ResponseEntity<String> uploadResponse = restTemplate.exchange(
                    DGR_UPLOAD_DOCUMENT_URL, HttpMethod.POST, uploadEntity, String.class);

            log.info("DGR Uploaddocument response status: {}", uploadResponse.getStatusCode());
            log.info("DGR Uploaddocument response body: {}", uploadResponse.getBody());

            // 5. Extract document IDs/messages from Uploaddocument response (NO base64)
            try {
                List<Map<String, Object>> responseData = JsonPath.read(uploadResponse.getBody(), "$.data");
                if (responseData != null && !responseData.isEmpty()) {
                    result = responseData;
                    log.info("DGR Uploaddocument returned doc info (msg id): {}", result);
                }
            } catch (Exception e) {
                log.error("Failed to parse Uploaddocument response: {}", e.getMessage());
            }

        } catch (Exception e) {
            log.error("Error in uploadDocumentsToDgr: {}", e.getMessage(), e);
        }

        return result;
    }

    /**
     * Downloads file bytes using standard HttpURLConnection to avoid URL template
     * double-encoding issues with Spring RestTemplate on pre-encoded query strings.
     */
    private byte[] downloadFileBytes(String fileUrl) throws Exception {
        URL url = new URL(fileUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        conn.setRequestProperty("Accept", "*/*");
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(30000);

        int responseCode = conn.getResponseCode();
        // Handle redirect
        if (responseCode == HttpURLConnection.HTTP_MOVED_TEMP || responseCode == HttpURLConnection.HTTP_MOVED_PERM) {
            String newUrl = conn.getHeaderField("Location");
            if (newUrl != null && !newUrl.isEmpty()) {
                conn.disconnect();
                return downloadFileBytes(newUrl);
            }
        }

        if (responseCode >= 200 && responseCode < 300) {
            try (InputStream in = conn.getInputStream();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                return out.toByteArray();
            } finally {
                conn.disconnect();
            }
        } else {
            conn.disconnect();
            throw new RuntimeException("HTTP " + responseCode + " while downloading file from: " + fileUrl);
        }
    }

    /**
     * Creates a lightweight copy of the requestBody without large base64 strings
     * to prevent OutOfMemoryError when pushing to Kafka failed topic.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> sanitizeRequestBodyForFailure(Map<String, Object> original) {
        if (original == null) return null;
        Map<String, Object> sanitized = new HashMap<>(original);
        Object docObj = sanitized.get("doc");
        if (docObj instanceof List) {
            List<?> docList = (List<?>) docObj;
            List<Object> sanitizedDocs = new ArrayList<>();
            for (Object doc : docList) {
                if (doc instanceof Map) {
                    Map<String, Object> cleanDoc = new HashMap<>((Map<String, Object>) doc);
                    if (cleanDoc.containsKey("base64")) {
                        cleanDoc.put("base64", "[OMITTED_FOR_KAFKA_PAYLOAD]");
                    }
                    sanitizedDocs.add(cleanDoc);
                } else {
                    sanitizedDocs.add(doc);
                }
            }
            sanitized.put("doc", sanitizedDocs);
        }
        return sanitized;
    }
}
