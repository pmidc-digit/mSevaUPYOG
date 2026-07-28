package org.egov.pgr.utils;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Service
public class DGRApi {

    private final RestClient restClient = RestClient.create();

    public String apiCalling(String complaintId) {

        try {
            Map<String, String> request = Map.of(
                    "Complaint_Id", complaintId,
                    "Remarks", "Resolved Successfully",
                    "Status", "resolved"
            );

            return restClient.post()
                    .uri("http://devgrievanceapi.psegs.in/api/grievance/GetComplaintStatus_PMIDC")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);

        } catch (RestClientResponseException e) {
            // HTTP 4xx/5xx errors
            System.err.println("HTTP Error: " + e.getStatusCode());
            System.err.println("Response Body: " + e.getResponseBodyAsString());
            return null;

        } catch (RestClientException e) {
            // Connection, timeout, or other RestClient errors
            e.printStackTrace();
            return null;

        } catch (Exception e) {
            // Any unexpected exception
            e.printStackTrace();
            return null;
        }
    }
}