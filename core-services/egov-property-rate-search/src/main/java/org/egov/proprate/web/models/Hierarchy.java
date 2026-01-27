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
        private Tehsil tehsil; // District contains Tehsil
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Tehsil {
        private String code;
        private String name;
        @JsonProperty("village") 
        private Village village; // Tehsil contains Village
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Village {
        private String code;
        private String name;
        private Boolean isUrban;
        @JsonProperty("segment") 
        private Segment segment; // Village contains Segment
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Segment {
        private String code;
        private String name;
    }
}