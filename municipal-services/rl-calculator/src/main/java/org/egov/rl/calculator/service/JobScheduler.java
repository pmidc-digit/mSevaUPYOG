package org.egov.rl.calculator.service;

import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JobScheduler {

	@Autowired
	NotificationService notificationService;

	@Autowired
	DemandService demandService;

	
	// Runs every day at 09:30 IST // 24 hr time
//	@Scheduled(cron = "0 50 8 * * *", zone = "Asia/Kolkata")
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	public void runEvery3DaysCron() {
		System.out.println("scheduller call");
//		demandService.generateBatchDemand(getOAuthToken());
//		demandService.sendNotificationAndUpdateDemand(getOAuthToken());
	}

	// Runs on 1st of every month at midnight IST
	@Scheduled(cron = "0 0 0 1 * *", zone = "Asia/Kolkata")
	public void runMonthlyOnFirst() {
		demandService.generateBatchDemand(getOAuthToken());
	}

	
	
	
	public RequestInfo getOAuthToken() {

		String url = "https://mseva-dev.lgpunjab.gov.in/user/oauth/token";

		// -------- BASIC AUTH (from Postman Authorization tab) --------
//       String clientId = "egov-user";       // ✅ replace if different
//       String clientSecret = "egov-secret";
		//
//       String auth = clientId + ":" + clientSecret;
//       String base64Auth = Base64.getEncoder()
//               .encodeToString(auth.getBytes(StandardCharsets.UTF_8));

		// -------- Headers --------
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		headers.add("Accept", "application/json, text/plain, */*");
		headers.add("Accept-Language", "en-GB,en-US;q=0.9,en;q=0.8");
		headers.add("Authorization", "Basic " + "ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0");
		headers.add("Origin", "https://sdc-uat.lgpunjab.gov.in");
		headers.add("Referer", "https://sdc-uat.lgpunjab.gov.in/digit-ui/");
		headers.add("Priority", "u=1, i");

		// -------- BODY (x-www-form-urlencoded) --------
		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("username", "ramesh123");
		body.add("password", "eGov@123");
		body.add("tenantId", "pb.testing");
		body.add("userType", "employee");
		body.add("grant_type", "password");

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

		RestTemplate restTemplate = new RestTemplate();

		return restTemplate.postForEntity(url, request, RequestInfo.class).getBody();
	}
}
