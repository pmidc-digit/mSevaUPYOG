package org.egov.rl.calculator.service;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.util.Configurations;
import org.egov.rl.calculator.util.NotificationUtil;
import org.egov.rl.calculator.util.RLConstants;
import org.egov.rl.calculator.web.models.*;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.egov.rl.calculator.web.models.demand.DemandDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

import static org.egov.rl.calculator.util.RLConstants.*;

@Slf4j
@Service
public class NotificationService {

	@Autowired
	private NotificationUtil notifUtil;

	@Autowired
	private Configurations configs;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private DemandRepository demandRepository;

	@Value("${notification.url:https://mseva-dev.lgpunjab.gov.in/digit-ui/select-language}")
	private String notificationURL;

	private static final String DEFAULT_DATE_FORMAT = "dd/MM/yyyy";
	private static final String DEFAULT_CYCLE_FORMAT = "MMM-yyyy";

	// Localization Codes
	public static final String CODE_OVERDUE_SMS = "rl.demand.overdue.penalty.sms";
	public static final String CODE_OVERDUE_EMAIL = "rl.demand.overdue.penalty.email";
	public static final String CODE_OVERDUE_DETAILED_SMS = "rl.demand.overdue.detailed.sms";
	public static final String CODE_OVERDUE_DETAILED_EMAIL = "rl.demand.overdue.detailed.email";
	public static final String CODE_BILL_GENERATED_SMS = "rl.demand.generated.sms";
	public static final String CODE_BILL_GENERATED_EMAIL = "rl.demand.generated.email";
	public static final String CODE_DUE_REMINDER_SMS = "rl.demand.due.reminder.sms";
	public static final String CODE_DUE_REMINDER_EMAIL = "rl.demand.due.reminder.email";

	// Fallback DLT Templates (Punjab mSeva)
	private static final String FALLBACK_OVERDUE_SMS = "Dear {1}, rent payment of Rs.{2} for Allotment No.{3} is overdue. Penalty of Rs.{4} applied. Pay now at {5} to avoid lease action - mSeva Punjab";
	private static final String FALLBACK_OVERDUE_DETAILED_SMS = "Dear {1}, your rent of Rs.{2} for property {3} is overdue since {4}. Penalty fee Rs.{5} levied. Total due Rs.{6}. Pay at {7} - {8}, Punjab";
	private static final String FALLBACK_BILL_GENERATED_SMS = "Dear {1}, rent bill of Rs.{2} for {3} has been generated for Allotment {4}. Due date is {5}. Pay online at {6} - mSeva Punjab";
	private static final String FALLBACK_DUE_REMINDER_SMS = "Dear {1}, friendly reminder that rent of Rs.{2} for Allotment {3} is due on {4}. Pay at {5} to avoid late fee penalty - mSeva Punjab";

