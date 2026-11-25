package org.egov.wf.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserWorkloadDigest {

    private String userUuid;
    private String tenantId;

    @Builder.Default
    private Set<String> tenantIds = new LinkedHashSet<>();

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

        @Builder.Default
        private Map<String, Integer> tenantCounts = new LinkedHashMap<>();

        @Builder.Default
        private Map<String, ServiceSla> tenantSla = new LinkedHashMap<>();

        public ServiceSla(int total, int underSla, int completingSla, int overSla) {
            this.total = total;
            this.underSla = underSla;
            this.completingSla = completingSla;
            this.overSla = overSla;
            this.tenantCounts = new LinkedHashMap<>();
            this.tenantSla = new LinkedHashMap<>();
        }
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
        addServiceSla(businessService, null, count, underSla, completingSla, overSla);
    }

    public void addServiceSla(String businessService, String tenantId, int count, int underSla, int completingSla, int overSla) {
        addServiceCount(businessService, count);
        this.underSlaCount += underSla;
        this.completingSlaCount += completingSla;
        this.overSlaCount += overSla;

        if (StringUtils.isNotBlank(tenantId)) {
            this.tenantIds.add(tenantId.trim());
        }

        String serviceKey = (businessService == null || businessService.trim().isEmpty()) ? "General" : businessService.trim();
        ServiceSla existing = serviceWiseSla.get(serviceKey);
        if (existing == null) {
            existing = new ServiceSla(count, underSla, completingSla, overSla);
            serviceWiseSla.put(serviceKey, existing);
        } else {
            existing.setTotal(existing.getTotal() + count);
            existing.setUnderSla(existing.getUnderSla() + underSla);
            existing.setCompletingSla(existing.getCompletingSla() + completingSla);
            existing.setOverSla(existing.getOverSla() + overSla);
        }

        if (StringUtils.isNotBlank(tenantId)) {
            String t = tenantId.trim();
            existing.getTenantCounts().put(t, existing.getTenantCounts().getOrDefault(t, 0) + count);
            ServiceSla tSla = existing.getTenantSla().computeIfAbsent(t, k -> new ServiceSla(0, 0, 0, 0));
            tSla.setTotal(tSla.getTotal() + count);
            tSla.setUnderSla(tSla.getUnderSla() + underSla);
            tSla.setCompletingSla(tSla.getCompletingSla() + completingSla);
            tSla.setOverSla(tSla.getOverSla() + overSla);
        }
    }

    public String getEffectiveTenantId(String defaultStateTenant) {
        if (tenantIds != null && tenantIds.size() > 1) {
            return StringUtils.defaultIfBlank(defaultStateTenant, "pb");
        }
        if (StringUtils.isNotBlank(this.tenantId)) {
            return this.tenantId;
        }
        if (tenantIds != null && !tenantIds.isEmpty()) {
            return tenantIds.iterator().next();
        }
        return StringUtils.defaultIfBlank(defaultStateTenant, "pb");
    }
}
