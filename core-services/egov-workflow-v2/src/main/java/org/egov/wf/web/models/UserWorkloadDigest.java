package org.egov.wf.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserWorkloadDigest {

    private String userUuid;
    private String tenantId;

    @Builder.Default
    private int totalApplications = 0;

    @Builder.Default
    private int underSlaCount = 0;

    @Builder.Default
    private int completingSlaCount = 0;

    @Builder.Default
    private int overSlaCount = 0;

    @Builder.Default
    private Map<String, Integer> serviceWiseCounts = new LinkedHashMap<>();

    @Builder.Default
    private Map<String, ServiceSla> serviceWiseSla = new LinkedHashMap<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceSla {
        private int total;
        private int underSla;
        private int completingSla;
        private int overSla;
    }

    public void addServiceCount(String businessService, int count) {
        if (businessService == null || businessService.trim().isEmpty()) {
            businessService = "General";
        }
        businessService = businessService.trim();
        int current = serviceWiseCounts.getOrDefault(businessService, 0);
        serviceWiseCounts.put(businessService, current + count);
        totalApplications += count;
    }

    public void addServiceSla(String businessService, int count, int underSla, int completingSla, int overSla) {
        addServiceCount(businessService, count);
        this.underSlaCount += underSla;
        this.completingSlaCount += completingSla;
        this.overSlaCount += overSla;

        String serviceKey = (businessService == null || businessService.trim().isEmpty()) ? "General" : businessService.trim();
        ServiceSla existing = serviceWiseSla.get(serviceKey);
        if (existing == null) {
            serviceWiseSla.put(serviceKey, new ServiceSla(count, underSla, completingSla, overSla));
        } else {
            existing.setTotal(existing.getTotal() + count);
            existing.setUnderSla(existing.getUnderSla() + underSla);
            existing.setCompletingSla(existing.getCompletingSla() + completingSla);
            existing.setOverSla(existing.getOverSla() + overSla);
        }
    }
}