	/**
	 * Sends Overdue Rent & Penalty Applied SMS and Email notifications to tenants
	 * after the NotificationJob executes penalty calculation.
	 */
	public void sendOverduePenaltyNotifications(RequestInfo requestInfo, String tenantId, List<Demand> demands) {
		if (CollectionUtils.isEmpty(demands)) {
			return;
		}

		List<String> consumerCodes = demands.stream()
				.map(Demand::getConsumerCode)
				.filter(Objects::nonNull)
				.distinct()
				.collect(Collectors.toList());

		Map<String, Owner> ownerMap = demandRepository.getOwnersByConsumerCodes(consumerCodes);

		// Collect all owner UUIDs to fetch decrypted user details from user service
		Set<String> uuidsToFetch = new HashSet<>();
		for (Demand demand : demands) {
			Owner owner = ownerMap.get(demand.getConsumerCode());
			if (owner != null && StringUtils.isNotBlank(owner.getUuid())) {
				uuidsToFetch.add(owner.getUuid());
			} else if (demand.getPayer() != null && StringUtils.isNotBlank(demand.getPayer().getUuid())) {
				uuidsToFetch.add(demand.getPayer().getUuid());
			}
		}

		Map<String, User> decryptedUsers = notifUtil.fetchUsersByUUIDs(uuidsToFetch, requestInfo, tenantId);
		log.info("Decrypted {} user(s) by UUID for overdue penalty notifications", decryptedUsers.size());

		String localizationMessages = getLocalizationSafely(tenantId, requestInfo);

		String smsTemplate = getTemplateSafely(CODE_OVERDUE_SMS, localizationMessages, FALLBACK_OVERDUE_SMS);
		String emailTemplate = getTemplateSafely(CODE_OVERDUE_EMAIL, localizationMessages, getFallbackOverdueEmail());

		List<SMSRequest> smsRequests = new LinkedList<>();
		List<EmailRequest> emailRequests = new LinkedList<>();
		SimpleDateFormat sdf = new SimpleDateFormat(DEFAULT_DATE_FORMAT);

		for (Demand demand : demands) {
			String consumerCode = demand.getConsumerCode();
			Owner owner = ownerMap.get(consumerCode);
			String ownerUuid = (owner != null && StringUtils.isNotBlank(owner.getUuid())) ? owner.getUuid() : 
					(demand.getPayer() != null ? demand.getPayer().getUuid() : null);

			User decryptedUser = ownerUuid != null ? decryptedUsers.get(ownerUuid) : null;

			String ownerName;
			String mobileNumber;
			String emailId;

			if (decryptedUser != null) {
				ownerName = StringUtils.isNotBlank(decryptedUser.getName()) ? decryptedUser.getName() : "Citizen";
				mobileNumber = StringUtils.isNotBlank(decryptedUser.getMobileNumber()) ? decryptedUser.getMobileNumber() : null;
				emailId = StringUtils.isNotBlank(decryptedUser.getEmailId()) ? decryptedUser.getEmailId() : null;
			} else {
				if (owner == null && demand.getPayer() != null) {
					owner = demand.getPayer();
				}
				ownerName = (owner != null && StringUtils.isNotBlank(owner.getName())) ? owner.getName() : "Citizen";
				mobileNumber = (owner != null && StringUtils.isNotBlank(owner.getMobileNumber())) ? owner.getMobileNumber() : null;
				emailId = (owner != null && StringUtils.isNotBlank(owner.getEmailId())) ? owner.getEmailId() : null;
			}

			// Cleanse encrypted values so ciphertext (e.g. 30048|...) never leaks into notifications
			if (isEncrypted(ownerName)) {
				ownerName = "Citizen";
			}
			if (isEncrypted(mobileNumber)) {
				log.warn("Mobile number for consumerCode {} is encrypted ({}) and could not be decrypted, skipping SMS", consumerCode, mobileNumber);
				mobileNumber = null;
			}
			if (isEncrypted(emailId)) {
				log.warn("Email for consumerCode {} is encrypted ({}) and could not be decrypted, skipping Email", consumerCode, emailId);
				emailId = null;
			}

			BigDecimal totalTax = demand.getDemandDetails().stream()
					.map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			BigDecimal penaltyFee = demand.getDemandDetails().stream()
					.filter(d -> RLConstants.PENALTY_FEE_RL_APPLICATION.equalsIgnoreCase(d.getTaxHeadMasterCode()))
					.map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			BigDecimal baseRent = totalTax.subtract(penaltyFee);
			String dueDateStr = demand.getTaxPeriodTo() != null ? sdf.format(new Date(demand.getTaxPeriodTo())) : "Due Date";
			String payUrl = buildPaymentUrl(tenantId, consumerCode);
			String ulbName = getCityName(tenantId);

			// 1. Prepare SMS
			if (mobileNumber != null && configs.getIsSMSNotificationEnabled()) {
				Map<String, String> smsPlaceholders = new HashMap<>();
				smsPlaceholders.put("{1}", ownerName);
				smsPlaceholders.put("{2}", baseRent.stripTrailingZeros().toPlainString());
				smsPlaceholders.put("{3}", consumerCode);
				smsPlaceholders.put("{4}", penaltyFee.stripTrailingZeros().toPlainString());
				smsPlaceholders.put("{5}", payUrl);
				smsPlaceholders.put("{6}", totalTax.stripTrailingZeros().toPlainString());
				smsPlaceholders.put("{7}", payUrl);
				smsPlaceholders.put("{8}", ulbName);

				String smsMsg = replacePlaceholders(smsTemplate, smsPlaceholders);
				smsRequests.add(SMSRequest.builder().mobileNumber(mobileNumber).message(smsMsg).build());
			}

			// 2. Prepare Email
			if (emailId != null && configs.getIsEmailNotificationEnabled()) {
				Map<String, String> emailPlaceholders = new HashMap<>();
				emailPlaceholders.put("{1}", ownerName);
				emailPlaceholders.put("{2}", baseRent.stripTrailingZeros().toPlainString());
				emailPlaceholders.put("{3}", consumerCode);
				emailPlaceholders.put("{4}", dueDateStr);
				emailPlaceholders.put("{5}", penaltyFee.stripTrailingZeros().toPlainString());
				emailPlaceholders.put("{6}", totalTax.stripTrailingZeros().toPlainString());
				emailPlaceholders.put("{7}", payUrl);
				emailPlaceholders.put("{8}", ulbName);

				String emailBody = replacePlaceholders(emailTemplate, emailPlaceholders);
				String subject = "URGENT: Overdue Rent Notice & Penalty Applied for Allotment No. " + consumerCode + " - mSeva Punjab";
				Email emailObj = Email.builder()
						.emailTo(Collections.singleton(emailId))
						.subject(subject)
						.body(emailBody)
						.isHTML(true)
						.build();
				emailRequests.add(new EmailRequest(requestInfo, emailObj));
			}
		}

		if (!smsRequests.isEmpty()) {
			log.info("Sending {} overdue penalty SMS notification(s) for tenant: {}", smsRequests.size(), tenantId);
			notifUtil.sendSMS(smsRequests);
		}

		if (!emailRequests.isEmpty()) {
			log.info("Sending {} overdue penalty Email notification(s) for tenant: {}", emailRequests.size(), tenantId);
			notifUtil.sendEmail(emailRequests);
		}
	}

