package org.egov.wscalculation.service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.wscalculation.config.WSCalculationConfiguration;
import org.egov.wscalculation.constants.WSCalculationConstant;
import org.egov.wscalculation.producer.WSCalculationProducer;
import org.egov.wscalculation.util.NotificationUtil;
import org.egov.wscalculation.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DemandSchedulerNotificationService {

	@Autowired
	private WSCalculationConfiguration configs;

	@Autowired
	private WSCalculationProducer wsCalculationProducer;

	@Autowired
	private NotificationUtil notificationUtil;

	@Autowired
	private NamedParameterJdbcTemplate jdbcTemplate;

	private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##,##0.00");
	private static final DecimalFormat COUNT_FORMAT = new DecimalFormat("#,##,###");

	private Set<String> getToRecipients() {
		String recipients = configs.getMailRecipients();
		if (StringUtils.isBlank(recipients)) {
			recipients = "rabhi5067@gmail.com";
		}
		return Arrays.stream(recipients.split(","))
				.map(String::trim)
				.filter(StringUtils::isNotBlank)
				.collect(Collectors.toSet());
	}

	private Set<String> getCcRecipients() {
		String ccRecipients = configs.getMailCcRecipients();
		if (StringUtils.isBlank(ccRecipients)) {
			return Collections.emptySet();
		}
		return Arrays.stream(ccRecipients.split(","))
				.map(String::trim)
				.filter(StringUtils::isNotBlank)
				.collect(Collectors.toSet());
	}

	private String getCityName(String tenantId) {
		if (tenantId == null) return "Unknown";
		if (tenantId.contains(".")) {
			String city = tenantId.substring(tenantId.indexOf('.') + 1);
			return city.substring(0, 1).toUpperCase() + city.substring(1).toLowerCase();
		}
		return tenantId.substring(0, 1).toUpperCase() + tenantId.substring(1).toLowerCase();
	}

	/**
	 * Sends a single consolidated email containing all tenants and connection counts on scheduler hit.
	 * Template fetched strictly from localization service (message table).
	 */
	public void sendConsolidatedStartEmail(List<TenantDemandSummary> summaries, RequestInfo requestInfo) {
		if (configs.getIsEmailEnabled() == null || !configs.getIsEmailEnabled()) {
			log.info("Email notifications are disabled. Skipping start email.");
			return;
		}

		if (summaries == null || summaries.isEmpty()) {
			log.warn("No tenant summaries provided for consolidated start email.");
			return;
		}

		String primaryTenant = summaries.get(0).getTenantId();
		String localizationMessage = "";
		try {
			localizationMessage = notificationUtil.getLocalizationMessages(primaryTenant, requestInfo);
		} catch (Exception e) {
			log.warn("Failed to fetch localization messages for start email", e);
		}

		String template = notificationUtil.getMessageTemplate(WSCalculationConstant.WS_DEMAND_GEN_START_EMAIL_TEMPLATE, localizationMessage);
		if (StringUtils.isEmpty(template)) {
			log.warn("⚠️ {} not found in localization service (message table). Skipping start email.",
					WSCalculationConstant.WS_DEMAND_GEN_START_EMAIL_TEMPLATE);
			return;
		}

		int totalConnectionsAllTenants = summaries.stream().mapToInt(TenantDemandSummary::getConnectionCount).sum();
		int totalTenantsCount = summaries.size();
		String triggerDate = new SimpleDateFormat("dd-MMM-yyyy hh:mm a").format(new Date());

		StringBuilder tableRows = new StringBuilder();
		int sNo = 1;
		for (TenantDemandSummary summary : summaries) {
			String statusBadgeColor = "Scheduled".equalsIgnoreCase(summary.getStatus()) ? "#10b981" : "#f59e0b";
			tableRows.append("<tr style=\"border-bottom: 1px solid #e5e7eb;\">")
					.append("<td style=\"padding: 10px 12px; text-align: center;\">").append(sNo++).append("</td>")
					.append("<td style=\"padding: 10px 12px; font-weight: 600; color: #1f2937;\">").append(summary.getTenantId()).append("</td>")
					.append("<td style=\"padding: 10px 12px;\">").append(summary.getCityName() != null ? summary.getCityName() : getCityName(summary.getTenantId())).append("</td>")
					.append("<td style=\"padding: 10px 12px;\">").append(summary.getBillingCycle() != null ? summary.getBillingCycle() : "N/A").append("</td>")
					.append("<td style=\"padding: 10px 12px; text-align: right; font-weight: 600; color: #2563eb;\">").append(COUNT_FORMAT.format(summary.getConnectionCount())).append("</td>")
					.append("<td style=\"padding: 10px 12px; text-align: center;\"><span style=\"background-color: ").append(statusBadgeColor).append("20; color: ").append(statusBadgeColor).append("; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;\">").append(summary.getStatus()).append("</span></td>")
					.append("</tr>");
		}

		String customizedMsg = template
				.replace("{triggerDate}", triggerDate)
				.replace("{totalTenants}", String.valueOf(totalTenantsCount))
				.replace("{totalConnections}", COUNT_FORMAT.format(totalConnectionsAllTenants))
				.replace("{tenantRows}", tableRows.toString());

		String subject;
		String body;
		if (customizedMsg.contains("<h2>") && customizedMsg.contains("</h2>")) {
			subject = customizedMsg.substring(customizedMsg.indexOf("<h2>") + 4, customizedMsg.indexOf("</h2>"));
			body = customizedMsg.substring(customizedMsg.indexOf("</h2>") + 5);
		} else {
			subject = "Water Demand Generation Scheduled - Summary Report (" + new SimpleDateFormat("dd-MMM-yyyy").format(new Date()) + ")";
			body = customizedMsg;
		}

		Email email = Email.builder()
				.emailTo(getToRecipients())
				.emailCc(getCcRecipients())
				.subject(subject)
				.body(body)
				.isHTML(true)
				.build();

		wsCalculationProducer.push(configs.getEmailNotifyTopic(), EmailRequest.builder().requestInfo(requestInfo).email(email).build());
		log.info("📧 Consolidated start email pushed to Kafka topic {} (To: {}, Cc: {})", configs.getEmailNotifyTopic(), getToRecipients(), getCcRecipients());
	}

	public void sendStartEmail(String tenantId, Long from, Long to, int totalCount, RequestInfo requestInfo) {
		if (configs.getIsEmailEnabled() == null || !configs.getIsEmailEnabled()) return;

		String formattedFrom = new SimpleDateFormat("dd-MMM-yyyy").format(new Date(from));
		String formattedTo = new SimpleDateFormat("dd-MMM-yyyy").format(new Date(to));

		TenantDemandSummary singleSummary = TenantDemandSummary.builder()
				.tenantId(tenantId)
				.cityName(getCityName(tenantId))
				.billingCycle(formattedFrom + " to " + formattedTo)
				.taxPeriodFrom(from)
				.taxPeriodTo(to)
				.connectionCount(totalCount)
				.status("Scheduled")
				.build();

		sendConsolidatedStartEmail(Collections.singletonList(singleSummary), requestInfo);
	}

	/**
	 * Sends completion email per tenant with success, failure, and total revenue metrics.
	 * Template fetched strictly from localization service (message table).
	 */
	public void sendCompletionEmail(String tenantId, Long from, Long to, List<String> allConnectionNos, long startTime, RequestInfo requestInfo) {
		if (configs.getIsEmailEnabled() == null || !configs.getIsEmailEnabled()) return;

		CompletableFuture.runAsync(() -> {
			try {
				long totalCount = allConnectionNos != null ? allConnectionNos.size() : 0;
				long successCount = 0;
				BigDecimal totalAmount = BigDecimal.ZERO;

				// ── Wait for Kafka consumer to finish processing ──
				// The demands are pushed to Kafka topic and consumed asynchronously.
				// We must wait enough time for the consumer to pick up all batches,
				// call billing-service, and log results to eg_ws_batch_connection_log.
				long initialWaitMs = Math.max(60000, totalCount * 500L); // min 60s, or 0.5s per connection
				initialWaitMs = Math.min(initialWaitMs, 5 * 60 * 1000); // cap at 5 minutes
				log.info("📧 Waiting {}s for Kafka consumer to process {} connections for tenant: {}",
						initialWaitMs / 1000, totalCount, tenantId);

				try {
					Thread.sleep(initialWaitMs);
				} catch (InterruptedException ie) {
					Thread.currentThread().interrupt();
					log.error("❌ Initial wait interrupted for tenant: {}", tenantId);
					return;
				}

				// ── Poll for final stats (quick check after initial wait) ──
				long pollStartTime = System.currentTimeMillis();
				long prevSuccessCount = -1;
				int unchangedCount = 0;

				while (System.currentTimeMillis() - pollStartTime < 3 * 60 * 1000) { // max 3 min additional polling
					try {
						Map<String, Object> stats = getBatchStats(tenantId, from, to);
						successCount = ((Number) stats.getOrDefault("success_count", 0)).longValue();
						Object amtObj = stats.get("total_amount");
						totalAmount = amtObj != null ? new BigDecimal(amtObj.toString()) : BigDecimal.ZERO;

						// Fallback to direct demand table if batch log is empty
						if (successCount == 0 && totalCount > 0) {
							Map<String, Object> directStats = getDirectDemandStats(tenantId, from, to);
							long directSuccess = ((Number) directStats.getOrDefault("success_count", 0)).longValue();
							if (directSuccess > 0) {
								successCount = directSuccess;
								Object directAmt = directStats.get("total_amount");
								totalAmount = directAmt != null ? new BigDecimal(directAmt.toString()) : BigDecimal.ZERO;
							}
						}

						// All done
						if (successCount >= totalCount && totalCount > 0) {
							log.info("🎯 All {} connections processed for tenant: {}", totalCount, tenantId);
							break;
						}

						// Stabilization: only if successCount > 0 (never treat 0 as stable)
						if (successCount > 0 && successCount == prevSuccessCount) {
							unchangedCount++;
							if (unchangedCount >= 3) {
								log.info("📊 Demand processing stabilized for tenant {}: successCount={}, totalCount={}",
										tenantId, successCount, totalCount);
								break;
							}
						} else {
							unchangedCount = 0;
						}
						prevSuccessCount = successCount;

					} catch (Exception e) {
						log.error("⚠️ Error fetching batch stats during polling: {}", e.getMessage());
					}
					try {
						Thread.sleep(15000); // Poll every 15 seconds
					} catch (InterruptedException ie) {
						Thread.currentThread().interrupt();
						break;
					}
				}

			long failureCount = Math.max(0, totalCount - successCount);
			boolean timedOut = successCount == 0 && totalCount > 0;

			String localizationMessage = "";
			try {
				localizationMessage = notificationUtil.getLocalizationMessages(tenantId, requestInfo);
			} catch (Exception e) {
				log.warn("Failed to fetch localization messages", e);
			}

			String template = notificationUtil.getMessageTemplate(WSCalculationConstant.WS_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE, localizationMessage);
			if (StringUtils.isEmpty(template)) {
				log.warn("⚠️ {} not found in localization service (message table). Skipping completion email.",
						WSCalculationConstant.WS_DEMAND_GEN_COMPLETION_EMAIL_TEMPLATE);
				return;
			}

			Date fromDate = new Date(from);
			String billingCycle = new SimpleDateFormat("MMMM yyyy").format(fromDate);

			Calendar cal = Calendar.getInstance();
			cal.setTime(fromDate);
			int year = cal.get(Calendar.YEAR);
			String financialYear = year + "-" + ((year + 1) % 100);

			String generatedOn = new SimpleDateFormat("dd-MMM-yyyy hh:mm a").format(new Date(startTime));
			String completedOn = new SimpleDateFormat("dd-MMM-yyyy hh:mm a").format(new Date());

			long durationMs = System.currentTimeMillis() - startTime;
			long durationMin = (durationMs / 1000) / 60;
			long durationSec = (durationMs / 1000) % 60;
			String duration = durationMin + "m " + durationSec + "s";

			String statusLabel = timedOut ? "TIMEOUT" : (failureCount > 0 ? "PARTIALLY COMPLETED" : "SUCCESS");
			String statusColor = timedOut ? "#ef4444" : (failureCount > 0 ? "#f59e0b" : "#10b981");
			String cityName = getCityName(tenantId);

			double successPct = totalCount > 0 ? ((double) successCount / totalCount) * 100 : 0;
			String successPercentage = String.format("%.1f", successPct);

			String customizedMsg = template
					.replace("{tenantId}", tenantId)
					.replace("{cityName}", cityName)
					.replace("{billingCycle}", billingCycle)
					.replace("{financialYear}", financialYear)
					.replace("{generatedOn}", generatedOn)
					.replace("{completedOn}", completedOn)
					.replace("{duration}", duration)
					.replace("{statusLabel}", statusLabel)
					.replace("{statusColor}", statusColor)
					.replace("{totalCount}", String.valueOf(totalCount))
					.replace("{successCount}", String.valueOf(successCount))
					.replace("{failureCount}", String.valueOf(failureCount))
					.replace("{successPercentage}", successPercentage)
					.replace("{totalAmount}", CURRENCY_FORMAT.format(totalAmount))
					.replace("{failedConnectionsRows}", ""); // backward compat with old template

			String subject;
			String body;
			if (customizedMsg.contains("<h2>") && customizedMsg.contains("</h2>")) {
				subject = customizedMsg.substring(customizedMsg.indexOf("<h2>") + 4, customizedMsg.indexOf("</h2>"));
				body = customizedMsg.substring(customizedMsg.indexOf("</h2>") + 5);
			} else {
				subject = "Water Demand Generation Completed - " + cityName + " (" + billingCycle + ")";
				body = customizedMsg;
			}

			Email email = Email.builder()
					.emailTo(getToRecipients())
					.emailCc(getCcRecipients())
					.subject(subject)
					.body(body)
					.isHTML(true)
					.build();

			wsCalculationProducer.push(configs.getEmailNotifyTopic(), EmailRequest.builder().requestInfo(requestInfo).email(email).build());
			log.info("📧 Completion email notification pushed to Kafka for tenant: {} (To: {}, Cc: {})", tenantId, getToRecipients(), getCcRecipients());
		} catch (Exception e) {
			log.error("❌ Failed to process and send completion email for tenant: {} | {}", tenantId, e.getMessage(), e);
		}
		});
	}

	private Map<String, Object> getBatchStats(String tenantId, Long from, Long to) {
		String statsQuery = "SELECT COUNT(*) as success_count, COALESCE(SUM(taxamount), 0) as total_amount " +
				"FROM eg_ws_batch_connection_log " +
				"WHERE tenantid = :tenantId AND taxperiodfrom = :from AND taxperiodto = :to";

		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId);
		params.put("from", from);
		params.put("to", to);

		try {
			return jdbcTemplate.queryForMap(statsQuery, params);
		} catch (Exception e) {
			log.warn("⚠️ Error executing batch stats query on eg_ws_batch_connection_log: {}", e.getMessage());
			Map<String, Object> emptyMap = new HashMap<>();
			emptyMap.put("success_count", 0L);
			emptyMap.put("total_amount", BigDecimal.ZERO);
			return emptyMap;
		}
	}

	private Map<String, Object> getDirectDemandStats(String tenantId, Long from, Long to) {
		String query = "SELECT COUNT(DISTINCT d.consumercode) as success_count, COALESCE(SUM(dd.taxamount), 0) as total_amount " +
				"FROM egbs_demand_v1 d " +
				"INNER JOIN egbs_demanddetail_v1 dd ON dd.demandid = d.id " +
				"WHERE d.tenantid = :tenantId AND d.taxperiodfrom = :from AND d.taxperiodto = :to " +
				"AND d.businessservice = 'WS' AND d.status = 'ACTIVE'";

		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId);
		params.put("from", from);
		params.put("to", to);

		try {
			return jdbcTemplate.queryForMap(query, params);
		} catch (Exception e) {
			log.warn("⚠️ Direct demand stats query failed: {}", e.getMessage());
			Map<String, Object> emptyMap = new HashMap<>();
			emptyMap.put("success_count", 0L);
			emptyMap.put("total_amount", BigDecimal.ZERO);
			return emptyMap;
		}
	}

	private List<String> getSuccessfulConnectionNos(String tenantId, Long from, Long to) {
		String query = "SELECT connectionno FROM eg_ws_batch_connection_log " +
				"WHERE tenantid = :tenantId AND taxperiodfrom = :from AND taxperiodto = :to";

		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId);
		params.put("from", from);
		params.put("to", to);

		try {
			List<String> list = jdbcTemplate.queryForList(query, params, String.class);
			if (list != null && !list.isEmpty()) {
				return list;
			}
		} catch (Exception e) {
			log.warn("⚠️ Failed to query successful connections list from log: {}", e.getMessage());
		}

		// Fallback to egbs_demand_v1
		String directQuery = "SELECT DISTINCT d.consumercode FROM egbs_demand_v1 d " +
				"WHERE d.tenantid = :tenantId AND d.taxperiodfrom = :from AND d.taxperiodto = :to " +
				"AND d.businessservice = 'WS' AND d.status = 'ACTIVE'";
		try {
			return jdbcTemplate.queryForList(directQuery, params, String.class);
		} catch (Exception e) {
			log.warn("⚠️ Failed to query successful connections list directly: {}", e.getMessage());
			return new ArrayList<>();
		}
	}

	private Map<String, String> getFailureReasons(String tenantId, Long from, Long to) {
		Map<String, String> results = new HashMap<>();
		String query = "SELECT connectionno, errormessage FROM eg_ws_demand_generation_error " +
				"WHERE tenantid = :tenantId AND fromdate = :from AND todate = :to";

		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId);
		params.put("from", from);
		params.put("to", to);

		try {
			List<Map<String, Object>> rows = jdbcTemplate.queryForList(query, params);
			for (Map<String, Object> row : rows) {
				String conn = (String) row.get("connectionno");
				String msg = (String) row.get("errormessage");
				if (conn != null) {
					results.put(conn, msg != null ? msg : "Calculation failed");
				}
			}
		} catch (Exception e) {
			log.info("ℹ️ Table eg_ws_demand_generation_error not available, using default fallback messages. Details: {}", e.getMessage());
		}
		return results;
	}
}
