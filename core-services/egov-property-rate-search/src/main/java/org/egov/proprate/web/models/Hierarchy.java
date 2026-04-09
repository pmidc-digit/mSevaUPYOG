package org.egov.proprate.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class Hierarchy {

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class District {
        private String code;
        private String name;
        @JsonProperty("tehsil") 
        private Tehsil tehsil;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Tehsil {
        private String code;
        private String name;
        @JsonProperty("village") 
        private Village village;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Village {
        private String code;
        private String name;
        private Boolean isUrban;
        @JsonProperty("segment") 
        private Segment segment;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Segment {
        private String code;
        private String name;
        @JsonProperty("subSegment") // Added: Segment now contains SubSegment
        private SubSegment subSegment;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class SubSegment { // New: SubSegment class
        private String code;
        private String name;
    }
}