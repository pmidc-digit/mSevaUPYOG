package org.egov.pg.service.gateways.ccAvanue;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonObject;

import lombok.extern.slf4j.Slf4j;

import org.egov.pg.constants.PgConstants;
import org.egov.pg.models.Transaction;
import org.egov.pg.service.Gateway;
import org.egov.pg.utils.Utils;
import org.egov.tracer.model.CustomException;
import org.egov.tracer.model.ServiceCallException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.postgresql.jdbc.PgArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.ArrayList;
import java.util.List;
import java.net.URISyntaxException;
import java.util.UUID;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import java.io.IOException;
import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Objects;

import static java.util.Objects.isNull;

import javax.net.ssl.HttpsURLConnection;
import org.egov.pg.repository.ServiceCallRepository;
import org.egov.pg.service.gateways.ccAvanue.AesUtil;
import org.egov.pg.service.gateways.ccAvanue.ccAvanueresponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.DataOutputStream;

@Service
@Slf4j
public class ccAvanueGateway implements Gateway {

    private final String GATEWAY_NAME = "CCAVANUE";
    private final String MERCHANT_KEY_ID;
    private final String MERCHANT_WORKING_KEY;
    private final String MERCHANT_ACCESS_CODE ;
    private final String MERCHANT_URL_PAY;
    private final String MERCHANT_URL_STATUS;
    private final String MERCHANT_PATH_PAY;
    private final String MERCHANT_PATH_STATUS ;
    private final boolean ACTIVE;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    @Autowired
    public ccAvanueGateway(RestTemplate restTemplate, Environment environment, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.ACTIVE = Boolean.valueOf(environment.getRequiredProperty("ccavanue.active"));
        this.MERCHANT_WORKING_KEY = environment.getRequiredProperty("ccavanue.merchant.workingkey");
        this.MERCHANT_KEY_ID = environment.getRequiredProperty("ccavanue.merchant.id");
        this.MERCHANT_ACCESS_CODE = environment.getRequiredProperty("ccavanue.merchant.accesscode");
        this.MERCHANT_URL_PAY = environment.getRequiredProperty("ccavanue.url");
        this.MERCHANT_URL_STATUS = environment.getRequiredProperty("ccavanue.url.status");
        this.MERCHANT_PATH_PAY = environment.getRequiredProperty("ccavanue.path.pay");
        this.MERCHANT_PATH_STATUS = environment.getRequiredProperty("ccavanue.path.status");
    }
    class KeyValuePair {
        private String key;
        private String value;

        public KeyValuePair(String key, String value) {
            this.key = key;
            this.value = value;
        }

        public String getKey() {
            return key;
        }

        public String getValue() {
            return value;
        }
    }
	
