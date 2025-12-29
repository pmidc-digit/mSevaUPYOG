package org.egov.rl.calculator.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class DaysCycleCalculationService {

	@Autowired
	private MasterDataService masterDataService;

	// --------------------------------quterly
	// scheduler-----------------------------------------------------

	public long lastDayTimeOfCycle(long startDate, int cycle) {
		ZoneId zone = ZoneId.of("Asia/Kolkata");

		// Start ko IST zone me laao
		ZonedDateTime start = Instant.ofEpochMilli(startDate).atZone(zone);

		// Exclusive end: start + cycle months
		ZonedDateTime endExclusive = start.plusMonths(cycle);

		// Inclusive last moment: exclusive end se 1 millisecond pehle
		long lastMillis = endExclusive.toInstant().toEpochMilli() - 1;

		return lastMillis;
	}

	public long firstDay(long startDate) {
		ZoneId zone = ZoneId.of("Asia/Kolkata");

		// Start ko IST zone me laao
		ZonedDateTime start = Instant.ofEpochMilli(startDate).atZone(zone);

		// Exclusive end: start + cycle months
		ZonedDateTime endExclusive = start.plusDays(1);

		// Inclusive last moment: exclusive end se 1 millisecond pehle
		long lastMillis = endExclusive.toInstant().toEpochMilli() - 1;

		return lastMillis;
	}

	public long diffDay(long day) {
		ZoneId zone = ZoneId.of("Asia/Kolkata");
		LocalDate startDate = Instant.ofEpochMilli(day).atZone(zone).toLocalDate();
		LocalDate today = LocalDate.now(zone);
		
        // Inclusive/Exclusive rule: ChronoUnit.DAYS is date-to-date difference (exclusive of start date)
		long daysDiff = ChronoUnit.DAYS.between(startDate, today);
		return daysDiff;
	}

	// --------------------------------monthly
	// scheduler-----------------------------------------------------

	public LocalDate firstDayOfMonth(String monthName, int currentYear) {
		Month month = parseFullMonthName(monthName);
		return LocalDate.of(currentYear, month, 1);
	}

	// Month name (FULL) ko parse karke last day
	public LocalDate lastDayOfMonth(String monthName, int currentYear) {
		LocalDate first = firstDayOfMonth(monthName, currentYear);
		return first.withDayOfMonth(first.lengthOfMonth());
	}

	// "MMMM" (FULL month name) ke liye parser: Locale.ENGLISH
	public Month parseFullMonthName(String monthName) {
		try {
			DateTimeFormatter fullFmt = DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH);
			return Month.from(fullFmt.parse(monthName));
		} catch (DateTimeParseException e) {
			// Fallback: Month enum via uppercase (e.g., "DECEMBER")
			return Month.valueOf(monthName.trim().toUpperCase(Locale.ENGLISH));
		}
	}

	public long formatDay(LocalDate date, boolean endOfDay) {
		ZoneId zone = ZoneId.of("Asia/Kolkata");
		ZonedDateTime zdt = endOfDay ? date.atTime(java.time.LocalTime.MAX).atZone(zone) : date.atStartOfDay(zone);
		DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss z");
		ZonedDateTime parsed = ZonedDateTime.parse(zdt.format(fmt), fmt);
		// Step 3: Convert to epochMilli (long)
		return parsed.toInstant().toEpochMilli();
	}

	public long add15Days(long sdate) {
		// Convert long → LocalDate
		LocalDate date = Instant.ofEpochMilli(sdate).atZone(ZoneId.systemDefault()).toLocalDate();

		// Same month ka 15th day
		LocalDate fifteenthDay = date.withDayOfMonth(15);

		// Convert back to epoch milli (start of day)
		long fifteenthEpochMilli = fifteenthDay.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

		log.info("Original Date: {} " , date);
		log.info("15th Day of Month: {} " , fifteenthDay);
		log.info("Epoch Milli of 15th Day: {} " , fifteenthEpochMilli);
		return fifteenthEpochMilli;
	}
	public long minus5Days(long sdate) {
		// Convert long → LocalDate
		LocalDate date = Instant.ofEpochMilli(sdate).atZone(ZoneId.systemDefault()).toLocalDate();

		// Same month ka 15th day
		LocalDate fifteenthDay = date.minusDays(5);

		// Convert back to epoch milli (start of day)
		long fifteenthEpochMilli = fifteenthDay.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

		log.info("Original Date: " + date);
		log.info("15th Day of Month: " + fifteenthDay);
		log.info("Epoch Milli of 15th Day: " + fifteenthEpochMilli);
		return fifteenthEpochMilli;
	}
	
	public long addAfterPenaltyDays(long sdate, RequestInfo requestInfo, String tenantId) {
		// Convert long → LocalDate
		LocalDate date = Instant.ofEpochMilli(sdate).atZone(ZoneId.systemDefault()).toLocalDate();
		int afterday = masterDataService.getPenaltySlabs(requestInfo, tenantId).get(0).getApplicableAfterDays();
		date = date.plusDays(afterday);
		// Same month ka 15th day
//		LocalDate fifteenthDay = date.withDayOfMonth(afterday);

		// Convert back to epoch milli (start of day)
		long fifteenthEpochMilli = date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

		log.info("Original Date : {} " , date);
		log.info("added 15th Day of Month : {} ", fifteenthEpochMilli);
		log.info("Epoch Milli of 15th Day: {} ", fifteenthEpochMilli);
		return fifteenthEpochMilli;
	}
}
