package org.upyog.adv.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.upyog.adv.enums.RentalType;
import org.upyog.adv.enums.ScheduleType;
import org.upyog.adv.web.models.AuditDetails;
import org.upyog.adv.web.models.ResponseInfo;
import org.upyog.adv.web.models.ResponseInfo.StatusEnum;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;

public class BookingUtil {

	public final static String DATE_FORMAT = "yyyy-MM-dd";

	public static ResponseInfo createReponseInfo(final RequestInfo requestInfo, String resMsg, StatusEnum status) {

		final String apiId = requestInfo != null ? requestInfo.getApiId() : StringUtils.EMPTY;
		final String ver = requestInfo != null ? requestInfo.getVer() : StringUtils.EMPTY;
		Long ts = null;
		if (requestInfo != null)
			ts = requestInfo.getTs();
		final String msgId = requestInfo != null ? requestInfo.getMsgId() : StringUtils.EMPTY;

		ResponseInfo responseInfo = ResponseInfo.builder().apiId(apiId).ver(ver).ts(ts).msgId(msgId).resMsgId(resMsg)
				.status(status).build();

		return responseInfo;
	}

	public static Long getCurrentTimestamp() {
		return Instant.now().toEpochMilli();
	}

	public static LocalDate getCurrentDate() {
		return LocalDate.now();
	}

	public static AuditDetails getAuditDetails(String by, Boolean isCreate) {
		Long time = getCurrentTimestamp();
		if (isCreate)
			// TODO: check if we can set lastupdated details to empty
			return AuditDetails.builder().createdBy(by).lastModifiedBy(by).createdTime(time).lastModifiedTime(time)
					.build();
		else
			return AuditDetails.builder().lastModifiedBy(by).lastModifiedTime(time).build();
	}

	/*Commented and used Instant
	 * public static Long getCurrentTimestamp() { return System.currentTimeMillis();
	 * }
	 */

	public static String getRandonUUID() {
		return UUID.randomUUID().toString();
	}