	/**
	 * Sends Monthly Demand Generated SMS and Email notifications to tenants
	 * after the BulkDemandGenerationJob generates demands.
	 */
	public void sendBillGeneratedNotifications(RequestInfo requestInfo, List<Demand> demands) {
		if (CollectionUtils.isEmpty(demands)) {
			return;
		}

		String tenantId = demands.get(0).getTenantId();
		List<String> consumerCodes = demands.stream()
				.map(Demand::getConsumerCode)
				.filter(Objects::nonNull)
				.distinct()
				.collect(Collectors.toList());

		Map<String, Owner> ownerMap = demandRepository.getOwnersByConsumerCodes(consumerCodes);

		// Collect all owner UUIDs to fetch decrypted user details from user service
		Set<String> uuidsToFetch = new HashSet<>();
		for (Demand demand : demands) {
			Owner owner = ownerMap.get(demand.getConsumerCode());
			if (owner != null && StringUtils.isNotBlank(owner.getUuid())) {
				uuidsToFetch.add(owner.getUuid());
			} else if (demand.getPayer() != null && StringUtils.isNotBlank(demand.getPayer().getUuid())) {
				uuidsToFetch.add(demand.getPayer().getUuid());
			}
		}

		Map<String, User> decryptedUsers = notifUtil.fetchUsersByUUIDs(uuidsToFetch, requestInfo, tenantId);
		log.info("Decrypted {} user(s) by UUID for bill generated notifications", decryptedUsers.size());

		String localizationMessages = getLocalizationSafely(tenantId, requestInfo);

		String smsTemplate = getTemplateSafely(CODE_BILL_GENERATED_SMS, localizationMessages, FALLBACK_BILL_GENERATED_SMS);
		String emailTemplate = getTemplateSafely(CODE_BILL_GENERATED_EMAIL, localizationMessages, getFallbackBillEmail());

		List<SMSRequest> smsRequests = new LinkedList<>();
		List<EmailRequest> emailRequests = new LinkedList<>();
		SimpleDateFormat sdf = new SimpleDateFormat(DEFAULT_DATE_FORMAT);

		for (Demand demand : demands) {
			String consumerCode = demand.getConsumerCode();
			Owner owner = ownerMap.get(consumerCode);
			String ownerUuid = (owner != null && StringUtils.isNotBlank(owner.getUuid())) ? owner.getUuid() : 
					(demand.getPayer() != null ? demand.getPayer().getUuid() : null);

			User decryptedUser = ownerUuid != null ? decryptedUsers.get(ownerUuid) : null;

			String ownerName;
			String mobileNumber;
			String emailId;

			if (decryptedUser != null) {
				ownerName = StringUtils.isNotBlank(decryptedUser.getName()) ? decryptedUser.getName() : "Citizen";
				mobileNumber = StringUtils.isNotBlank(decryptedUser.getMobileNumber()) ? decryptedUser.getMobileNumber() : null;
				emailId = StringUtils.isNotBlank(decryptedUser.getEmailId()) ? decryptedUser.getEmailId() : null;
			} else {
				if (owner == null && demand.getPayer() != null) {
					owner = demand.getPayer();
				}
				ownerName = (owner != null && StringUtils.isNotBlank(owner.getName())) ? owner.getName() : "Citizen";
				mobileNumber = (owner != null && StringUtils.isNotBlank(owner.getMobileNumber())) ? owner.getMobileNumber() : null;
				emailId = (owner != null && StringUtils.isNotBlank(owner.getEmailId())) ? owner.getEmailId() : null;
			}

			// Cleanse encrypted values so ciphertext (e.g. 30048|...) never leaks into notifications
			if (isEncrypted(ownerName)) {
				ownerName = "Citizen";
			}
			if (isEncrypted(mobileNumber)) {
				log.warn("Mobile number for consumerCode {} is encrypted ({}) and could not be decrypted, skipping SMS", consumerCode, mobileNumber);
				mobileNumber = null;
			}
			if (isEncrypted(emailId)) {
				log.warn("Email for consumerCode {} is encrypted ({}) and could not be decrypted, skipping Email", consumerCode, emailId);
				emailId = null;
			}

			BigDecimal totalTax = demand.getDemandDetails().stream()
					.map(DemandDetail::getTaxAmount)
					.reduce(BigDecimal.ZERO, BigDecimal::add);

			String billingCycle = formatBillingCycle(demand.getTaxPeriodFrom());
			String dueDateStr = demand.getTaxPeriodTo() != null ? sdf.format(new Date(demand.getTaxPeriodTo())) : "Due Date";
			String payUrl = buildPaymentUrl(tenantId, consumerCode);
			String ulbName = getCityName(tenantId);

			// 1. Prepare SMS
			if (mobileNumber != null && configs.getIsSMSNotificationEnabled()) {
				Map<String, String> smsPlaceholders = new HashMap<>();
				smsPlaceholders.put("{1}", ownerName);
				smsPlaceholders.put("{2}", totalTax.stripTrailingZeros().toPlainString());
				smsPlaceholders.put("{3}", billingCycle);
				smsPlaceholders.put("{4}", consumerCode);
				smsPlaceholders.put("{5}", dueDateStr);
				smsPlaceholders.put("{6}", payUrl);
				smsPlaceholders.put("{7}", payUrl);
				smsPlaceholders.put("{8}", ulbName);

				String smsMsg = replacePlaceholders(smsTemplate, smsPlaceholders);
				smsRequests.add(SMSRequest.builder().mobileNumber(mobileNumber).message(smsMsg).build());
			}

			// 2. Prepare Email
			if (emailId != null && configs.getIsEmailNotificationEnabled()) {
				Map<String, String> emailPlaceholders = new HashMap<>();
				emailPlaceholders.put("{1}", ownerName);
				emailPlaceholders.put("{2}", totalTax.stripTrailingZeros().toPlainString());
				emailPlaceholders.put("{3}", consumerCode);
				emailPlaceholders.put("{4}", billingCycle);
				emailPlaceholders.put("{DUE_DATE}", dueDateStr);
				emailPlaceholders.put("{5}", dueDateStr);
				emailPlaceholders.put("{6}", totalTax.stripTrailingZeros().toPlainString());
				emailPlaceholders.put("{7}", payUrl);
				emailPlaceholders.put("{8}", ulbName);

				String emailBody = replacePlaceholders(emailTemplate, emailPlaceholders);
				String subject = "Monthly Rent Demand Notice for " + billingCycle + " (Allotment No. " + consumerCode + ") - mSeva Punjab";
				Email emailObj = Email.builder()
						.emailTo(Collections.singleton(emailId))
						.subject(subject)
						.body(emailBody)
						.isHTML(true)
						.build();
				emailRequests.add(new EmailRequest(requestInfo, emailObj));
			}
		}

		if (!smsRequests.isEmpty()) {
			log.info("Sending {} bill generated SMS notification(s) for tenant: {}", smsRequests.size(), tenantId);
			notifUtil.sendSMS(smsRequests);
		}

		if (!emailRequests.isEmpty()) {
			log.info("Sending {} bill generated Email notification(s) for tenant: {}", emailRequests.size(), tenantId);
			notifUtil.sendEmail(emailRequests);
		}
	}

