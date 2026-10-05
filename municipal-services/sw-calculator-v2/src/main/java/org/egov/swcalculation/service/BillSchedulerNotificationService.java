package org.egov.swcalculation.service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.swcalculation.config.SWCalculationConfiguration;
import org.egov.swcalculation.constants.SWCalculationConstant;
import org.egov.swcalculation.producer.SWCalculationProducer;
import org.egov.swcalculation.util.SWCalculationUtil;
import org.egov.swcalculation.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BillSchedulerNotificationService {

	@Autowired
	private SWCalculationConfiguration configs;

	@Autowired
	private SWCalculationProducer swCalculationProducer;

	@Autowired
	private SWCalculationUtil utils;

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
	 * Asynchronously monitors the bill generation batches for all scheduled entries
	 * and sends a completion email using template from localization service (message table).
	 */
	public void monitorAndSendBillCompletionEmail(List<BillScheduler> billSchedularList, long startTime, RequestInfo requestInfo) {
		if (configs.getIsMailEnabled() == null || !configs.getIsMailEnabled()) {
			log.info("Email notifications disabled. Skipping sewerage bill scheduler completion email.");
			return;
		}

		if (billSchedularList == null || billSchedularList.isEmpty()) {
			log.info("No bill schedulers provided for completion notification.");
			return;
		}

		List<String> schedulerIds = billSchedularList.stream()
				.map(BillScheduler::getId)
				.filter(Objects::nonNull)
				.collect(Collectors.toList());

		if (schedulerIds.isEmpty()) {
			log.info("No valid scheduler IDs found for monitoring.");
			return;
		}

		// Run monitoring in background thread
		CompletableFuture.runAsync(() -> {
			try {
				log.info("🚀 Started async monitoring for {} sewerage bill scheduler ID(s)", schedulerIds.size());
				long pollStartTime = System.currentTimeMillis();

				// Poll up to 15 minutes for consumer processing
				while (System.currentTimeMillis() - pollStartTime < 15 * 60 * 1000) {
					try {
						Map<String, Object> overallStats = getOverallConnectionStatusStats(schedulerIds);
						long initiatedCount = ((Number) overallStats.getOrDefault("initiated_count", 0)).longValue();
						long totalCount = ((Number) overallStats.getOrDefault("total_count", 0)).longValue();

						if (totalCount > 0 && initiatedCount == 0) {
							log.info("🎯 All {} scheduled sewerage bill connections processed!", totalCount);
							break;
						}
					} catch (Exception e) {
						log.warn("⚠️ Polling sewerage bill connection status error: {}", e.getMessage());
					}

					try {
						Thread.sleep(10000); // Poll every 10 seconds
					} catch (InterruptedException ie) {
						Thread.currentThread().interrupt();
						log.error("❌ Sewerage bill monitoring interrupted");
						break;
					}
				}

				// Build summaries for each locality / group / tenant scheduler
				List<LocalityBillSummary> localitySummaries = new ArrayList<>();
				int totalScheduled = 0;
				int totalSuccess = 0;
				int totalFailure = 0;
				BigDecimal grandTotalAmount = BigDecimal.ZERO;

				for (BillScheduler scheduler : billSchedularList) {
					String locOrGroup;
					if (scheduler.getLocality() != null && !scheduler.getLocality().trim().isEmpty()) {
						locOrGroup = "Locality: " + scheduler.getLocality();
					} else if (scheduler.getGrup() != null && !scheduler.getGrup().trim().isEmpty()) {
						locOrGroup = "Group: " + scheduler.getGrup();
					} else if (scheduler.getGroup() != null && !scheduler.getGroup().isEmpty()) {
						locOrGroup = "Group: " + String.join(", ", scheduler.getGroup());
					} else {
						locOrGroup = "All Localities (Tenant)";
					}

					Map<String, Object> stats = getSchedulerStatusStats(scheduler.getId());
					int count = ((Number) stats.getOrDefault("total_count", 0)).intValue();
					int succ = ((Number) stats.getOrDefault("success_count", 0)).intValue();
					int fail = ((Number) stats.getOrDefault("failure_count", 0)).intValue();

					BigDecimal amount = getSchedulerTotalAmount(scheduler.getId());

					String status = fail == 0 && count > 0 ? "COMPLETED" : (succ > 0 ? "PARTIALLY COMPLETED" : (count == 0 ? "NO DATA" : "FAILED"));

					LocalityBillSummary summary = LocalityBillSummary.builder()
							.localityOrGroup(locOrGroup)
							.tenantId(scheduler.getTenantId())
							.cityName(getCityName(scheduler.getTenantId()))
							.totalCount(count)
							.successCount(succ)
							.failureCount(fail)
							.totalAmount(amount)
							.status(status)
							.build();

					localitySummaries.add(summary);

					totalScheduled += count;
					totalSuccess += succ;
					totalFailure += fail;
					grandTotalAmount = grandTotalAmount.add(amount);
				}

				// Fetch failed records
				List<Map<String, Object>> failedRecords = getFailedConnectionRecords(schedulerIds);

				// Send Email using template from message table
				sendBillEmail(billSchedularList, localitySummaries, failedRecords, schedulerIds, totalScheduled, totalSuccess, totalFailure, grandTotalAmount, startTime, requestInfo);

			} catch (Exception ex) {
				log.error("❌ Error in async sewerage bill scheduler completion notification: {}", ex.getMessage(), ex);
			}
		});
	}

	private void sendBillEmail(List<BillScheduler> schedulers, List<LocalityBillSummary> summaries,
							   List<Map<String, Object>> failedRecords, List<String> schedulerIds,
							   int totalScheduled, int totalSuccess,
							   int totalFailure, BigDecimal totalAmount, long startTime, RequestInfo requestInfo) {
		try {
			String primaryTenant = schedulers.get(0).getTenantId();
			String localizationMessage = "";
			try {
				localizationMessage = utils.getLocalizationMessages(primaryTenant, requestInfo);
			} catch (Exception e) {
				log.warn("Failed to fetch localization messages for sewerage bill completion email", e);
			}

			String template = utils.getMessageTemplate(SWCalculationConstant.SW_BILL_GEN_COMPLETION_EMAIL_TEMPLATE, localizationMessage);
			if (StringUtils.isEmpty(template)) {
				log.warn("⚠️ {} not found in localization service (message table). Skipping sewerage bill completion email.",
						SWCalculationConstant.SW_BILL_GEN_COMPLETION_EMAIL_TEMPLATE);
				return;
			}

			List<String> distinctTenantIds = schedulers.stream()
					.map(BillScheduler::getTenantId)
					.filter(Objects::nonNull)
					.distinct()
					.collect(Collectors.toList());

			List<String> distinctCityNames = distinctTenantIds.stream()
					.map(this::getCityName)
					.distinct()
					.collect(Collectors.toList());

			int tenantCount = distinctTenantIds.size();

			String displayCity;
			String displayTenant;

			if (tenantCount > 1) {
				displayCity = "Multi-ULB (" + tenantCount + " Cities)";
				displayTenant = String.join(", ", distinctCityNames);
			} else {
				displayCity = distinctCityNames.isEmpty() ? "Unknown" : distinctCityNames.get(0);
				displayTenant = distinctTenantIds.isEmpty() ? "Unknown" : distinctTenantIds.get(0);
			}

			String generatedOn = new SimpleDateFormat("dd-MMM-yyyy hh:mm a").format(new Date(startTime));
			String completedOn = new SimpleDateFormat("dd-MMM-yyyy hh:mm a").format(new Date());

			long durationMs = System.currentTimeMillis() - startTime;
			long durationMin = (durationMs / 1000) / 60;
			long durationSec = (durationMs / 1000) % 60;
			String duration = durationMin + "m " + durationSec + "s";

			String overallStatus = totalFailure == 0 && totalSuccess > 0 ? "SUCCESS" : (totalSuccess > 0 ? "PARTIALLY COMPLETED" : "COMPLETED");
			String statusColor = totalFailure == 0 ? "#10b981" : "#f59e0b";

			// Build Locality breakdown rows
			StringBuilder localityRows = new StringBuilder();
			int sNo = 1;
			for (LocalityBillSummary loc : summaries) {
				String locStatusColor = "COMPLETED".equalsIgnoreCase(loc.getStatus()) ? "#10b981" : "#ef4444";
				localityRows.append("<tr style=\"border-bottom: 1px solid #e5e7eb;\">")
						.append("<td style=\"padding: 8px 12px; text-align: center;\">").append(sNo++).append("</td>")
						.append("<td style=\"padding: 8px 12px; font-weight: 600; color: #1f2937;\">").append(loc.getLocalityOrGroup()).append("</td>")
						.append("<td style=\"padding: 8px 12px;\">").append(loc.getCityName()).append("</td>")
						.append("<td style=\"padding: 8px 12px; text-align: right;\">").append(COUNT_FORMAT.format(loc.getTotalCount())).append("</td>")
						.append("<td style=\"padding: 8px 12px; text-align: right; color: #10b981; font-weight: 600;\">").append(COUNT_FORMAT.format(loc.getSuccessCount())).append("</td>")
						.append("<td style=\"padding: 8px 12px; text-align: right; color: ").append(loc.getFailureCount() > 0 ? "#ef4444" : "#64748b").append("; font-weight: 600;\">").append(COUNT_FORMAT.format(loc.getFailureCount())).append("</td>")
						.append("<td style=\"padding: 8px 12px; text-align: right; font-weight: 600; color: #059669;\">&#8377; ").append(CURRENCY_FORMAT.format(loc.getTotalAmount())).append("</td>")
						.append("<td style=\"padding: 8px 12px; text-align: center;\"><span style=\"background-color: ").append(locStatusColor).append("20; color: ").append(locStatusColor).append("; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;\">").append(loc.getStatus()).append("</span></td>")
						.append("</tr>");
			}

			// Build Failures rows
			StringBuilder failedRows = new StringBuilder();
			if (failedRecords == null || failedRecords.isEmpty()) {
				failedRows.append("<tr><td colspan=\"4\" style=\"color: #10b981; font-weight: bold; text-align: center; padding: 14px;\">🎉 All bills generated successfully! No failures reported.</td></tr>");
			} else {
				int fCount = 1;
				for (Map<String, Object> row : failedRecords) {
					if (fCount > 50) {
						failedRows.append("<tr><td colspan=\"4\" style=\"text-align: center; font-style: italic; color: #64748b; padding: 10px;\">... and ")
								.append(failedRecords.size() - 50)
								.append(" more failed bills.</td></tr>");
						break;
					}
					String conn = (String) row.get("consumercode");
					String loc = (String) row.get("locality");
					String reason = (String) row.get("reason");
					failedRows.append("<tr style=\"border-bottom: 1px solid #fee2e2;\">")
							.append("<td style=\"padding: 8px 12px; text-align: center;\">").append(fCount++).append("</td>")
							.append("<td style=\"padding: 8px 12px; font-family: monospace; font-weight: bold;\">").append(conn != null ? conn : "N/A").append("</td>")
							.append("<td style=\"padding: 8px 12px;\">").append(loc != null ? loc : "N/A").append("</td>")
							.append("<td style=\"padding: 8px 12px; color: #ef4444;\">").append(reason != null ? reason : "Bill already paid or generation error").append("</td>")
							.append("</tr>");
				}
			}

			// Compute common failure reason directly from DB (not limited by LIMIT 100 sample list)
			String commonFailureReason = getMostCommonFailureReasonFromDb(schedulerIds);
			String successRate = totalScheduled > 0
					? String.format("%.1f", (totalSuccess * 100.0) / totalScheduled)
					: "0.0";

			String customizedMsg = template
					.replace("{primaryCity}", displayCity)
					.replace("{primaryTenant}", displayTenant)
					.replace("{tenantCount}", String.valueOf(tenantCount))
					.replace("{generatedOn}", generatedOn)
					.replace("{completedOn}", completedOn)
					.replace("{duration}", duration)
					.replace("{overallStatus}", overallStatus)
					.replace("{statusColor}", statusColor)
					.replace("{totalLocalities}", String.valueOf(summaries.size()))
					.replace("{totalScheduled}", COUNT_FORMAT.format(totalScheduled))
					.replace("{totalSuccess}", COUNT_FORMAT.format(totalSuccess))
					.replace("{totalFailure}", COUNT_FORMAT.format(totalFailure))
					.replace("{totalAmount}", CURRENCY_FORMAT.format(totalAmount))
					.replace("{successRate}", successRate)
					.replace("{commonFailureReason}", commonFailureReason)
					.replace("{localityRows}", localityRows.toString())
					.replace("{failedRows}", failedRows.toString());

			String subject;
			String body;
			if (customizedMsg.contains("<h2>") && customizedMsg.contains("</h2>")) {
				subject = customizedMsg.substring(customizedMsg.indexOf("<h2>") + 4, customizedMsg.indexOf("</h2>"));
				body = customizedMsg.substring(customizedMsg.indexOf("</h2>") + 5);
			} else {
				subject = "Sewerage Bill Generation Completed - " + displayCity + " (" + new SimpleDateFormat("dd-MMM-yyyy").format(new Date()) + ")";
				body = customizedMsg;
			}

			Email email = Email.builder()
					.emailTo(getToRecipients())
					.emailCc(getCcRecipients())
					.subject(subject)
					.body(body)
					.isHTML(true)
					.build();

			swCalculationProducer.push(configs.getEmailNotifTopic(), EmailRequest.builder().requestInfo(requestInfo).email(email).build());
			log.info("📧 Sewerage bill generation completion email notification pushed to Kafka topic {} (To: {}, Cc: {})",
					configs.getEmailNotifTopic(), getToRecipients(), getCcRecipients());
		} catch (Exception e) {
			log.error("❌ Failed to construct and send sewerage bill generation completion email: {}", e.getMessage(), e);
		}
	}

	private Map<String, Object> getOverallConnectionStatusStats(List<String> schedulerIds) {
		String sql = "SELECT "
				+ "COUNT(*) as total_count, "
				+ "COUNT(CASE WHEN status = 'Success' THEN 1 END) as success_count, "
				+ "COUNT(CASE WHEN status = 'Failure' THEN 1 END) as failure_count, "
				+ "COUNT(CASE WHEN status = 'Initiated' THEN 1 END) as initiated_count "
				+ "FROM eg_sw_bill_scheduler_connection_status "
				+ "WHERE eg_sw_scheduler_id IN (:ids)";

		Map<String, Object> params = Collections.singletonMap("ids", schedulerIds);
		try {
			return jdbcTemplate.queryForMap(sql, params);
		} catch (Exception e) {
			log.warn("⚠️ Error querying overall sewerage bill status stats: {}", e.getMessage());
			Map<String, Object> empty = new HashMap<>();
			empty.put("total_count", 0);
			empty.put("success_count", 0);
			empty.put("failure_count", 0);
			empty.put("initiated_count", 0);
			return empty;
		}
	}

	private Map<String, Object> getSchedulerStatusStats(String schedulerId) {
		String sql = "SELECT "
				+ "COUNT(*) as total_count, "
				+ "COUNT(CASE WHEN status = 'Success' THEN 1 END) as success_count, "
				+ "COUNT(CASE WHEN status = 'Failure' THEN 1 END) as failure_count "
				+ "FROM eg_sw_bill_scheduler_connection_status "
				+ "WHERE eg_sw_scheduler_id = :id";

		Map<String, Object> params = Collections.singletonMap("id", schedulerId);
		try {
			return jdbcTemplate.queryForMap(sql, params);
		} catch (Exception e) {
			log.warn("⚠️ Error querying sewerage scheduler status stats for {}: {}", schedulerId, e.getMessage());
			Map<String, Object> empty = new HashMap<>();
			empty.put("total_count", 0);
			empty.put("success_count", 0);
			empty.put("failure_count", 0);
			return empty;
		}
	}

	private BigDecimal getSchedulerTotalAmount(String schedulerId) {
		// Use billamount column populated directly at bill generation time — no join needed.
		String sql = "SELECT COALESCE(SUM(billamount), 0) "
				+ "FROM eg_sw_bill_scheduler_connection_status "
				+ "WHERE eg_sw_scheduler_id = :id AND status = 'Success'";

		Map<String, Object> params = Collections.singletonMap("id", schedulerId);
		try {
			Number num = jdbcTemplate.queryForObject(sql, params, Number.class);
			return num != null ? new BigDecimal(num.toString()) : BigDecimal.ZERO;
		} catch (Exception e) {
			log.warn("⚠️ Error calculating sewerage bill amount for scheduler {}: {}", schedulerId, e.getMessage());
			return BigDecimal.ZERO;
		}
	}

	private List<Map<String, Object>> getFailedConnectionRecords(List<String> schedulerIds) {
		String sql = "SELECT consumercode, locality, reason "
				+ "FROM eg_sw_bill_scheduler_connection_status "
				+ "WHERE eg_sw_scheduler_id IN (:ids) AND status = 'Failure' "
				+ "ORDER BY lastupdatedtime DESC "
				+ "LIMIT 100";

		Map<String, Object> params = Collections.singletonMap("ids", schedulerIds);
		try {
			return jdbcTemplate.queryForList(sql, params);
		} catch (Exception e) {
			log.warn("⚠️ Error querying failed sewerage bill connection records: {}", e.getMessage());
			return Collections.emptyList();
		}
	}

	/**
	 * Queries the DB directly for the most common failure reason using GROUP BY.
	 * Accurate across ALL failed records — not limited by the LIMIT 100 sample list.
	 * Example result: "EMPTY_DEMANDS: No demands found for the given bill generate criteria (2,476 connections)"
	 */
	private String getMostCommonFailureReasonFromDb(List<String> schedulerIds) {
		if (schedulerIds == null || schedulerIds.isEmpty()) {
			return "None";
		}
		String sql = "SELECT reason, COUNT(*) as cnt "
				+ "FROM eg_sw_bill_scheduler_connection_status "
				+ "WHERE eg_sw_scheduler_id IN (:ids) AND status = 'Failure' "
				+ "  AND reason IS NOT NULL AND TRIM(reason) <> '' "
				+ "GROUP BY reason "
				+ "ORDER BY cnt DESC "
				+ "LIMIT 1";

		Map<String, Object> params = Collections.singletonMap("ids", schedulerIds);
		try {
			List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, params);
			if (rows == null || rows.isEmpty()) {
				return "None";
			}
			String reason = (String) rows.get(0).get("reason");
			Number count  = (Number) rows.get(0).get("cnt");
			if (reason == null || reason.trim().isEmpty()) {
				return "None";
			}
			// Truncate very long reasons to keep the email readable
			String display = reason.trim().length() > 120
					? reason.trim().substring(0, 117) + "..."
					: reason.trim();
			long cnt = count != null ? count.longValue() : 0L;
			return display + " (" + COUNT_FORMAT.format(cnt) + " connection" + (cnt > 1 ? "s" : "") + ")";
		} catch (Exception e) {
			log.warn("⚠️ Error querying most common failure reason: {}", e.getMessage());
			return "Unable to determine";
		}
	}
}
