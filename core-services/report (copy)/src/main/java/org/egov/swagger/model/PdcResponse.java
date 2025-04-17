package org.egov.swagger.model;
import com.fasterxml.jackson.annotation.JsonProperty;

public class PdcResponse {

    public static class AuthorityData {
        @JsonProperty("authorityID")
        private String authorityId;
        
        @JsonProperty("authorityName")
        private String authorityName;
        
        @JsonProperty("departmentID")
        private String departmentId;
        
        @JsonProperty("TotalApplicationReceived")
        private String totalApplicationReceived;
        
        @JsonProperty("PendingBeyondTimelineApplicationCount")
        private String pendingBeyondTimelineApplicationCount;

        public AuthorityData(String authorityId, String authorityName, String departmentId, 
                             String totalApplicationReceived, String pendingBeyondTimelineApplicationCount) {
            this.authorityId = authorityId;
            this.authorityName = authorityName;
            this.departmentId = departmentId;
            this.totalApplicationReceived = totalApplicationReceived;
            this.pendingBeyondTimelineApplicationCount = pendingBeyondTimelineApplicationCount;
        }

        // Getters and setters (can be omitted if using @Data or @Getter and @Setter)
    }

    public static class DepartmentData {
        @JsonProperty("departmentID")
        private String departmentId;
        
        @JsonProperty("departmentName")
        private String departmentName;
        
        @JsonProperty("TotalApplicationReceived")
        private String totalApplicationReceived;
        
        @JsonProperty("PendingBeyondTimelineApplicationCount")
        private String pendingBeyondTimelineApplicationCount;

        public DepartmentData(String departmentId, String departmentName, String totalApplicationReceived, 
                              String pendingBeyondTimelineApplicationCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.totalApplicationReceived = totalApplicationReceived;
            this.pendingBeyondTimelineApplicationCount = pendingBeyondTimelineApplicationCount;
        }

        // Getters and setters
    }

    public static class ServiceData {
        @JsonProperty("serviceID")
        private String serviceId;
        
        @JsonProperty("serviceName")
        private String serviceName;
        
        @JsonProperty("authorityID")
        private String authorityId;
        
        @JsonProperty("departmentID")
        private String departmentId;
        
        @JsonProperty("TotalApplicationReceived")
        private String totalApplicationReceived;
        
        @JsonProperty("PendingBeyondTimelineApplicationCount")
        private String pendingBeyondTimelineApplicationCount;

        public ServiceData(String serviceId, String serviceName, String authorityId, String departmentId, 
                           String totalApplicationReceived, String pendingBeyondTimelineApplicationCount) {
            this.serviceId = serviceId;
            this.serviceName = serviceName;
            this.authorityId = authorityId;
            this.departmentId = departmentId;
            this.totalApplicationReceived = totalApplicationReceived;
            this.pendingBeyondTimelineApplicationCount = pendingBeyondTimelineApplicationCount;
        }

        // Getters and setters
    }
}