	public void sendNotificationSMS(AllotmentRequest allotmentRequest) {
		String msg = notifUtil.getLocalizationMessages(allotmentRequest.getAllotment().get(0).getTenantId(),
				allotmentRequest.getRequestInfo());
		if (!StringUtils.isEmpty(msg)) {
			prepareMsgAndSend(allotmentRequest, msg);
		}
	}

	private void prepareMsgAndSend(AllotmentRequest request, String msg) {
		AllotmentDetails allotmentDetails = request.getAllotment().get(0);
		RequestInfo requestInfo = request.getRequestInfo();
		Map<String, String> mobileNumberToOwner = new HashMap<>();
		String tenantId = allotmentDetails.getTenantId();
		String moduleName = "rl-services";
		String action = "RLREMENDER";
		msg = notifUtil.getMessageTemplate(action, msg);
		List<String> configuredChannelNames = notifUtil.fetchChannelList(requestInfo, tenantId, moduleName, action);
		List<SMSRequest> smsRequests = notifUtil.createSMSRequest(msg, mobileNumberToOwner);
		if (configuredChannelNames.contains(CHANNEL_NAME_SMS)) {
			log.info("Inside sms: " + smsRequests);
			notifUtil.sendSMS(smsRequests);
		}
	}

	private String buildPaymentUrl(String tenantId, String consumerCode) {
		String baseUrl = StringUtils.isNotBlank(notificationURL) ? notificationURL : "https://mseva-dev.lgpunjab.gov.in/digit-ui/select-language";
		if (baseUrl.contains("select-language") || baseUrl.contains("my-properties")) {
			return "https://mseva-dev.lgpunjab.gov.in/digit-ui/select-language";
		}
		return baseUrl + "/" + consumerCode + "?tenantId=" + tenantId;
	}