	public static LocalDate parseStringToLocalDate(String date) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
		LocalDate localDate = LocalDate.parse(date, formatter);
		return localDate;
	}

	public static Long minusOneDay(LocalDate date) {
		return date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
	}

	public static boolean isDateWithinRange(String startDate, String endDate, String bookingDate) {
		LocalDate start = LocalDate.parse(startDate);
		LocalDate end = LocalDate.parse(endDate);
		LocalDate booking = LocalDate.parse(bookingDate);

		return (booking.isEqual(start) || booking.isAfter(start)) &&
				(booking.isEqual(end) || booking.isBefore(end));
	}


	public static boolean isDateRangeOverlap(String searchStart, String searchEnd, String bookedStart, String bookedEnd) {
		LocalDate searchStartDate = LocalDate.parse(searchStart);
		LocalDate searchEndDate = LocalDate.parse(searchEnd);
		LocalDate bookedStartDate = LocalDate.parse(bookedStart);
		LocalDate bookedEndDate = LocalDate.parse(bookedEnd);

		return !(searchStartDate.isAfter(bookedEndDate) || searchEndDate.isBefore(bookedStartDate));
	}

	/**
	 * Returns the per‑day rate for an advertisement.
	 * <p>
	 * <b>When {@code rentalType=DAILY}</b> (or {@code null} for backward compat):
	 * {@code amount} already represents the daily rate → returned directly.
	 * <p>
	 * <b>When {@code rentalType} is absent</b> (legacy MDMS data without the
	 * new fields): falls back to the old duration‑based tier selection using
	 * {@code monthlyAmount}/{@code yearlyAmount}/{@code weeklyAmount}/
	 * {@code biannualAmount}, picking the cheapest per‑day rate.
	 *
	 * @param adv           the advertisement from MDMS
	 * @param referenceDate used for variable‑length periods (month / year length)
	 * @param bookingDays   total number of booked days (cart entries)
	 * @return per‑day amount, or null if no amount is available
	 */
	public static BigDecimal getPerDayRate(org.upyog.adv.web.models.Advertisements adv, LocalDate referenceDate, long bookingDays) {
		if (adv == null) return null;

		// ── New path: rentalType=DAILY → amount IS the daily rate ──
		if (adv.getRentalType() == RentalType.DAILY) {
			return adv.getAmount();
		}

		// ── Legacy path: rentalType absent → duration‑based tier selection ──
		// Use scale 6 HALF_UP to avoid accumulated rounding errors when the per‑day
		// rate is multiplied back by bookingDays and then finally rounded to whole rupees.
		if (bookingDays >= 365 && adv.getYearlyAmount() != null) {
			int divisor = (referenceDate != null) ? referenceDate.lengthOfYear() : 365;
			return adv.getYearlyAmount().divide(BigDecimal.valueOf(divisor), 6, RoundingMode.HALF_UP);
		}
		if (bookingDays >= 180 && adv.getBiannualAmount() != null) {
			return adv.getBiannualAmount().divide(BigDecimal.valueOf(182), 6, RoundingMode.HALF_UP);
		}
		if (bookingDays >= 28 && adv.getMonthlyAmount() != null) {
			int divisor = (referenceDate != null) ? getDaysInMonth(referenceDate) : 30;
			return adv.getMonthlyAmount().divide(BigDecimal.valueOf(divisor), 6, RoundingMode.HALF_UP);
		}
		if (bookingDays >= 7 && adv.getWeeklyAmount() != null) {
			return adv.getWeeklyAmount().divide(BigDecimal.valueOf(7), 6, RoundingMode.HALF_UP);
		}

		// ── Legacy fallback: compute per‑day for ALL populated amounts, pick cheapest ──
		BigDecimal cheapest = null;

		if (adv.getMonthlyAmount() != null) {
			int divisor = (referenceDate != null) ? getDaysInMonth(referenceDate) : 30;
			BigDecimal rate = adv.getMonthlyAmount().divide(BigDecimal.valueOf(divisor), 6, RoundingMode.HALF_UP);
			cheapest = (cheapest == null || rate.compareTo(cheapest) < 0) ? rate : cheapest;
		}
		if (adv.getWeeklyAmount() != null) {
			BigDecimal rate = adv.getWeeklyAmount().divide(BigDecimal.valueOf(7), 6, RoundingMode.HALF_UP);
			cheapest = (cheapest == null || rate.compareTo(cheapest) < 0) ? rate : cheapest;
		}
		if (adv.getYearlyAmount() != null) {
			int divisor = (referenceDate != null) ? referenceDate.lengthOfYear() : 365;
			BigDecimal rate = adv.getYearlyAmount().divide(BigDecimal.valueOf(divisor), 6, RoundingMode.HALF_UP);
			cheapest = (cheapest == null || rate.compareTo(cheapest) < 0) ? rate : cheapest;
		}
		if (adv.getBiannualAmount() != null) {
			BigDecimal rate = adv.getBiannualAmount().divide(BigDecimal.valueOf(182), 6, RoundingMode.HALF_UP);
			cheapest = (cheapest == null || rate.compareTo(cheapest) < 0) ? rate : cheapest;
		}

		if (cheapest != null) return cheapest;

		// No period amounts — treat as daily rate
		return adv.getAmount();
	}

	/**
	 * Calculate the total rental amount for an advertisement using {@code FIXED}
	 * rental type — {@code amount} is the PER‑PERIOD rate (e.g. ₹/month).
	 * A complete billing period is charged once; partial periods are prorated.
	 * <p>
	 * Supports {@link ScheduleType#MONTHLY}, {@link ScheduleType#WEEKLY},
	 * {@link ScheduleType#YEARLY}, and {@link ScheduleType#BIANNUAL}.
	 *
	 * @param adv        the advertisement with {@code rentalType=FIXED};
	 *                   {@code adv.getAmount()} = rate per billing period
	 * @param cartDates  all booking dates for this advertisement (non-null, non-empty)
	 * @return total fixed rental amount, or {@code null} if not applicable
	 */
	public static BigDecimal calculateFixedRentalAmount(
			org.upyog.adv.web.models.Advertisements adv,
			List<LocalDate> cartDates) {

		if (adv == null || cartDates == null || cartDates.isEmpty()) return null;
		if (adv.getRentalType() != RentalType.FIXED) return null;

		BigDecimal periodAmount = adv.getAmount();
		if (periodAmount == null) return null;

		ScheduleType schedule = adv.getScheduleType();
		if (schedule == null || schedule == ScheduleType.DAILY) return null;

		List<LocalDate> sorted = cartDates.stream().sorted().collect(Collectors.toList());

		switch (schedule) {
			case MONTHLY: {
				// Group booking dates by calendar (year, month)
				Map<YearMonth, List<LocalDate>> monthBuckets = new LinkedHashMap<>();
				for (LocalDate d : sorted) {
					monthBuckets.computeIfAbsent(YearMonth.from(d), k -> new ArrayList<>()).add(d);
				}

				BigDecimal total = BigDecimal.ZERO;
				for (Map.Entry<YearMonth, List<LocalDate>> entry : monthBuckets.entrySet()) {
					YearMonth ym = entry.getKey();
					int daysInMonth = ym.lengthOfMonth();
					int bookedDays = entry.getValue().size();

					if (bookedDays == daysInMonth) {
						total = total.add(periodAmount);
					} else {
						BigDecimal perDay = periodAmount.divide(
								BigDecimal.valueOf(daysInMonth), 6, RoundingMode.HALF_UP);
						total = total.add(perDay.multiply(BigDecimal.valueOf(bookedDays)));
					}
				}
				return total;
			}
			case WEEKLY: {
				Map<String, List<LocalDate>> weekBuckets = new LinkedHashMap<>();
				for (LocalDate d : sorted) {
					int weekOfYear = d.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
					int weekYear = d.get(java.time.temporal.IsoFields.WEEK_BASED_YEAR);
					String key = weekYear + "-W" + weekOfYear;
					weekBuckets.computeIfAbsent(key, k -> new ArrayList<>()).add(d);
				}

				BigDecimal total = BigDecimal.ZERO;
				BigDecimal perDay = periodAmount.divide(BigDecimal.valueOf(7), 6, RoundingMode.HALF_UP);
				for (Map.Entry<String, List<LocalDate>> entry : weekBuckets.entrySet()) {
					int bookedDays = entry.getValue().size();
					if (bookedDays == 7) {
						total = total.add(periodAmount);
					} else {
						total = total.add(perDay.multiply(BigDecimal.valueOf(bookedDays)));
					}
				}
				return total;
			}
			case YEARLY: {
				Map<Integer, List<LocalDate>> yearBuckets = new LinkedHashMap<>();
				for (LocalDate d : sorted) {
					yearBuckets.computeIfAbsent(d.getYear(), k -> new ArrayList<>()).add(d);
				}

				BigDecimal total = BigDecimal.ZERO;
				for (Map.Entry<Integer, List<LocalDate>> entry : yearBuckets.entrySet()) {
					int year = entry.getKey();
					int daysInYear = java.time.Year.of(year).length();
					int bookedDays = entry.getValue().size();

					if (bookedDays == daysInYear) {
						total = total.add(periodAmount);
					} else {
						BigDecimal perDay = periodAmount.divide(
								BigDecimal.valueOf(daysInYear), 6, RoundingMode.HALF_UP);
						total = total.add(perDay.multiply(BigDecimal.valueOf(bookedDays)));
					}
				}
				return total;
			}
			case BIANNUAL: {
				LocalDate epochStart = sorted.get(0);
				Map<Integer, List<LocalDate>> blockBuckets = new LinkedHashMap<>();
				for (LocalDate d : sorted) {
					long daysFromStart = ChronoUnit.DAYS.between(epochStart, d);
					int blockIndex = (int) (daysFromStart / 180);
					blockBuckets.computeIfAbsent(blockIndex, k -> new ArrayList<>()).add(d);
				}

				BigDecimal total = BigDecimal.ZERO;
				BigDecimal perDay = periodAmount.divide(BigDecimal.valueOf(180), 6, RoundingMode.HALF_UP);
				for (Map.Entry<Integer, List<LocalDate>> entry : blockBuckets.entrySet()) {
					int bookedDays = entry.getValue().size();
					if (bookedDays == 180) {
						total = total.add(periodAmount);
					} else {
						total = total.add(perDay.multiply(BigDecimal.valueOf(bookedDays)));
					}
				}
				return total;
			}
			default:
				return null;
		}
	}

	public static String parseLocalDateToString(LocalDate date, String dateFormat) {
		if(dateFormat == null) {
			dateFormat = DATE_FORMAT;
		}
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat);
		String formattedDate = date.format(formatter);
		return formattedDate;
	}

	public static AuditDetails getAuditDetails(ResultSet rs) throws SQLException {
		AuditDetails auditdetails = AuditDetails.builder().createdBy(rs.getString("createdBy"))
				.createdTime(rs.getLong("createdTime")).lastModifiedBy(rs.getString("lastModifiedBy"))
				.lastModifiedTime(rs.getLong("lastModifiedTime")).build();
		return auditdetails;
	}

	public static String beuatifyJson(Object result) {
		ObjectMapper mapper = new ObjectMapper();
		String data = null;
		try {
			data = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(result);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return data;
	}

	public static String getTenantId(String tenantId) {
		return tenantId.split("\\.")[0];
	}

	public static LocalDate getMonthsAgo(int month) {
		LocalDate currentDate = LocalDate.now();
		LocalDate monthsAgo = currentDate.minusMonths(month);
		return monthsAgo;
	}

	public static int getDaysInMonth(LocalDate date) {
		return YearMonth.from(date).lengthOfMonth();
	}

	public static long getDaysBetween(LocalDate start, LocalDate end) {
		if (start == null || end == null || end.isBefore(start)) {
			return 0;
		}
		return ChronoUnit.DAYS.between(start, end) + 1;
	}

	public static List<LocalDate> expandDateRange(LocalDate start, LocalDate end) {
		List<LocalDate> dates = new ArrayList<>();
		if (start == null || end == null || end.isBefore(start)) {
			return dates;
		}
		LocalDate current = start;
		while (!current.isAfter(end)) {
			dates.add(current);
			current = current.plusDays(1);
		}
		return dates;
	}

	/**
	 * Expands booking dates into individual daily slots.
	 * <p>
	 * If {@code endDate} is provided and differs from {@code startDate},
	 * the range is expanded into one entry per day (inclusive).
	 * Otherwise returns a single‑element list for {@code startDate}.
	 * </p>
	 */
	public static List<LocalDate> expandBookingDates(LocalDate startDate, LocalDate endDate) {
		if (startDate == null) return Collections.emptyList();
		if (endDate != null && !endDate.equals(startDate) && !endDate.isBefore(startDate)) {
			return expandDateRange(startDate, endDate);
		}
		return Collections.singletonList(startDate);
	}

}
