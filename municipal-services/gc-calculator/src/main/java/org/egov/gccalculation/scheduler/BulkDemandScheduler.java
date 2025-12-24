//package org.egov.gccalculation.scheduler;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.extern.slf4j.Slf4j;
//import org.egov.common.contract.request.RequestInfo;
//import org.egov.common.contract.request.User;
//import org.egov.gccalculation.service.DemandService;
//import org.egov.gccalculation.service.GCCalculationService;
//import org.egov.gccalculation.web.models.BulkBillCriteria;
//import org.egov.gccalculation.web.models.OwnerInfo;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.i18n.LocaleContextHolder;
//import org.springframework.scheduling.annotation.EnableScheduling;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import java.time.Clock;
//import java.time.Instant;
//import java.util.Locale;
//import java.util.UUID;
//
//@Slf4j
//@Component
//@EnableScheduling
//public class BulkDemandScheduler {
//
//    @Autowired
//    private GCCalculationService wSCalculationService;
//
//    @Autowired
//    private DemandService demandService;
//
//    @Autowired
//    private ObjectMapper mapper;
//
//
//    @Scheduled(cron = "0 */2 * * * *", zone = "Asia/Kolkata")
//    public void runEveryMinute() {
//        log.info("Scheduled run: generateDemandBasedOnTimePeriod()");
//
//        // 1) Build RequestInfo with dynamic msgId and system user
//        RequestInfo requestInfo = new RequestInfo();
//        String systemUserUuid = "system";
//
//        try {
//            OwnerInfo owner = demandService.searchSystemUser();
//            if (owner != null) {
//                User user = mapper.convertValue(owner, User.class);
//                requestInfo.setUserInfo(user);
//                if (owner.getUuid() != null) {
//                    systemUserUuid = owner.getUuid();
//                }
//            }
//        } catch (Exception ex) {
//            log.error("Failed to obtain system user for BulkDemandScheduler: {}", ex.getMessage(), ex);
//            // Continue with minimal RequestInfo if your downstream allows it.
//        }
//j
//        // 2) Generate dynamic msgId
//        Locale locale = LocaleContextHolder.getLocale(); // falls back to JVM default if not set
//        String msgId = generateMsgId(locale);
//        requestInfo.setMsgId(msgId);
//
//        // Optional: also set requestId (use same msgId or a UUID)
//        requestInfo.setMsgId(msgId); // or UUID.randomUUID().toString()
//
//        // Optional: Set standard fields (helps downstream services)
//        requestInfo.setApiId("bulk-demand-scheduler");
//        requestInfo.setVer("1.0");
//        requestInfo.setTs(Instant.now(Clock.systemDefaultZone()).toEpochMilli());
//
//        try {
//            // 3) Build criteria
//            BulkBillCriteria bulkBillCriteria = new BulkBillCriteria();
//
//            // 4) Call service
//            wSCalculationService.generateDemandBasedOnTimePeriod(requestInfo, bulkBillCriteria);
//            log.info("Scheduled demand generation completed successfully. msgId={}", msgId);
//
//        } catch (Exception e) {
//            log.error("Scheduled demand generation failed. msgId={}. Error: {}", msgId, e.getMessage(), e);
//        }
//    }
//
//    /**
//     * Generates msgId in the format "<epochMillis>|<language>_<country>".
//     * Example: "1761117802172|en_IN"
//     */
//    private String generateMsgId(Locale locale) {
//        long millis = Instant.now().toEpochMilli();
//        String locTag = toLocaleTag(locale);
//        return millis + "|" + locTag;
//    }
//
//
//    private String toLocaleTag(Locale locale) {
//        if (locale == null) {
//            return "en_IN";
//        }
//        String lang = locale.getLanguage();
//        String country = locale.getCountry();
//
//        if (isBlank(lang) && isBlank(country)) {
//            return "en_IN";
//        }
//        if (isBlank(country)) {
//            return isBlank(lang) ? "en_IN" : lang; // e.g., "en"
//        }
//        return (isBlank(lang) ? "en" : lang) + "_" + country; // e.g., "en_IN"
//    }
//
//
//    private boolean isBlank(String s) {
//        return s == null || s.trim().isEmpty();
//    }
//
//}