	private String getCityName(String tenantId) {
		if (tenantId == null) return "Department of Local Government, Punjab";
		if (tenantId.contains(".")) {
			String city = tenantId.substring(tenantId.indexOf('.') + 1);
			return "Municipal Corporation " + city.substring(0, 1).toUpperCase() + city.substring(1).toLowerCase();
		}
		return "mSeva Punjab";
	}

	private String formatBillingCycle(Long epochMillis) {
		if (epochMillis == null) {
			return LocalDate.now().format(DateTimeFormatter.ofPattern(DEFAULT_CYCLE_FORMAT));
		}
		return Instant.ofEpochMilli(epochMillis)
				.atZone(ZoneId.of(RLConstants.TIME_ZONE))
				.toLocalDate()
				.format(DateTimeFormatter.ofPattern(DEFAULT_CYCLE_FORMAT));
	}

	private String replacePlaceholders(String template, Map<String, String> values) {
		if (StringUtils.isBlank(template)) {
			return "";
		}
		for (Map.Entry<String, String> entry : values.entrySet()) {
			template = template.replace(entry.getKey(), entry.getValue() != null ? entry.getValue() : "");
		}
		return template;
	}

	private String getLocalizationSafely(String tenantId, RequestInfo requestInfo) {
		try {
			return notifUtil.getLocalizationMessages(tenantId, requestInfo);
		} catch (Exception e) {
			log.warn("Could not fetch localization messages for tenant: {}", tenantId, e);
			return null;
		}
	}

