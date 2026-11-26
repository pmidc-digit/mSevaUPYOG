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
    private int overSlaExceededLimitCount = 0;

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
        private int overSlaExceededLimit = 0;

        @Builder.Default
        private Map<String, Integer> tenantCounts = new LinkedHashMap<>();

        @Builder.Default
        private Map<String, ServiceSla> tenantSla = new LinkedHashMap<>();

        public ServiceSla(int total, int underSla, int completingSla, int overSla) {
            this(total, underSla, completingSla, overSla, 0);
        }

        public ServiceSla(int total, int underSla, int completingSla, int overSla, int overSlaExceededLimit) {
            this.total = total;
            this.underSla = underSla;
            this.completingSla = completingSla;
            this.overSla = overSla;
            this.overSlaExceededLimit = overSlaExceededLimit;
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
        addServiceSla(businessService, null, count, underSla, completingSla, overSla, 0);
    }

    public void addServiceSla(String businessService, String tenantId, int count, int underSla, int completingSla, int overSla) {
        addServiceSla(businessService, tenantId, count, underSla, completingSla, overSla, 0);
    }

    public void addServiceSla(String businessService, String tenantId, int count, int underSla, int completingSla, int overSla, int overSlaExceededLimit) {
        addServiceCount(businessService, count);
        this.underSlaCount += underSla;
        this.completingSlaCount += completingSla;
        this.overSlaCount += overSla;
        this.overSlaExceededLimitCount += overSlaExceededLimit;

        if (StringUtils.isNotBlank(tenantId)) {
            this.tenantIds.add(tenantId.trim());
        }

        String serviceKey = (businessService == null || businessService.trim().isEmpty()) ? "General" : businessService.trim();
        ServiceSla existing = serviceWiseSla.get(serviceKey);
        if (existing == null) {
            existing = new ServiceSla(count, underSla, completingSla, overSla, overSlaExceededLimit);
            serviceWiseSla.put(serviceKey, existing);
        } else {
            existing.setTotal(existing.getTotal() + count);
            existing.setUnderSla(existing.getUnderSla() + underSla);
            existing.setCompletingSla(existing.getCompletingSla() + completingSla);
            existing.setOverSla(existing.getOverSla() + overSla);
            existing.setOverSlaExceededLimit(existing.getOverSlaExceededLimit() + overSlaExceededLimit);
        }

        if (StringUtils.isNotBlank(tenantId)) {
            String t = tenantId.trim();
            existing.getTenantCounts().put(t, existing.getTenantCounts().getOrDefault(t, 0) + count);
            ServiceSla tSla = existing.getTenantSla().computeIfAbsent(t, k -> new ServiceSla(0, 0, 0, 0, 0));
            tSla.setTotal(tSla.getTotal() + count);
            tSla.setUnderSla(tSla.getUnderSla() + underSla);
            tSla.setCompletingSla(tSla.getCompletingSla() + completingSla);
            tSla.setOverSla(tSla.getOverSla() + overSla);
            tSla.setOverSlaExceededLimit(tSla.getOverSlaExceededLimit() + overSlaExceededLimit);
        }
    }

    /**
     * Filters out applications whose SLA has expired by more than the configured limit (e.g. 2 days)
     * exclusively for citizens. Adjusts total applications, SLA metrics, and removes empty services.
     */
    public void filterForCitizen() {
        if (this.overSlaExceededLimitCount > 0) {
            this.totalApplications = Math.max(0, this.totalApplications - this.overSlaExceededLimitCount);
            this.overSlaCount = Math.max(0, this.overSlaCount - this.overSlaExceededLimitCount);

            for (Map.Entry<String, ServiceSla> entry : serviceWiseSla.entrySet()) {
                ServiceSla sSla = entry.getValue();
                if (sSla.getOverSlaExceededLimit() > 0) {
                    sSla.setTotal(Math.max(0, sSla.getTotal() - sSla.getOverSlaExceededLimit()));
                    sSla.setOverSla(Math.max(0, sSla.getOverSla() - sSla.getOverSlaExceededLimit()));
                    serviceWiseCounts.put(entry.getKey(), sSla.getTotal());
                }
                if (sSla.getTenantSla() != null) {
                    for (Map.Entry<String, ServiceSla> tEntry : sSla.getTenantSla().entrySet()) {
                        ServiceSla tSla = tEntry.getValue();
                        if (tSla.getOverSlaExceededLimit() > 0) {
                            tSla.setTotal(Math.max(0, tSla.getTotal() - tSla.getOverSlaExceededLimit()));
                            tSla.setOverSla(Math.max(0, tSla.getOverSla() - tSla.getOverSlaExceededLimit()));
                            sSla.getTenantCounts().put(tEntry.getKey(), tSla.getTotal());
                        }
                    }
                    sSla.getTenantCounts().entrySet().removeIf(e -> e.getValue() <= 0);
                    sSla.getTenantSla().entrySet().removeIf(e -> e.getValue().getTotal() <= 0);
                }
            }
            serviceWiseCounts.entrySet().removeIf(e -> e.getValue() <= 0);
            serviceWiseSla.entrySet().removeIf(e -> e.getValue().getTotal() <= 0);

            if (this.tenantIds != null) {
                Set<String> activeTenants = new LinkedHashSet<>();
                for (ServiceSla s : serviceWiseSla.values()) {
                    activeTenants.addAll(s.getTenantCounts().keySet());
                }
                this.tenantIds = activeTenants;
                if (!activeTenants.isEmpty() && (this.tenantId == null || !activeTenants.contains(this.tenantId))) {
                    this.tenantId = activeTenants.iterator().next();
                } else if (activeTenants.isEmpty()) {
                    this.tenantId = null;
                }
            }
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