    @Override
    public URI generateRedirectURI(Transaction transaction) {
 String tid = generateTID();
         System.out.println("Transaction ID: " + tid);
         
         try {
             Thread.sleep(10000); 
         } catch (InterruptedException e) {
             e.printStackTrace();
         }
         
      
         boolean isValid = isTIDValid(tid);
         System.out.println("Is TID valid? " + isValid);
    	 String hashSequence = "merchant_id|order_id|currency|amount|redirect_url|cancel_url|language||||||||||";
        hashSequence = hashSequence.replace("merchant_id", MERCHANT_ACCESS_CODE);
        hashSequence = hashSequence.replace("order_id", transaction.getTxnId());
        hashSequence = hashSequence.replace("currency", transaction.getTxnId());
        hashSequence = hashSequence.replace("amount", Utils.formatAmtAsRupee(transaction.getTxnAmount()));
        hashSequence = hashSequence.replace("redirect_url", "");
        hashSequence = hashSequence.replace("cancel_url", transaction.getUser().getName());
        hashSequence = hashSequence.replace("language", Objects.toString(transaction.getUser().getEmailId(), ""));

        String hash = hashCal(hashSequence);

        transaction.setGateway("CCAVANUE");

        List<KeyValuePair> pairList = new ArrayList<>();
        String ccaRequest="";
        // Adding elements to the list
	pairList.add(new KeyValuePair("tid", tid));   
        pairList.add(new KeyValuePair("merchant_id", MERCHANT_KEY_ID));
        pairList.add(new KeyValuePair("order_id",transaction.getTxnId()));
        pairList.add(new KeyValuePair("currency", "INR"));
        pairList.add(new KeyValuePair("amount",Utils.formatAmtAsRupee(transaction.getTxnAmount())));
        pairList.add(new KeyValuePair("redirect_url",  transaction.getCallbackUrl()));
        pairList.add(new KeyValuePair("cancel_url",  transaction.getCallbackUrl()));
        pairList.add(new KeyValuePair("language", "EN"));

        pairList.add(new KeyValuePair("billing_name", transaction.getUser().getName()));
        pairList.add(new KeyValuePair("billing_address",transaction.getUser().getTenantId()));
        pairList.add(new KeyValuePair("billing_city",transaction.getUser().getTenantId()));
        pairList.add(new KeyValuePair("billing_state","Punjab"));
        pairList.add(new KeyValuePair("billing_zip", ""));
        pairList.add(new KeyValuePair("billing_country", "INDIA"));
        pairList.add(new KeyValuePair("billing_tel",transaction.getUser().getMobileNumber()));
        pairList.add(new KeyValuePair("billing_email", transaction.getUser().getEmailId()));
        
        pairList.add(new KeyValuePair("delivery_name", transaction.getUser().getName()));
        pairList.add(new KeyValuePair("delivery_address",transaction.getUser().getTenantId()));
        pairList.add(new KeyValuePair("delivery_city",transaction.getUser().getTenantId()));
        pairList.add(new KeyValuePair("delivery_state","Punjab"));
        pairList.add(new KeyValuePair("delivery_zip",  ""));
        pairList.add(new KeyValuePair("delivery_country",  "India"));
        pairList.add(new KeyValuePair("delivery_tel", transaction.getUser().getMobileNumber()));
        pairList.add(new KeyValuePair("merchant_param1", transaction.getUser().getEmailId()));
        
        
        pairList.add(new KeyValuePair("promo_code", ""));
        pairList.add(new KeyValuePair("customer_identifier", transaction.getConsumerCode()));
        
        int andValue= 0;
        for (KeyValuePair pair : pairList) {   	 
        	 ccaRequest = ccaRequest + pair.getKey() + "=" + pair.getValue();
        	 if(andValue<(pairList.size()-1)) {
        		ccaRequest = ccaRequest + "&";
        	 }       
        	  andValue++;
        	  log.info("Key: " + pair.getKey() + ", Value: " + pair.getValue());
        }
        AesUtil aesUtil=new AesUtil(MERCHANT_WORKING_KEY);
   	 		String encRequest = aesUtil.encrypt(ccaRequest);
			MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
			params.add("command", "initiateTransaction");
			params.add("encRequest", encRequest);
			params.add("access_code", MERCHANT_ACCESS_CODE);
        UriComponents uriComponents = UriComponentsBuilder.newInstance().scheme("https").host(MERCHANT_URL_PAY).path
                (MERCHANT_PATH_PAY).build();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
          
            String finalurl=uriComponents.toString()+"command=initiateTransaction&encRequest="+encRequest+"&access_code="+MERCHANT_ACCESS_CODE;
            URI redirectUri=null;
			try {
				redirectUri = new URI(finalurl);
			} catch (URISyntaxException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
            if(isNull(redirectUri))
                throw new CustomException("CCAVANUE_REDIRECT_URI_GEN_FAILED", "Failed to generate redirect URI");
            else
                return redirectUri;


        } catch (RestClientException e){
            log.error("Unable to retrieve redirect URI from gateway", e);
            throw new ServiceCallException( "Redirect URI generation failed, invalid response received from gateway");
        }
    }
   private String generateTID() {
    	  // Generate a unique UUID as a transaction ID
        //String tid = UUID.randomUUID().toString();
        // Get the current timestamp
        long currentTimeMillis = System.currentTimeMillis();
        // Add 24 hours to the current time
        long expirationTimeMillis = currentTimeMillis + (24 * 60 * 60 * 1000);
        // Include expiration time in the TID
       // tid += "|" + expirationTimeMillis;
	String tid = String.valueOf(expirationTimeMillis);
        return tid;
	}
    public static boolean isTIDValid(String tid) {
        // Split the TID to extract expiration time
        String[] parts = tid.split("\\|");
        if (parts.length != 2) {
            return false; // Invalid format
        }
        // Extract expiration time
        long expirationTimeMillis = Long.parseLong(parts[1]);
        // Get the current time
        long currentTimeMillis = System.currentTimeMillis();
        // Check if the current time is within the validity period
        return currentTimeMillis <= expirationTimeMillis;
    }

    
    @Override
    public Transaction fetchStatus(Transaction currentStatus, Map<String, String> params) {
       		 Transaction txn =null;     
             String vResponse="";
 		 
	         AesUtil aesUtilenc=new AesUtil(MERCHANT_WORKING_KEY);

	         String txnId = currentStatus.getTxnId(); 
	         String[] parts = txnId.split("_"); // Split the transaction ID by "_"
	         String datePart = parts[2] + "_" + parts[3] + "_" + parts[4]; 

	         // Convert to DD-MM-YYYY format
	         String[] dateComponents = datePart.split("_"); 
	         String formattedDate = dateComponents[2] + "-" + dateComponents[1] + "-" + dateComponents[0];
	         String encRequest = aesUtilenc.encrypt("{'order_no': '" + txnId + "'}");  
	         StringBuffer wsDataBuff = new StringBuffer();
	         wsDataBuff.append("enc_request=" + encRequest +
	                           "&access_code=" + MERCHANT_ACCESS_CODE +
	                           "&command=" + PgConstants.CCAVENUE_PCOMMAND +
	                           "&response_type=" + PgConstants.CCAVENUE_TYPE +
	                           "&request_type=" + PgConstants.CCAVENUE_TYPE +
	                           "&version=" + PgConstants.CCAVENUE_VERSION +
	                           "&from_date=" + formattedDate);
  	     try {
  	    	 
			  vResponse = processUrlConnectionReq(wsDataBuff.toString(), MERCHANT_URL_STATUS);
	  	      String[] keyValuePairs = vResponse.toString().split("&");
	      	  String resp = keyValuePairs[1];
	          String decResp = aesUtilenc.decrypt(resp.substring(13, resp.length()));
	       
	          JSONObject jsonResponse = new JSONObject(decResp);

	   
	       		 txn =  transformRawResponseNew(jsonResponse,currentStatus); 
	         	 return txn; 
  	     
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	    
		return txn;
    }
 
 public Transaction fetchStatusByReferenceNo(Transaction currentStatus, Map<String, String> params) {
	 Transaction txn =null;
      String ccaRequest="";         
   //   String orderId= currentStatus.getTxnId();
      String encResp = params.get("encResp");
      AesUtil aesUtilenc=new AesUtil(MERCHANT_WORKING_KEY);
      String decRespp = aesUtilenc.decrypt(encResp);
		  log.info(decRespp);
		  String[] keyValuePairs2 = decRespp.split(",");
		  String referenceno = keyValuePairs2[0];
		  log.info("Reference no is"+referenceno);
		  referenceno = referenceno.substring(17, (referenceno.length())-1);
		  log.info("correct Reference no is"+referenceno);
	      ccaRequest =  "{'reference_no': '"+referenceno+"'}";    

	      String pCommand="orderStatusTracker";
	      String pRequestType="JSON";
	      String pResponseType="JSON";
	      String pVersion="1.2";
	      String vResponse="";


	String encRequest = aesUtilenc.encrypt(ccaRequest);
	System.out.println("ENC REq "+encRequest);  
	StringBuffer wsDataBuff=new StringBuffer();
	wsDataBuff.append("enc_request="+encRequest+"&access_code="+MERCHANT_ACCESS_CODE+"&command="+pCommand+"&response_type="+pResponseType+"&request_type="+pRequestType+"&version="+pVersion);

 try {
            log.info("ENC WS Data Buff "+wsDataBuff.toString());
            log.info("Merchant URL "+MERCHANT_URL_STATUS);
	  vResponse = processUrlConnectionReq(wsDataBuff.toString(), MERCHANT_URL_STATUS);
     	log.info("Response: "+vResponse);
	      String[] keyValuePairs = vResponse.toString().split("&");
  		 //String[] keyValuePairs = response.toString().split("&");
     	  String resp = keyValuePairs[1];
    	   String status = keyValuePairs[0];
   	        log.info("Complete response: "+resp);
	        String resp1= resp.substring(13, resp.length());
      	        log.info("Response to decrypt: "+resp1);
     		 String decResp = aesUtilenc.decrypt(resp.substring(13, resp.length()));
     		 String[] keyValuePairs1 = decResp.split(",");
     		// List<String> keyValueList = Arrays.asList(keyValuePairs1);
     		 System.out.println(keyValuePairs1[1]);
     		 //txn =  transformRawResponseNew(keyValuePairs1, currentStatus,status); 
     		 return txn; 
} catch (Exception e) {
	// TODO Auto-generated catch block
	e.printStackTrace();
}
return txn;
}
 
 
 private String getRefNo(String encResp) {
	    AesUtil aesUtilenc=new AesUtil(MERCHANT_WORKING_KEY);
        String decRespp = aesUtilenc.decrypt(encResp);
		log.info(decRespp);
		String[] keyValuePairs2 = decRespp.split(",");
		String referenceno = keyValuePairs2[0];
		log.info("Reference no is"+referenceno);
		referenceno = referenceno.substring(17, (referenceno.length())-1);
		return referenceno;
}

public static String processUrlConnectionReq(String pBankData,String pBankUrl) throws Exception{
		URL	vUrl = null;
		URLConnection vHttpUrlConnection = null;
		DataOutputStream vPrintout = null;
		DataInputStream	vInput = null;
		StringBuffer vStringBuffer=null;
		vUrl = new URL(pBankUrl);

		if(vUrl.openConnection() instanceof HttpsURLConnection)
		{
			vHttpUrlConnection = (HttpsURLConnection)vUrl.openConnection();
		} 
		else
		{
			vHttpUrlConnection = (URLConnection)vUrl.openConnection();
		}
		vHttpUrlConnection.setDoInput(true);
		vHttpUrlConnection.setDoOutput(true);
		vHttpUrlConnection.setUseCaches(false);
		vHttpUrlConnection.connect();
		vPrintout = new DataOutputStream (vHttpUrlConnection.getOutputStream());
		vPrintout.writeBytes(pBankData);
		vPrintout.flush();
		vPrintout.close();
		try {
			BufferedReader bufferedreader = new BufferedReader(new InputStreamReader(vHttpUrlConnection.getInputStream()));
			vStringBuffer = new StringBuffer();
			String vRespData;
			while((vRespData = bufferedreader.readLine()) != null) 
				if(vRespData.length() != 0)
					vStringBuffer.append(vRespData.trim());
			bufferedreader.close();
			bufferedreader = null;
		}finally {  
			if (vInput != null)
				vInput.close(); 
			if (vHttpUrlConnection != null)  
				vHttpUrlConnection = null;  
		}  
		return vStringBuffer.toString();
	}
	
    
	

    @Override
    public boolean isActive() {
        return ACTIVE;
    }


    @Override
    public String gatewayName() {
        return GATEWAY_NAME;
    }

    @Override
    public String transactionIdKeyInResponse() {
        return "txnid";
    }


    private Transaction transformRawResponseNew(JSONObject response, Transaction currentStatus) {
        Transaction.TxnStatusEnum status;

        JSONArray orderStatusList = response.optJSONArray("order_Status_List");
        JSONObject lastSuccessfulOrder = null;

        // Check if any order status is "Shipped" or "Successful"
        if (orderStatusList != null) {
            for (int i = 0; i < orderStatusList.length(); i++) {
                JSONObject order = orderStatusList.optJSONObject(i);
                if (order != null) {
                    String orderStatus = order.optString("order_status");
                    if ("Successful".equalsIgnoreCase(orderStatus) || 
                        "Success".equalsIgnoreCase(orderStatus) || 
                        "Shipped".equalsIgnoreCase(orderStatus)) {
                        lastSuccessfulOrder = order; 
                    }
                }
            }
        }

        if (lastSuccessfulOrder != null) {
            status = Transaction.TxnStatusEnum.SUCCESS;
            return Transaction.builder()
                    .txnId(lastSuccessfulOrder.optString("order_no")) 
                    .txnAmount(lastSuccessfulOrder.optString("order_amt"))
                    .txnStatus(status)
                    .gatewayTxnId(lastSuccessfulOrder.optString("reference_no"))
                    .gatewayPaymentMode(lastSuccessfulOrder.optString("order_card_name"))
                    .gatewayStatusCode(lastSuccessfulOrder.optString("status"))
                    .gatewayStatusMsg(response.toString())
                    .responseJson(response)
                    .build();
        } else {
            return Transaction.builder()
                    .txnId(currentStatus.getTxnId())
                    .txnAmount(currentStatus.getTxnAmount())
                    .txnStatus(Transaction.TxnStatusEnum.FAILURE)
                    .gatewayTxnId(currentStatus.getGatewayTxnId())
                    .gatewayPaymentMode(currentStatus.getGatewayPaymentMode()) 
                    .gatewayStatusCode(currentStatus.getGatewayStatusCode()) 
                    .gatewayStatusMsg(response.toString()) 
                    .responseJson(response) 
                    .build();
        }
    }
    private Transaction transformRawResponse(ccAvanueresponse resp, Transaction currentStatus) {

        Transaction.TxnStatusEnum status;

        String gatewayStatus = resp.getStatus();

        if (gatewayStatus.equalsIgnoreCase("success")) {
            status = Transaction.TxnStatusEnum.SUCCESS;
            return Transaction.builder()
                    .txnId(currentStatus.getTxnId())
                    .txnAmount(resp.getTransaction_amount())
                    .txnStatus(status)
                    .gatewayTxnId(resp.getMihpayid())
                    .gatewayPaymentMode(resp.getMode())
                    .gatewayStatusCode(resp.getUnmappedstatus())
                    .gatewayStatusMsg(resp.getStatus())
                    .responseJson(resp)
                    .build();
        } else {
            status = Transaction.TxnStatusEnum.FAILURE;
            return Transaction.builder()
                    .txnId(currentStatus.getTxnId())
                    .txnAmount(resp.getTransaction_amount())
                    .txnStatus(status)
                    .gatewayTxnId(resp.getMihpayid())
                    .gatewayStatusCode(resp.getError_code())
                    .gatewayStatusMsg(resp.getError_Message())
                    .responseJson(resp)
                    .build();
        }

    }

    private Transaction fetchStatusFromGateway(Transaction currentStatus) {

        String txnRef = currentStatus.getTxnId();
        String hash = hashCal(MERCHANT_WORKING_KEY + "|"
                + "verify_payment" + "|"
                + txnRef + "|"
                + MERCHANT_ACCESS_CODE);


        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
        queryParams.add("form", "2");

        UriComponents uriComponents = UriComponentsBuilder.newInstance().scheme("https").host(MERCHANT_URL_STATUS).path
                (MERCHANT_PATH_STATUS).queryParams(queryParams).build();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("key", MERCHANT_WORKING_KEY);
            params.add("command", "verify_payment");
            params.add("hash", hash);
            params.add("var1", txnRef);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(uriComponents.toUriString(), entity, String.class);

            log.info(response.getBody());

            JsonNode CCAVANUERawResponse = objectMapper.readTree(response.getBody());
            JsonNode status = CCAVANUERawResponse.path("transaction_details").path(txnRef);

            if(status.isNull())
                throw new CustomException("FAILED_TO_FETCH_STATUS_FROM_GATEWAY",
                        "Unable to fetch status from payment gateway for txnid: "+ currentStatus.getTxnId());
            ccAvanueresponse CCAVANUERawResponses = objectMapper.treeToValue(status, ccAvanueresponse.class);

            return transformRawResponse(CCAVANUERawResponses, currentStatus);

        }catch (RestClientException | IOException e){
            log.error("Unable to fetch status from payment gateway for txnid: "+ currentStatus.getTxnId(), e);
            throw new ServiceCallException("Error occurred while fetching status from payment gateway");
        }
    }

    private String hashCal(String str) {
        byte[] hashSequence = str.getBytes();
        StringBuilder hexString = new StringBuilder();
        try {
            MessageDigest algorithm = MessageDigest.getInstance("SHA-512");
            algorithm.reset();
            algorithm.update(hashSequence);
            byte messageDigest[] = algorithm.digest();


            for (byte aMessageDigest : messageDigest) {
                String hex = Integer.toHexString(0xFF & aMessageDigest);
                if (hex.length() == 1) hexString.append("0");
                hexString.append(hex);
            }

        } catch (NoSuchAlgorithmException nsae) {
            log.error("Error occurred while generating hash "+str, nsae);
            throw new CustomException("CHECKSUM_GEN_FAILED", "Hash generation failed, gateway redirect URI " +
                    "cannot be generated");
        }

        return hexString.toString();
    }
	@Override
	public String generateRedirectFormData(Transaction transaction) {
		// TODO Auto-generated method stub
		return null;
	}

}
