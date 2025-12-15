package org.egov.rl.service;

import lombok.extern.slf4j.Slf4j;

import java.util.Date;

import org.egov.rl.models.NotificationSchedule;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DailyJob {

 // Runs every day at 02:30 IST
// @Scheduled(cron = "0 12 2 * * *", zone = "Asia/Kolkata")
 @Scheduled(cron = "0 16 2 * * *", zone = "Asia/Kolkata")
 public void runDailyAt230IST() {
     log.info("Starting daily job at 02:30 IST");
     
    
     // TODO: put your service call or business logic here
     // e.g., myService.triggerDailySync();
     log.info("Finished daily job at 02:30 IST");
 }
}
