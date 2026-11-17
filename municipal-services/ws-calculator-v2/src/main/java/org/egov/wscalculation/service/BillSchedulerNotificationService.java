package org.egov.wscalculation.service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.wscalculation.config.WSCalculationConfiguration;
import org.egov.wscalculation.constants.WSCalculationConstant;
import org.egov.wscalculation.producer.WSCalculationProducer;
import org.egov.wscalculation.repository.BillGeneratorDao;
import org.egov.wscalculation.repository.rowmapper.BillGenerateSchedulerRowMapper;
import org.egov.wscalculation.util.NotificationUtil;
import org.egov.wscalculation.web.models.*;
import org.egov.wscalculation.web.models.BillScheduler.StatusEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BillSchedulerNotificationService {

	@Autowired
	private WSCalculationConfiguration configs;

	@Autowired
	private WSCalculationProducer wsCalculationProducer;

	@Autowired
	private NotificationUtil notificationUtil;

	@Autowired
	private NamedParameterJdbcTemplate jdbcTemplate;

	@Autowired
	private BillGeneratorDao billGeneratorDao;

	@Autowired
	private BillGenerateSchedulerRowMapper billGenerateSchedulerRowMapper;

	// In-memory active lock per tenant to guarantee only ONE monitor runs per tenant
	private static final ConcurrentHashMap<String, Boolean> activeTenantMonitors = new ConcurrentHashMap<>();

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
	 * at the tenant level for the rolling 12-hour window.
	 * Sends a single consolidated email per tenant when all connections across all
	 * schedulers in the window are resolved, or sends a stuck alert email if stalled.
	 */
	public void monitorAndSendBillCompletionEmail(List<BillScheduler> billSchedularList, long startTime, RequestInfo requestInfo) {
		if (configs.getIsEmailEnabled() == null || !configs.getIsEmailEnabled()) {
			log.info("Email notifications disabled. Skipping bill scheduler completion email.");
			return;
		}

		if (billSchedularList == null || billSchedularList.isEmpty()) {
			log.info("No bill schedulers provided for completion notification.");
			return;
		}

		Set<String> tenantIds = billSchedularList.stream()
				.map(BillScheduler::getTenantId)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());

		if (tenantIds.isEmpty()) {
			log.info("No valid tenant IDs found for monitoring.");
			return;
		}

		for (String tenantId : tenantIds) {
			// Lock check: only 1 monitor runs per tenant
			if (activeTenantMonitors.putIfAbsent(tenantId, Boolean.TRUE) != null) {
				log.info("ℹ️ Tenant monitor already active for tenantId: {}. Existing monitor will aggregate all initiated schedulers for this tenant.", tenantId);
				continue;
			}

			List<String> triggeredIds = billSchedularList.stream()
					.filter(s -> tenantId.equals(s.getTenantId()))
					.map(BillScheduler::getId)
					.filter(Objects::nonNull)
					.collect(Collectors.toList());

			CompletableFuture.runAsync(() -> {
				try {
					monitorTenantBillProcessing(tenantId, triggeredIds, startTime, requestInfo);
				} catch (Exception ex) {
					log.error("❌ Error in async bill scheduler completion notification for tenant {}: {}", tenantId, ex.getMessage(), ex);
				} finally {
					activeTenantMonitors.remove(tenantId);
					log.info("🏁 Released active tenant monitor lock for tenantId: {}", tenantId);
				}
			});
		}
	}

	private void monitorTenantBillProcessing(String tenantId, List<String> triggeredIds, long startTime, RequestInfo requestInfo) {
		log.info("🚀 Started tenant-level monitoring for all initiated localities/groups of tenantId: {}", tenantId);

		long pollStartTime = System.currentTimeMillis();
		long lastProgressTime = System.currentTimeMillis();
		long previousInitiatedCount = -1;

		long MAX_TOTAL_RUNTIME_MS = 60 * 60 * 1000L; // 60 minutes overall safety cap
		long INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000L;  // 5 minutes of ZERO progress

		boolean isStalled = false;
		List<BillScheduler> tenantSchedulers = new ArrayList<>();

		while (System.currentTimeMillis() - pollStartTime < MAX_TOTAL_RUNTIME_MS) {
			try {
				// Query all initiated and in-progress schedulers for this tenant (no 12 hr restriction)
				List<BillScheduler> rawSchedulers = getTenantInitiatedSchedulers(tenantId, triggeredIds);
				tenantSchedulers = new ArrayList<>();

				for (BillScheduler s : rawSchedulers) {
					boolean hasLocality = s.getLocality() != null && !s.getLocality().trim().isEmpty();
					boolean hasGroup = s.getGrup() != null && !s.getGrup().trim().isEmpty();

					// Mark scheduler entries where both locality and group are null as COMPLETED
					if (!hasLocality && !hasGroup) {
						log.info("Scheduler entry {} has both locality and group null/empty. Marking as COMPLETED.", s.getId());
						billGeneratorDao.updateBillSchedularStatus(s.getId(), StatusEnum.COMPLETED);
						continue;
					}
					tenantSchedulers.add(s);
				}

				List<String> schedulerIds = tenantSchedulers.stream()
						.map(BillScheduler::getId)
						.filter(Objects::nonNull)
						.collect(Collectors.toList());

				if (schedulerIds.isEmpty()) {
					log.info("No active bill schedulers found for tenant {}", tenantId);
					break;
				}

				// Query overall connection stats for all active schedulers of this tenant
				Map<String, Object> overallStats = getOverallConnectionStatusStats(schedulerIds);
				long initiatedCount = ((Number) overallStats.getOrDefault("initiated_count", 0)).longValue();
				long totalCount = ((Number) overallStats.getOrDefault("total_count", 0)).longValue();

				// 1. All connections across all localities of this tenant are resolved!
				if (totalCount > 0 && initiatedCount == 0) {
					log.info("🎯 All {} scheduled connections across {} localities/groups resolved for tenant {}!",
							totalCount, tenantSchedulers.size(), tenantId);
					break;
				}

				// 2. Active progress tracking
				if (previousInitiatedCount == -1 || initiatedCount < previousInitiatedCount) {
					lastProgressTime = System.currentTimeMillis();
					previousInitiatedCount = initiatedCount;
					log.info("⏳ Tenant {} bill processing active: {}/{} connections remaining (initiated)",
							tenantId, initiatedCount, totalCount);
				} else if (System.currentTimeMillis() - lastProgressTime >= INACTIVITY_TIMEOUT_MS) {
					log.warn("⚠️ Tenant {} bill processing stalled: initiated count stayed at {} for {} minutes with no progress.",
							tenantId, initiatedCount, INACTIVITY_TIMEOUT_MS / (60 * 1000));
					isStalled = true;
					break;
				}
			} catch (Exception e) {
				log.warn("⚠️ Polling tenant {} bill connection status error: {}", tenantId, e.getMessage());
			}

			try {
				Thread.sleep(15000); // Poll every 15 seconds
			} catch (InterruptedException ie) {
				Thread.currentThread().interrupt();
				log.error("❌ Monitoring interrupted for tenant {}", tenantId);
				break;
			}
		}

		if (System.currentTimeMillis() - pollStartTime >= MAX_TOTAL_RUNTIME_MS) {
			log.warn("⚠️ Tenant {} bill monitoring reached maximum allowable runtime (60 mins).", tenantId);
			isStalled = true;
		}

		if (tenantSchedulers.isEmpty()) {
			return;
		}

		List<String> schedulerIds = tenantSchedulers.stream()
				.map(BillScheduler::getId)
				.filter(Objects::nonNull)
				.collect(Collectors.toList());

		// Build summaries for each locality / group / tenant scheduler
		List<LocalityBillSummary> localitySummaries = new ArrayList<>();
		int totalScheduled = 0;
		int totalSuccess = 0;
		int totalFailure = 0;
		int totalPending = 0;
		BigDecimal grandTotalAmount = BigDecimal.ZERO;

		for (BillScheduler scheduler : tenantSchedulers) {
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

			boolean isMissingInBoundary = false;
			if (scheduler.getLocality() != null && !scheduler.getLocality().trim().isEmpty()) {
				isMissingInBoundary = !billGeneratorDao.isLocalityPresentInMohalla(scheduler.getLocality().trim(), scheduler.getTenantId());
			}

			Map<String, Object> stats = getSchedulerStatusStats(scheduler.getId());
			int count = ((Number) stats.getOrDefault("total_count", 0)).intValue();
			int succ = ((Number) stats.getOrDefault("success_count", 0)).intValue();
			int fail = ((Number) stats.getOrDefault("failure_count", 0)).intValue();
			int pending = ((Number) stats.getOrDefault("initiated_count", 0)).intValue();

			BigDecimal amount = getSchedulerTotalAmount(scheduler.getId());

			// Mark scheduler as COMPLETED if resolved OR if crashed/stalled OR if missing in boundary
			if ((pending == 0 && count > 0) || isStalled || isMissingInBoundary) {
				try {
					billGeneratorDao.updateBillSchedularStatus(scheduler.getId(), StatusEnum.COMPLETED);
					log.info("🎯 Updated bill scheduler {} status to COMPLETED (count={}, pending={}, isStalled={}, isMissingInBoundary={})",
							scheduler.getId(), count, pending, isStalled, isMissingInBoundary);
				} catch (Exception e) {
					log.warn("⚠️ Failed to update bill scheduler {} status to COMPLETED: {}", scheduler.getId(), e.getMessage());
				}
			}

			String status;
			if (isMissingInBoundary) {
				status = "MISSING IN BOUNDARY (COMPLETED)";
			} else if (pending == 0 && fail == 0 && count > 0) {
				status = "COMPLETED";
			} else if (pending > 0) {
				status = isStalled ? "STALLED (COMPLETED)" : "INCOMPLETE (" + pending + " PENDING)";
			} else if (succ > 0) {
				status = "PARTIALLY COMPLETED";
			} else if (count == 0) {
				status = "COMPLETED (NO CONNECTIONS)";
			} else {
				status = "FAILED";
			}

			LocalityBillSummary summary = LocalityBillSummary.builder()
					.localityOrGroup(locOrGroup)
					.tenantId(scheduler.getTenantId())
					.cityName(getCityName(scheduler.getTenantId()))
					.totalCount(count)
					.successCount(succ)
					.failureCount(fail)
					.pendingCount(pending)
					.totalAmount(amount)
					.status(status)
					.build();

			localitySummaries.add(summary);

			totalScheduled += count;
			totalSuccess += succ;
			totalFailure += fail;
			totalPending += pending;
			grandTotalAmount = grandTotalAmount.add(amount);
		}

		// Fetch failed records
		List<Map<String, Object>> failedRecords = getFailedConnectionRecords(schedulerIds);

		// Send SINGLE consolidated email for this tenant (or stuck alert email if stalled)
		sendBillEmail(tenantSchedulers, localitySummaries, failedRecords, schedulerIds,
				totalScheduled, totalSuccess, totalFailure, totalPending, grandTotalAmount,
				startTime, isStalled, requestInfo);
	}

	private List<BillScheduler> getTenantInitiatedSchedulers(String tenantId, List<String> triggeredIds) {
		StringBuilder sql = new StringBuilder("SELECT * FROM eg_ws_scheduler WHERE tenantid = :tenantId ");
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId);

		if (triggeredIds != null && !triggeredIds.isEmpty()) {
			sql.append("AND (status IN ('INITIATED', 'INPROGRESS') OR id IN (:triggeredIds)) ");
			params.put("triggeredIds", triggeredIds);
		} else {
			sql.append("AND status IN ('INITIATED', 'INPROGRESS') ");
		}
		sql.append("ORDER BY createdtime ASC");

		try {
			List<BillScheduler> list = jdbcTemplate.query(sql.toString(), params, billGenerateSchedulerRowMapper);
			return list != null ? list : Collections.emptyList();
		} catch (Exception e) {
			log.error("⚠️ Error querying tenant initiated/in-progress schedulers: {}", e.getMessage(), e);
			return Collections.emptyList();
		}
	}

	private void sendBillEmail(List<BillScheduler> schedulers, List<LocalityBillSummary> summaries,
							   List<Map<String, Object>> failedRecords, List<String> schedulerIds,
							   int totalScheduled, int totalSuccess,
							   int totalFailure, int totalPending, BigDecimal totalAmount, long startTime, boolean isStalled, RequestInfo requestInfo) {
		try {
			String primaryTenant = schedulers.get(0).getTenantId();
			String localizationMessage = "";
			try {
				localizationMessage = notificationUtil.getLocalizationMessages(primaryTenant, requestInfo);
			} catch (Exception e) {
				log.warn("Failed to fetch localization messages for bill completion email", e);
			}

			String template = notificationUtil.getMessageTemplate(WSCalculationConstant.WS_BILL_GEN_COMPLETION_EMAIL_TEMPLATE, localizationMessage);
			if (StringUtils.isEmpty(template)) {
				log.warn("⚠️ {} not found in localization service (message table). Skipping bill completion email.",
						WSCalculationConstant.WS_BILL_GEN_COMPLETION_EMAIL_TEMPLATE);
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

			String generatedOn = getIstDateFormat("dd-MMM-yyyy hh:mm a").format(new Date(startTime));
			String completedOn = getIstDateFormat("dd-MMM-yyyy hh:mm a").format(new Date());

			long durationMs = System.currentTimeMillis() - startTime;
			long durationMin = (durationMs / 1000) / 60;
			long durationSec = (durationMs / 1000) % 60;
			String duration = durationMin + "m " + durationSec + "s";

			String overallStatus;
			String statusColor;
			if (totalPending > 0 || isStalled) {
				overallStatus = "PARTIALLY COMPLETED (STALLED)";
				statusColor = "#ef4444";
			} else if (totalFailure == 0 && totalSuccess > 0) {
				overallStatus = "SUCCESS";
				statusColor = "#10b981";
			} else if (totalSuccess > 0) {
				overallStatus = "PARTIALLY COMPLETED";
				statusColor = "#f59e0b";
			} else {
				overallStatus = "COMPLETED";
				statusColor = "#64748b";
			}

			// Build Locality breakdown rows
			StringBuilder localityRows = new StringBuilder();
			int sNo = 1;
			List<String> missingLocalitiesList = new ArrayList<>();
			for (LocalityBillSummary loc : summaries) {
				String locStatusColor;
				if (loc.getStatus() != null && loc.getStatus().contains("MISSING IN BOUNDARY")) {
					locStatusColor = "#d97706";
					missingLocalitiesList.add(loc.getLocalityOrGroup());
				} else if (loc.getPendingCount() > 0) {
					locStatusColor = "#ef4444";
				} else if ("COMPLETED".equalsIgnoreCase(loc.getStatus())) {
					locStatusColor = "#10b981";
				} else {
					locStatusColor = "#f59e0b";
				}
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
					.replace("{totalPending}", COUNT_FORMAT.format(totalPending))
					.replace("{totalAmount}", CURRENCY_FORMAT.format(totalAmount))
					.replace("{successRate}", successRate)
					.replace("{commonFailureReason}", commonFailureReason)
					.replace("{localityRows}", localityRows.toString())
					.replace("{failedRows}", failedRows.toString());

			if (!missingLocalitiesList.isEmpty()) {
				String boundaryWarning = "<div style=\"background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px; margin: 20px 0;\">"
						+ "<h4 style=\"margin: 0; color: #b45309; font-size: 14px; font-weight: bold;\">⚠️ Boundary Notice: Missing Localities in Database</h4>"
						+ "<p style=\"margin: 6px 0 0; color: #92400e; font-size: 13px; line-height: 1.5;\">"
						+ "The following locality code(s) were not found in the boundary table (<code>eg_bndry_mohalla</code>) for this tenant: <strong>"
						+ String.join(", ", missingLocalitiesList)
						+ "</strong>.<br/>These entries were automatically marked as <strong>COMPLETED</strong> and skipped from billing."
						+ "</p>"
						+ "</div>";
				if (customizedMsg.contains("<table")) {
					customizedMsg = customizedMsg.replaceFirst("<table", boundaryWarning + "<table");
				}
			}

			if (totalPending > 0 || isStalled) {
				String pendingWarning = "<div style=\"background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;\">"
						+ "<h3 style=\"margin: 0; color: #991b1b; font-size: 16px; font-weight: bold;\">[STUCK ALERT] Water Bill Generation Stalled - Action Required</h3>"
						+ "<p style=\"margin: 8px 0 0; color: #7f1d1d; font-size: 13px; line-height: 1.5;\">"
						+ "Billing execution for <strong>" + displayCity + "</strong> halted before completing all connections. "
						+ "No consumer progress was detected for over 5 minutes.<br/>"
						+ "• Total Scheduled: <strong>" + COUNT_FORMAT.format(totalScheduled) + "</strong><br/>"
						+ "• Processed: <strong>" + COUNT_FORMAT.format(totalSuccess + totalFailure) + "</strong> (" + COUNT_FORMAT.format(totalSuccess) + " bills, " + COUNT_FORMAT.format(totalFailure) + " failures)<br/>"
						+ "• <span style=\"color: #b91c1c; font-weight: bold;\">Stuck / Incomplete: " + COUNT_FORMAT.format(totalPending) + " connection(s)</span> still in <code>Initiated</code> state.<br/>"
						+ "• <strong>Resolution Note:</strong> All associated scheduler entries have been automatically marked as <strong>COMPLETED</strong> to prevent blocking future billing cycles."
						+ "</p>"
						+ "</div>";
				if (customizedMsg.contains("<table")) {
					customizedMsg = customizedMsg.replaceFirst("<table", pendingWarning + "<table");
				}
			}

			String subject;
			String body;
			if (totalPending > 0 || isStalled) {
				subject = "[STUCK ALERT] Water Bill Generation Stalled - " + displayCity + " (" + COUNT_FORMAT.format(totalPending) + " Records Unprocessed)";
			} else if (customizedMsg.contains("<h2>") && customizedMsg.contains("</h2>")) {
				subject = customizedMsg.substring(customizedMsg.indexOf("<h2>") + 4, customizedMsg.indexOf("</h2>"));
			} else {
				subject = "Water Bill Generation Completed - " + displayCity + " (" + getIstDateFormat("dd-MMM-yyyy").format(new Date()) + ")";
			}
			body = customizedMsg;

			Set<String> toRecipients = notificationUtil.getTenantEmailIds(distinctTenantIds, requestInfo);
			if (toRecipients == null || toRecipients.isEmpty()) {
				log.warn("⚠️ No MDMS emailId found for tenants {}. Falling back to default mail recipients.", distinctTenantIds);
				toRecipients = getToRecipients();
			}

			Email email = Email.builder()
					.emailTo(toRecipients)
					.emailCc(getCcRecipients())
					.subject(subject)
					.body(body)
					.isHTML(true)
					.build();

			wsCalculationProducer.push(configs.getEmailNotifyTopic(), EmailRequest.builder().requestInfo(requestInfo).email(email).build());
			log.info("📧 Bill generation completion email notification pushed to Kafka topic {} (To: {}, Cc: {})",
					configs.getEmailNotifyTopic(), toRecipients, getCcRecipients());
		} catch (Exception e) {
			log.error("❌ Failed to construct and send bill generation completion email: {}", e.getMessage(), e);
		}
	}

	private Map<String, Object> getOverallConnectionStatusStats(List<String> schedulerIds) {
		String sql = "SELECT "
				+ "COUNT(*) as total_count, "
				+ "COUNT(CASE WHEN status = 'Success' THEN 1 END) as success_count, "
				+ "COUNT(CASE WHEN status = 'Failure' THEN 1 END) as failure_count, "
				+ "COUNT(CASE WHEN status = 'Initiated' THEN 1 END) as initiated_count "
				+ "FROM eg_ws_bill_scheduler_connection_status "
				+ "WHERE eg_ws_scheduler_id IN (:ids)";

		Map<String, Object> params = Collections.singletonMap("ids", schedulerIds);
		try {
			return jdbcTemplate.queryForMap(sql, params);
		} catch (Exception e) {
			log.warn("⚠️ Error querying overall bill status stats: {}", e.getMessage());
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
				+ "COUNT(CASE WHEN status = 'Failure' THEN 1 END) as failure_count, "
				+ "COUNT(CASE WHEN status = 'Initiated' THEN 1 END) as initiated_count "
				+ "FROM eg_ws_bill_scheduler_connection_status "
				+ "WHERE eg_ws_scheduler_id = :id";

		Map<String, Object> params = Collections.singletonMap("id", schedulerId);
		try {
			return jdbcTemplate.queryForMap(sql, params);
		} catch (Exception e) {
			log.warn("⚠️ Error querying scheduler status stats for {}: {}", schedulerId, e.getMessage());
			Map<String, Object> empty = new HashMap<>();
			empty.put("total_count", 0);
			empty.put("success_count", 0);
			empty.put("failure_count", 0);
			empty.put("initiated_count", 0);
			return empty;
		}
	}

	private BigDecimal getSchedulerTotalAmount(String schedulerId) {
		// Use billamount column populated directly at bill generation time — no join needed.
		String sql = "SELECT COALESCE(SUM(billamount), 0) "
				+ "FROM eg_ws_bill_scheduler_connection_status "
				+ "WHERE eg_ws_scheduler_id = :id AND status = 'Success'";

		Map<String, Object> params = Collections.singletonMap("id", schedulerId);
		try {
			Number num = jdbcTemplate.queryForObject(sql, params, Number.class);
			return num != null ? new BigDecimal(num.toString()) : BigDecimal.ZERO;
		} catch (Exception e) {
			log.warn("⚠️ Error calculating bill amount for scheduler {}: {}", schedulerId, e.getMessage());
			return BigDecimal.ZERO;
		}
	}

	private List<Map<String, Object>> getFailedConnectionRecords(List<String> schedulerIds) {
		String sql = "SELECT consumercode, locality, reason "
				+ "FROM eg_ws_bill_scheduler_connection_status "
				+ "WHERE eg_ws_scheduler_id IN (:ids) AND status = 'Failure' "
				+ "ORDER BY lastupdatedtime DESC "
				+ "LIMIT 100";

		Map<String, Object> params = Collections.singletonMap("ids", schedulerIds);
		try {
			return jdbcTemplate.queryForList(sql, params);
		} catch (Exception e) {
			log.warn("⚠️ Error querying failed bill connection records: {}", e.getMessage());
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
				+ "FROM eg_ws_bill_scheduler_connection_status "
				+ "WHERE eg_ws_scheduler_id IN (:ids) AND status = 'Failure' "
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

	private SimpleDateFormat getIstDateFormat(String pattern) {
		SimpleDateFormat sdf = new SimpleDateFormat(pattern);
		sdf.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
		return sdf;
	}
}
