package org.egov.dx.service;

import static org.egov.dx.util.PTServiceDXConstants.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import javax.servlet.http.HttpServletResponse;

import org.egov.common.contract.request.RequestInfo;
import org.egov.dx.util.Configurations;
import org.egov.dx.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.security.AnyTypePermission;
import com.thoughtworks.xstream.security.NoTypePermission;
import com.thoughtworks.xstream.security.NullPermission;
import com.thoughtworks.xstream.security.PrimitiveTypePermission;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DataExchangeService {

    private static final String TIMESTAMP_PATTERN = "yyyy-MM-dd HH:mm:ss";

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserService userService;

    @Autowired
    private HttpServletResponse response;

    @Autowired
    private Configurations configurations;

    @Autowired
    private ObjectMapper objectMapper;


    private final XStream xstream;
    private final RestTemplate restTemplate;

    public DataExchangeService() {
        this.xstream = initializeXStream();
        this.restTemplate = new RestTemplate();
    }

    private XStream initializeXStream() {
        XStream xs = new XStream();
        xs.addPermission(NoTypePermission.NONE);
        xs.addPermission(NullPermission.NULL);
        xs.addPermission(PrimitiveTypePermission.PRIMITIVES);
        xs.addPermission(AnyTypePermission.ANY);
        xs.allowTypesByWildcard(new String[] { "org.egov.dx.web.models.**" });
        
        xs.processAnnotations(new Class[] {
            PullURIResponse.class, PullDocResponse.class, Certificate.class,
            Organization.class, Address.class, IssuedBy.class, IssuedTo.class,
            ResponseStatus.class, DocDetailsResponse.class, Person.class,
            WaterSewerageBill.class
        });
        
        return xs;
    }

    // --- Public API Methods ---

    public String handlePullURIRequest(SearchCriteria criteria) throws IOException {
        if (!ORIGIN.equals(criteria.getOrigin())) {
            log.error("Unsupported origin: {}", criteria.getOrigin());
            return DIGILOCKER_ORIGIN_NOT_SUPPORTED;
        }
        return processRequest(criteria, true);
    }

    public String handlePullDocRequest(SearchCriteria criteria) throws IOException {
        if (!ORIGIN.equals(criteria.getOrigin())) {
            log.error("Unsupported origin: {}", criteria.getOrigin());
            return DIGILOCKER_ORIGIN_NOT_SUPPORTED;
        }
        return processRequest(criteria, false);
    }

    // --- Routing Logic ---

    private String processRequest(SearchCriteria searchCriteria, boolean isUriRequest) throws IOException {
        String txnId = searchCriteria.getTxn();
        
        try {
            if (!isUriRequest) {
                extractUriDetails(searchCriteria);
            }
            
            RequestInfoWrapper requestWrapper = prepareRequestInfo();
            String docType = searchCriteria.getDocType();

            log.info("Processing DigiLocker Request for DocType: {}", docType);

            if (DIGILOCKER_DOCTYPE.equalsIgnoreCase(docType)) { // Replaced "PRTAX"
                return handlePropertyTax(searchCriteria, isUriRequest, requestWrapper);
            } else if ("WS".equalsIgnoreCase(docType) || "SW".equalsIgnoreCase(docType)) {
                return handleWaterSewerage(searchCriteria, isUriRequest, requestWrapper, docType);
            } else {
                log.error("Unsupported DocType: {}", docType);
                return generateErrorResponse(txnId, isUriRequest);
            }

        } catch (Exception e) {
            log.error("Critical error during data exchange: ", e);
            return generateErrorResponse(txnId, isUriRequest);
        }
    }

    // --- Property Tax Logic ---

    private String handlePropertyTax(SearchCriteria searchCriteria, boolean isUriRequest, RequestInfoWrapper wrapper) throws IOException {
        PaymentSearchCriteria paymentCriteria = new PaymentSearchCriteria();
        paymentCriteria.setTenantId(TENANT_PREFIX + searchCriteria.getCity()); // Replaced "pb."
        paymentCriteria.setConsumerCodes(Collections.singleton(searchCriteria.getPropertyId()));

        List<Payment> payments = paymentService.getPayments(paymentCriteria, DIGILOCKER_DOCTYPE, wrapper);
        
        if (!isValidResponse(searchCriteria, payments)) {
            return generateErrorResponse(searchCriteria.getTxn(), isUriRequest);
        }
        
        Payment payment = payments.get(0);
        String fileStoreId = payment.getFileStoreId();
        if (fileStoreId == null) {
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setPayments(Collections.singletonList(payment));
            paymentRequest.setRequestInfo(wrapper.getRequestInfo()); 
            fileStoreId = paymentService.createPDF(paymentRequest);
        }

        Object filestoreObj = paymentService.getFilestore(fileStoreId);
        JsonNode root = objectMapper.valueToTree(filestoreObj);
        String pdfUrl = null;
        
        if (root.has("fileStoreIds") && root.get("fileStoreIds").isArray() && root.get("fileStoreIds").size() > 0) {
            pdfUrl = root.get("fileStoreIds").get(0).path("url").asText(null);
        } else if (root.isArray() && root.size() > 0) {
            pdfUrl = root.get(0).path("url").asText(null);
        }

        if (pdfUrl == null || pdfUrl.isEmpty() || "null".equals(pdfUrl)) {
            throw new IOException("URL not found in Filestore response");
        }

        String base64Pdf = downloadAndEncodePdf(pdfUrl);
        ResponseStatus status = new ResponseStatus(getFormattedNow(), searchCriteria.getTxn(), "1");
        
        String actualPropertyId = payment.getPaymentDetails().get(0).getBill().getConsumerCode();
        String replacedPropertyId = actualPropertyId.replace("-", "QW");
        
        String customUri = String.format("%s-%s-%sQW%s", 
                DIGILOCKER_ISSUER_ID, DIGILOCKER_DOCTYPE, replacedPropertyId, searchCriteria.getCity());

        DocDetailsResponse docDetails = new DocDetailsResponse();
        docDetails.setURI(customUri);
        docDetails.setDocContent(base64Pdf);
        
        Certificate cert = populateCertificate(payment);
        docDetails.setIssuedTo(cert.getIssuedTo());
        
        String xmlData = xstream.toXML(cert);
        docDetails.setDataContent(Base64.getEncoder().encodeToString(xmlData.getBytes()));

        return buildFinalResponse(status, docDetails, isUriRequest);
    }

    // --- Water & Sewerage Logic ---

    private String handleWaterSewerage(SearchCriteria searchCriteria, boolean isUriRequest, RequestInfoWrapper wrapper, String docType) throws IOException {
        
        JsonNode billResponse = fetchWaterSewerageBills(searchCriteria, docType, wrapper);
        if (billResponse == null) return generateErrorResponse(searchCriteria.getTxn(), isUriRequest);

        JsonNode bills = billResponse.path("Bills");
        if (bills.isMissingNode() || !bills.isArray() || bills.size() == 0) {
            log.error("No bills found for {} consumer {}", docType, searchCriteria.getPropertyId());
            return generateErrorResponse(searchCriteria.getTxn(), isUriRequest);
        }

        JsonNode latestBill = bills.get(0);
        if (!isValidWsResponse(searchCriteria, latestBill)) {
            log.error("Validation failed for {}: Name or Mobile mismatch.", docType);
            return generateErrorResponse(searchCriteria.getTxn(), isUriRequest);
        }

        String fileStoreId = generateWsPdf(latestBill, wrapper.getRequestInfo(), docType);

        if (fileStoreId == null || fileStoreId.isEmpty() || "null".equals(fileStoreId)) {
            log.error("Failed to generate PDF for WS/SW Bill");
            return generateErrorResponse(searchCriteria.getTxn(), isUriRequest);
        }

        Object filestoreObj = paymentService.getFilestore(fileStoreId);
        JsonNode root = objectMapper.valueToTree(filestoreObj);
        String pdfUrl = null;
        
        if (root.has("fileStoreIds") && root.get("fileStoreIds").isArray() && root.get("fileStoreIds").size() > 0) {
            pdfUrl = root.get("fileStoreIds").get(0).path("url").asText(null);
        } else if (root.isArray() && root.size() > 0) {
            pdfUrl = root.get(0).path("url").asText(null);
        }

        if (pdfUrl == null || pdfUrl.isEmpty() || "null".equals(pdfUrl)) {
            throw new IOException("URL not found in Filestore response");
        }

        String base64Pdf = downloadAndEncodePdf(pdfUrl);
        ResponseStatus status = new ResponseStatus(getFormattedNow(), searchCriteria.getTxn(), "1");
        
        String actualConsumerCode = latestBill.path("consumerCode").asText("");
        String replacedConsumerCode = actualConsumerCode.replace("-", "QW");
        String customUri = String.format("%s-%s-%sQW%s", 
                DIGILOCKER_ISSUER_ID, docType, replacedConsumerCode, searchCriteria.getCity());

        DocDetailsResponse docDetails = new DocDetailsResponse();
        docDetails.setURI(customUri);
        docDetails.setDocContent(base64Pdf);
        
        Certificate cert = populateWSCertificate(latestBill, docType);
        docDetails.setIssuedTo(cert.getIssuedTo());
        
        String xmlData = xstream.toXML(cert);
        docDetails.setDataContent(Base64.getEncoder().encodeToString(xmlData.getBytes()));

        return buildFinalResponse(status, docDetails, isUriRequest);
    }

    private JsonNode fetchWaterSewerageBills(SearchCriteria sc, String docType, RequestInfoWrapper requestInfo) {
    	String url = "WS".equalsIgnoreCase(docType) ? 
                configurations.getSearchServiceHost() + configurations.getSearchWsEndpoint() :
                configurations.getSearchServiceHost() + configurations.getSearchSwEndpoint();
        
        String businessService = "WS".equalsIgnoreCase(docType) ? "WS" : "SW";

        Map<String, Object> searchCriteriaMap = new HashMap<>();
        searchCriteriaMap.put("tenantId", TENANT_PREFIX + sc.getCity());
        searchCriteriaMap.put("mobileNumber", sc.getMobile());
        if (sc.getConsumerCode() != null && !sc.getConsumerCode().isEmpty()) {
            searchCriteriaMap.put("consumerCode", sc.getPropertyId()); 
        }
        searchCriteriaMap.put("businesService", businessService);

        Map<String, Object> request = new HashMap<>();
        request.put("RequestInfo", requestInfo.getRequestInfo());
        request.put("searchCriteria", searchCriteriaMap);

        try {
            return restTemplate.postForObject(url, request, JsonNode.class);
        } catch (Exception e) {
            log.error("Error fetching WS/SW bills from Bill Genie: ", e);
            return null;
        }
    }

    private boolean isValidWsResponse(SearchCriteria sc, JsonNode bill) {
        if ("FALSE".equalsIgnoreCase(configurations.getValidationFlag())) return true;
        
        String billName = bill.path("payerName").asText("");
        String billMobile = bill.path("mobileNumber").asText("");
        
        // Use equalsIgnoreCase for the name to ignore capitalization differences
        boolean isNameMatch = billName.equalsIgnoreCase(sc.getPayerName());
        
        // Mobile numbers are just digits, so normal equals is fine
        boolean isMobileMatch = Objects.equals(sc.getMobile(), billMobile);
        
        return isNameMatch && isMobileMatch;
    }
    
    private String generateWsPdf(JsonNode bill, RequestInfo requestInfo, String docType) {
        // Replaced hardcoded URL with injected egovHost and pdfCreateEndpoint
        String pdfUrl = configurations.getFilestoreHost() + configurations.getPdfServiceCreate() + "?key=" + 
                        ("WS".equalsIgnoreCase(docType) ? "ws-bill" : "sw-bill") + 
                        "&tenantId=" + STATE_TENANT;

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.set("RequestInfo", objectMapper.valueToTree(requestInfo));
        requestBody.putArray("Bill").add(bill);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);

        try {
            JsonNode responseNode = restTemplate.postForObject(pdfUrl, request, JsonNode.class);
            if (responseNode != null && responseNode.has("filestoreIds") && responseNode.get("filestoreIds").isArray()) {
                return responseNode.get("filestoreIds").get(0).asText();
            }
        } catch (Exception e) {
            log.error("Failed to generate PDF for " + docType, e);
        }
        return null;
    }

    private Certificate populateWSCertificate(JsonNode bill, String docType) {
        Certificate cert = new Certificate();
        cert.setLanguage(LANGUAGE_CODE); // Replaced "99"
        cert.setname("WS".equalsIgnoreCase(docType) ? "Water Bill" : "Sewerage Bill");
        cert.setType(docType);
        cert.setNumber("");
        cert.setPrevNumber("");
        
        long epochDate = bill.path("billDate").asLong();
        String formattedBillDate = new SimpleDateFormat("dd-MM-yyyy").format(new Date(epochDate));
        
        cert.setIssueDate(formattedBillDate);
        cert.setExpiryDate("");
        cert.setValidFromDate("");
        cert.setIssuedAt(bill.path("tenantId").asText());
        cert.setStatus(CERT_STATUS_ACTIVE); // Replaced "A"

        Organization org = new Organization();
        org.setName(ISSUER_ORG_NAME); // Replaced hardcoded Punjab string
        org.setType(ISSUER_ORG_TYPE); // Replaced "SG"
        org.setTin("");
        org.setCode("");
        org.setuuid("");
        
        Address orgAddr = new Address();
        orgAddr.setType("");
        orgAddr.setLine1("");
        orgAddr.setLine2("");
        orgAddr.setHouse("");
        orgAddr.setLandmark("");
        orgAddr.setLocality("");
        orgAddr.setVtc("");
        orgAddr.setPin(ISSUER_PIN); // Replaced "160022"
        orgAddr.setDistrict(ISSUER_DISTRICT); // Replaced "Chandigarh"
        orgAddr.setState(ISSUER_STATE); // Replaced "Chandigarh"
        orgAddr.setCountry("IN");
        org.setAddress(orgAddr);

        IssuedBy issuer = new IssuedBy();
        issuer.setOrganisation(org);
        cert.setIssuedBy(issuer);

        Person person = new Person();
        person.setUid("");
        person.setTitle("");
        person.setName(bill.path("payerName").asText()); 
        person.setDob("");
        person.setAge("");
        person.setSwd("");
        person.setSwdIndicator("");
        person.setMotherName("");
        person.setGender("");
        person.setMaritalStatus("");
        person.setRelationWithHof("");
        person.setDisabilityStatus("");
        person.setCategory("");
        person.setReligion("");
        person.setPhone(bill.path("mobileNumber").asText());
        person.setEmail("");
        person.setPhoto("");
        
        Address pAddr = new Address();
        pAddr.setType(PERSON_ADDR_TYPE); // Replaced "permanent"
        pAddr.setLine1("");
        pAddr.setLine2("");
        pAddr.setHouse("");
        pAddr.setLandmark("");
        pAddr.setLocality(bill.path("address").path("locality").asText(""));
        pAddr.setVtc("");
        pAddr.setPin("");
        pAddr.setDistrict(bill.path("tenantId").asText());
        pAddr.setState(PERSON_STATE); // Replaced "Punjab"
        pAddr.setCountry("IN");
        person.setAddress(pAddr);

        IssuedTo issuedTo = new IssuedTo();
        issuedTo.setPerson(person);
        cert.setIssuedTo(issuedTo);

        CertificateData data = new CertificateData();
        WaterSewerageBill wsBill = new WaterSewerageBill(); 
        
        wsBill.setConsumerNo(bill.path("consumerCode").asText(""));
        wsBill.setConsumerName(bill.path("payerName").asText(""));
        wsBill.setMobileNumber(bill.path("mobileNumber").asText(""));
        wsBill.setAddress(bill.path("payerAddress").asText(""));
        wsBill.setBillNumber(bill.path("billNumber").asText(""));
        wsBill.setBillAmount(bill.path("totalAmount").asText("0.0"));
        wsBill.setBillDate(formattedBillDate);
        wsBill.setStatus(bill.path("status").asText(""));
        
        data.setWaterSewerageBill(wsBill);
        cert.setCertificateData(data);

        return cert;
    }

    // --- Core Helper Methods ---

    private void extractUriDetails(SearchCriteria sc) {
        if (sc.getURI() != null && !sc.getURI().isEmpty()) {
            String[] uriParts = sc.getURI().split("-");
            String docType = uriParts[1];
            sc.setDocType(docType);
            
            String rawIdData = uriParts[2]; 
            String[] qwParts = rawIdData.split("QW");
            
            if (DIGILOCKER_DOCTYPE.equalsIgnoreCase(docType)) { // Replaced "PRTAX"
                sc.setPropertyId("PT-" + qwParts[1] + "-" + qwParts[2]);
                sc.setCity(qwParts[3]);
            } else {
                sc.setPropertyId(docType + "-" + qwParts[1]); 
                sc.setCity(qwParts[2]);
            }
        }
    }

    private String buildFinalResponse(ResponseStatus status, DocDetailsResponse docDetails, boolean isUriRequest) {
        if (isUriRequest) {
            PullURIResponse res = new PullURIResponse();
            res.setResponseStatus(status);
            res.setDocDetails(docDetails);
            return xstream.toXML(res);
        } else {
            PullDocResponse res = new PullDocResponse();
            res.setResponseStatus(status);
            res.setDocDetails(docDetails);
            return xstream.toXML(res);
        }
    }

    private String downloadAndEncodePdf(String urlString) throws IOException {
        URL url = java.net.URI.create(urlString).toURL();
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestProperty("User-Agent", "Mozilla/5.0");
        connection.setRequestProperty("Accept", "*/*");
        connection.setConnectTimeout(10000); 
        connection.setReadTimeout(10000);

        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new IOException("Server returned HTTP " + responseCode);
        }

        try (InputStream is = connection.getInputStream(); 
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            byte[] data = new byte[8192];
            int nRead;
            while ((nRead = is.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            return Base64.getEncoder().encodeToString(buffer.toByteArray());
        } finally {
            connection.disconnect();
        }
    }
    
    private boolean isValidResponse(SearchCriteria sc, List<Payment> payments) {
        if (payments.isEmpty()) return false;
        if ("FALSE".equalsIgnoreCase(configurations.getValidationFlag())) return true;
        
        Payment latest = payments.get(0);
        return Objects.equals(sc.getPayerName(), latest.getPayerName()) &&
               Objects.equals(sc.getMobile(), latest.getMobileNumber());
    }

    private RequestInfoWrapper prepareRequestInfo() {
        UserResponse user = userService.getUser();
        RequestInfo info = new RequestInfo();
        info.setApiId(API_ID); // Replaced "Rainmaker" constant string with the actual API_ID from the Constants file
        // Using String.format and the MSG_ID_PATTERN constant instead of hardcoded strings
        info.setMsgId(String.format(MSG_ID_PATTERN, System.currentTimeMillis()));
        info.setAuthToken(user.getAuthToken());
        info.setUserInfo(user.getUser());
        
        RequestInfoWrapper wrapper = new RequestInfoWrapper();
        wrapper.setRequestInfo(info);
        return wrapper;
    }

    private String generateErrorResponse(String txnId, boolean isUriRequest) {
    	ResponseStatus status = new ResponseStatus(getFormattedNow(), txnId, "0");
    	response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        if (isUriRequest) {
            PullURIResponse res = new PullURIResponse();
            res.setResponseStatus(status);
            return xstream.toXML(res);
        } else {
            PullDocResponse res = new PullDocResponse();
            res.setResponseStatus(status);
            return xstream.toXML(res);
        }
    }

    private String getFormattedNow() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern(TIMESTAMP_PATTERN));
    }

    private Certificate populateCertificate(Payment payment) {
        Certificate cert = new Certificate();
        cert.setLanguage(LANGUAGE_CODE); // Replaced "99"
        cert.setname("Property Tax Receipt");
        cert.setType(DIGILOCKER_DOCTYPE); // Replaced "PRTAX"
        cert.setNumber("");
        cert.setPrevNumber("");
        cert.setIssueDate(new SimpleDateFormat("dd-MM-yyyy").format(new Date()));
        cert.setExpiryDate("");
        cert.setValidFromDate("");
        cert.setIssuedAt(payment.getTenantId());
        cert.setStatus(CERT_STATUS_ACTIVE); // Replaced "A"

        Organization org = new Organization();
        org.setName(ISSUER_ORG_NAME); // Replaced "Punjab Municipal..."
        org.setType(ISSUER_ORG_TYPE); // Replaced "SG"
        org.setTin("");
        org.setCode("");
        org.setuuid("");
        
        Address orgAddr = new Address();
        orgAddr.setType("");
        orgAddr.setLine1("");
        orgAddr.setLine2("");
        orgAddr.setHouse("");
        orgAddr.setLandmark("");
        orgAddr.setLocality("");
        orgAddr.setVtc("");
        orgAddr.setPin(ISSUER_PIN); // Replaced "160022"
        orgAddr.setDistrict(ISSUER_DISTRICT); // Replaced "Chandigarh"
        orgAddr.setState(ISSUER_STATE); // Replaced "Chandigarh"
        orgAddr.setCountry("IN");
        org.setAddress(orgAddr);

        IssuedBy issuer = new IssuedBy();
        issuer.setOrganisation(org);
        cert.setIssuedBy(issuer);

        Person person = new Person();
        person.setUid("");
        person.setTitle("");
        person.setName(payment.getPayerName());
        person.setDob("");
        person.setAge("");
        person.setSwd("");
        person.setSwdIndicator("");
        person.setMotherName("");
        person.setGender("");
        person.setMaritalStatus("");
        person.setRelationWithHof("");
        person.setDisabilityStatus("");
        person.setCategory("");
        person.setReligion("");
        person.setPhone(payment.getMobileNumber());
        person.setEmail(payment.getPayerEmail() != null ? payment.getPayerEmail() : "");
        person.setPhoto("");
        
        Address pAddr = new Address();
        pAddr.setType(PERSON_ADDR_TYPE); // Replaced "permanent"
        pAddr.setLine1("");
        pAddr.setLine2("");
        pAddr.setHouse("");
        pAddr.setLandmark("");
        pAddr.setLocality("");
        pAddr.setVtc("");
        pAddr.setPin("");
        pAddr.setDistrict(payment.getTenantId());
        pAddr.setState(PERSON_STATE); // Replaced "Punjab"
        pAddr.setCountry("IN");
        person.setAddress(pAddr);

        IssuedTo recipient = new IssuedTo();
        recipient.setPerson(person);
        cert.setIssuedTo(recipient);

        PropertyTaxReceipt receipt = new PropertyTaxReceipt();
        receipt.setPaymentDate(payment.getPaymentDetails().get(0).getReceiptDate().toString());
        receipt.setServicetype(payment.getPaymentDetails().get(0).getBusinessService());
        receipt.setReceiptNo(payment.getPaymentDetails().get(0).getReceiptNumber());
        receipt.setPropertyID(payment.getPaymentDetails().get(0).getBill().getConsumerCode());
        receipt.setOwnerName(payment.getPayerName());
        receipt.setOwnerContact(payment.getMobileNumber());
        receipt.setPaymentstatus(payment.getPaymentStatus().toString());

        PaymentForReceipt pfr = new PaymentForReceipt();
        pfr.setPaymentMode(payment.getPaymentMode().toString());
        String billingPeriod = (payment.getPaymentDetails().get(0).getBill().getBillDetails().get(0).getFromPeriod().toString()) + "-" +
                               (payment.getPaymentDetails().get(0).getBill().getBillDetails().get(0).getToPeriod().toString());
        pfr.setBillingPeriod(billingPeriod);
        pfr.setPropertyTaxAmount(payment.getTotalDue().toString());
        pfr.setPaidAmount(payment.getTotalAmountPaid().toString());
        pfr.setPendingAmount((payment.getTotalDue().subtract(payment.getTotalAmountPaid())).toString());
        pfr.setExcessAmount("");
        pfr.setTransactionID(payment.getTransactionNumber());
        pfr.setG8ReceiptDate(payment.getPaymentDetails().get(0).getManualReceiptNumber());
        pfr.setG8ReceiptNo(payment.getPaymentDetails().get(0).getManualReceiptDate().toString());
        
        receipt.setPaymentForReceipt(pfr);

        CertificateData data = new CertificateData();
        data.setPropertyTaxReceipt(receipt);
        cert.setCertificateData(data);

        return cert;
    }
}