	private String getTemplateSafely(String code, String localizationMessages, String fallback) {
		if (StringUtils.isNotBlank(localizationMessages)) {
			String t = notifUtil.getMessageTemplate(code, localizationMessages);
			if (StringUtils.isNotBlank(t)) {
				return t;
			}
		}
		return fallback;
	}

	private String getFallbackOverdueEmail() {
		return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Overdue Rent Notice</title></head>"
				+ "<body style=\"font-family:Arial,sans-serif;background-color:#f3f4f6;padding:20px;\">"
				+ "<div style=\"max-width:600px;background:#fff;margin:0 auto;border-radius:8px;padding:24px;border:1px solid #e5e7eb;\">"
				+ "<h2 style=\"color:#991b1b;\">⚠️ URGENT: Rent Overdue & Penalty Applied</h2>"
				+ "<p>Dear <strong>{1}</strong>,</p>"
				+ "<p>Your rent for Allotment No. <strong>{3}</strong> is overdue since <strong>{4}</strong>. A late penalty fee of Rs. {5} has been applied.</p>"
				+ "<p><strong>Total Outstanding: Rs. {6}</strong></p>"
				+ "<p><a href=\"{7}\" style=\"background:#dc2626;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;\">PAY OVERDUE RENT NOW &rarr;</a></p>"
				+ "<p style=\"font-size:12px;color:#6b7280;\">Direct link: {7}</p>"
				+ "<p>Regards,<br><strong>{8}</strong><br>Department of Local Government, Punjab</p>"
				+ "</div></body></html>";
	}

	private String getFallbackBillEmail() {
		return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Rent Bill Notice</title></head>"
				+ "<body style=\"font-family:Arial,sans-serif;background-color:#f3f4f6;padding:20px;\">"
				+ "<div style=\"max-width:600px;background:#fff;margin:0 auto;border-radius:8px;padding:24px;border:1px solid #e5e7eb;\">"
				+ "<h2 style=\"color:#1e40af;\">Monthly Rent Demand Notice</h2>"
				+ "<p>Dear <strong>{1}</strong>,</p>"
				+ "<p>Your rent bill for <strong>{4}</strong> has been generated for Allotment No. <strong>{3}</strong>.</p>"
				+ "<p><strong>Total Rent Payable: Rs. {2}</strong> (Due Date: {DUE_DATE})</p>"
				+ "<p><a href=\"{7}\" style=\"background:#16a34a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;\">VIEW BILL & PAY ONLINE &rarr;</a></p>"
				+ "<p style=\"font-size:12px;color:#6b7280;\">Direct link: {7}</p>"
				+ "<p>Regards,<br><strong>{8}</strong><br>Department of Local Government, Punjab</p>"
				+ "</div></body></html>";
	}

	private boolean isEncrypted(String value) {
		return value != null && value.contains("|") && value.indexOf('|') > 0;
	}
}
