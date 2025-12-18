package org.egov.tl.scheduler;

import java.util.List;
import java.util.Map;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.tl.service.TradeLicenseService;
import org.egov.tl.service.UserService;
import org.egov.tl.util.TLConstants;
import org.egov.tl.util.TradeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * Scheduler to automatically expire trade licenses that have reached their
 * expiration date.
 *
 * This job runs at a predefined interval (e.g., daily) to ensure licenses are
 * updated without manual intervention.
 *
 * @author Roshan Chaudhary
 */

@Component
@Slf4j
@EnableScheduling
public class TradeLicenseAutoExpiryScheduler {

	private UserService userService;

	private ObjectMapper mapper;

	private TradeUtil tradeUtil;

	private TradeLicenseService tradeLicenseService;

	@Autowired
	public TradeLicenseAutoExpiryScheduler(UserService userService, ObjectMapper mapper, TradeUtil tradeUtil,
			TradeLicenseService tradeLicenseService, TLConstants TLConstants) {
		super();
		this.userService = userService;
		this.mapper = mapper;
		this.tradeUtil = tradeUtil;
		this.tradeLicenseService = tradeLicenseService;
	}

	/**
	 * Expires trade licenses daily at 12:00 AM that have reached their expiration
	 * date.
	 *
	 * This scheduled task ensures that all licenses with an expiry date matching
	 * the current day are marked as expired automatically.
	 *
	 * @author Roshan Chaudhary
	 */

	@Scheduled(cron = "0 0 0 * * ?")
//	@Scheduled(initialDelay = 1000, fixedRate = 60000)
	public void expireTradeLicense() {
		log.info("Start Trade License Auto Expiration Scheduler....");
		
		RequestInfo requestInfo = getDefaultRequestInfo();
		List<Map<String, Object>> autoExpirationMdmsDataList = tradeUtil
				.fetchAutoExpirationMdmsData(requestInfo);

		autoExpirationMdmsDataList.forEach(autoExpirationMdmsData -> {
			String serviceName = (String)autoExpirationMdmsData.get("module");
			String jobname = (String)autoExpirationMdmsData.get("action");
			Long reminderPeriod = (Long)autoExpirationMdmsData.getOrDefault("reminderPeriod", 0l);
			
			if(jobname.equals(TLConstants.JOB_EXPIRY))
				tradeLicenseService.getLicensesAndExpire(serviceName, requestInfo);
			
		});

		log.info("End Trade License Auto Expiration Scheduler.");
	}

	/**
	 * Searches for the user with the username "SYSTEM" and generates a RequestInfo
	 * object based on this user.
	 *
	 * @return the default RequestInfo object associated with the SYSTEM user
	 *
	 * @author Roshan Chaudhary
	 */

	private RequestInfo getDefaultRequestInfo() {

		RequestInfo requestInfo = new RequestInfo();

		User ownerInfo = userService.searchSystemUser();
		User user = mapper.convertValue(ownerInfo, User.class);

		requestInfo.setApiId("Rainmaker");
		//Auth Token only for test on local system
		requestInfo.setAuthToken("df66006d-230b-46e5-b125-838aa9e24c0e");
		requestInfo.setUserInfo(user);
		return requestInfo;

	}

}
