package org.egov.rl.calculator.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.web.models.DemandPerioud;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MonthCalculationService {
	
	@Autowired
	private MasterDataService masterDataService;

	// --------------------------------quterly scheduler-----------------------------------------------------

	public static LocalDate lastDayOfQuaterly(String monthName, int currentYear) {
		LocalDate first = firstDayOfMonth(monthName, currentYear);
		return first.withDayOfMonth(first.lengthOfMonth()).plusMonths(2);
	}
	
	public static LocalDate lastDayOfHelfYearly(String monthName, int currentYear) {
		LocalDate first = firstDayOfMonth(monthName, currentYear);
		return first.withDayOfMonth(first.lengthOfMonth()).plusMonths(5);
	}
	
	public static LocalDate lastDayOfYearly(String monthName, int currentYear) {
		LocalDate first = firstDayOfMonth(monthName, currentYear);
		return first.withDayOfMonth(first.lengthOfMonth()).plusMonths(11);
	}
	
	// --------------------------------monthly scheduler----------------------------------------------------- 
	
	public static LocalDate firstDayOfMonth(String monthName, int currentYear) {
		Month month = parseFullMonthName(monthName);
		return LocalDate.of(currentYear, month, 1);
	}

	// Month name (FULL) ko parse karke last day
	public static LocalDate lastDayOfMonth(String monthName, int currentYear) {
		LocalDate first = firstDayOfMonth(monthName, currentYear);
		return first.withDayOfMonth(first.lengthOfMonth());
	}

	// "MMMM" (FULL month name) ke liye parser: Locale.ENGLISH
	public static Month parseFullMonthName(String monthName) {
		try {
			DateTimeFormatter fullFmt = DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH);
			return Month.from(fullFmt.parse(monthName));
		} catch (DateTimeParseException e) {
			// Fallback: Month enum via uppercase (e.g., "DECEMBER")
			return Month.valueOf(monthName.trim().toUpperCase(Locale.ENGLISH));
		}
	}

	public static long formatDay(LocalDate date, boolean endOfDay) {
		ZoneId zone = ZoneId.of("Asia/Kolkata");
		ZonedDateTime zdt = endOfDay ? date.atTime(java.time.LocalTime.MAX).atZone(zone) : date.atStartOfDay(zone);
		DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss z");
		ZonedDateTime parsed = ZonedDateTime.parse(zdt.format(fmt), fmt);
		// Step 3: Convert to epochMilli (long)
		return parsed.toInstant().toEpochMilli();
	}

	
	
//	public List<DemandPerioud> datePerioudCalculate(String oneMonth,long startEpochMilli, long endEpochMilli,String applicationNumber) {
//
//		LocalDate startDate = Instant.ofEpochMilli(startEpochMilli)
//                .atZone(ZoneId.systemDefault())
//                .toLocalDate();
//		LocalDate endDate = Instant.ofEpochMilli(endEpochMilli)
//                .atZone(ZoneId.systemDefault())
//                .toLocalDate();
//		
//		// Total months difference
//		long monthsBetween = ChronoUnit.MONTHS.between(startDate.withDayOfMonth(1), endDate.withDayOfMonth(1));
////		System.out.println("Total Months: " + monthsBetween);
//		int monthcount = 0;
//		// Print month names
//		LocalDate tempDate = startDate;
//		List<DemandPerioud> demandPerioudList=new ArrayList<>();
//		while (!tempDate.isAfter(endDate)) {
//			tempDate = tempDate.plusMonths(1);
//			++monthcount;
//			Month month = tempDate.getMonth();
//			int year = tempDate.getYear();
//			if (monthcount == 1) {
//				long startDay = startDate.atStartOfDay(ZoneId.systemDefault()) // दिन की शुरुआत
//						.toInstant().toEpochMilli();
//				long endDay = formatDay(lastDayOfMonth(month.toString(), year), true);
//				long exparyDate=add15Days(endDay);
//				demandPerioudList.add(DemandPerioud.builder()
//						.consumerType(applicationNumber)
//						.startDate(startDay)
//						.endDate(endDay)
//						.expireDate(exparyDate)
//						.cycle(month.toString())
//						.build());	
//
//			} else if (monthcount == monthsBetween) {
//
//				long startDay = formatDay(firstDayOfMonth(month.toString(), year), false);
//				long endDay = endDate.atStartOfDay(ZoneId.systemDefault()) // दिन की शुरुआत
//						.toInstant().toEpochMilli();
//				long exparyDate=add15Days(endDay);
//				demandPerioudList.add(DemandPerioud.builder()
//						.consumerType(applicationNumber)
//						.startDate(startDay)
//						.endDate(endDay)
//						.expireDate(exparyDate)
//						.cycle(month.toString())
//						.build());	
//			} else {
//				long endDay = formatDay(lastDayOfMonth(month.toString(), year), true);
//				long startDay = formatDay(firstDayOfMonth(month.toString(), year), false);
//				long exparyDate=add15Days(endDay);
//				demandPerioudList.add(DemandPerioud.builder()
//						.consumerType(applicationNumber)
//						.startDate(startDay)
//						.endDate(endDay)
//						.expireDate(exparyDate)
//						.cycle(month.toString())
//						.build());	
//			}
//		}
//		
//		return demandPerioudList.stream().filter(m->m.getCycle().equals(null)?true:m.getCycle().equals(oneMonth)).collect(Collectors.toList());
//	}


//	private boolean returnEndDate(long date) {
//
//		// Convert long (epoch milli) to LocalDate
//		LocalDate start = Instant.ofEpochMilli(date).atZone(ZoneId.systemDefault()).toLocalDate();
//
//		// Current month
//		YearMonth currentMonth = YearMonth.now();
//
//		// Start month
//		YearMonth startMonth = YearMonth.from(start);
//
//		// Check if startDate is in current month
//		boolean isSameMonth = currentMonth.equals(startMonth);
//
//		System.out.println("Start Date: " + start);
//		System.out.println("Current Month: " + currentMonth);
//		System.out.println("Is startDate in current month? " + isSameMonth);
//		return isSameMonth;
//
//	}

	

	public long add15Days(long sdate) {
		// Convert long → LocalDate
		LocalDate date = Instant.ofEpochMilli(sdate).atZone(ZoneId.systemDefault()).toLocalDate();

		// Same month ka 15th day
		LocalDate fifteenthDay = date.withDayOfMonth(15);

		// Convert back to epoch milli (start of day)
		long fifteenthEpochMilli = fifteenthDay.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

		System.out.println("Original Date: " + date);
		System.out.println("15th Day of Month: " + fifteenthDay);
		System.out.println("Epoch Milli of 15th Day: " + fifteenthEpochMilli);
		return fifteenthEpochMilli;
	}
	
	public long addAfterPenaltyDays(long sdate,RequestInfo requestInfo,String tenantId) {
		// Convert long → LocalDate
		LocalDate date = Instant.ofEpochMilli(sdate).atZone(ZoneId.systemDefault()).toLocalDate();
		int afterday=masterDataService.getPenaltySlabs(requestInfo, tenantId).get(0).getApplicableAfterDays();
		date=date.plusDays(afterday);
		// Same month ka 15th day
//		LocalDate fifteenthDay = date.withDayOfMonth(afterday);

		// Convert back to epoch milli (start of day)
		long fifteenthEpochMilli = date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();

		System.out.println("Original Date: " + date);
		System.out.println("added 15th Day of Month: " + fifteenthEpochMilli);
		System.out.println("Epoch Milli of 15th Day: " + fifteenthEpochMilli);
		return fifteenthEpochMilli;
	}
}
