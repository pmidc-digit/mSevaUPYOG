package org.egov.rl.service;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.egov.rl.models.NotificationSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DailyJob {

	@Autowired
	NotificationSchedullerService notificationSchedullerService;
//
//	// Runs every day at 02:30 IST // 24 hr time
//// @Scheduled(cron = "0 12 2 * * *", zone = "Asia/Kolkata")
//	@Scheduled(cron = "0 20 8 * * *", zone = "Asia/Kolkata")
//	public void runDailyAt230IST() {
//		notificationSchedullerService.scheduller();
//	}

	// Runs every 3 day at 02:30 IST // 24 hr time
	@Scheduled(cron = "0 20 8 * * *", zone = "Asia/Kolkata")
	public void runEvery3DaysCron() {
		LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));

		// Start date (example)
		LocalDate startDate = LocalDate.of(2025, 12, 16);

		long days = ChronoUnit.DAYS.between(startDate, today);

		if (days % 3 == 0) {
			notificationSchedullerService.scheduller();
		}
	}

}
