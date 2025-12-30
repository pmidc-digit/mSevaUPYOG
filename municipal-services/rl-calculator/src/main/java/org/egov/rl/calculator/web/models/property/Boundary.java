package org.egov.rl.calculator.web.models.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * Boundary
 */
@Validated
@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2018-05-11T14:12:44.497+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Boundary   {
	
        @NotNull
        @JsonProperty("code")
        private String code;

        @JsonProperty("name")
        private String name;
        
        @NotEmpty
        @JsonProperty("area")
        private String area;

        @JsonProperty("label")
        private String label;

        @JsonProperty("latitude")
        private String latitude;

        @JsonProperty("longitude")
        private String longitude;

        @JsonProperty("children")
        @Valid
        private List<Boundary> children;

        @JsonProperty("materializedPath")
        private String materializedPath;


        public Boundary addChildrenItem(Boundary childrenItem) {
            if (this.children == null) {
            this.children = new ArrayList<>();
            }
        this.children.add(childrenItem);
        return this;
        }

}

