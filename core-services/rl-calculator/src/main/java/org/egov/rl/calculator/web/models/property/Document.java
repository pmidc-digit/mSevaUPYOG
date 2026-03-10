package org.egov.rl.calculator.web.models.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * This object holds list of documents attached during the transaciton for a property
 */
@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2018-05-11T14:12:44.497+05:30")

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(exclude={"documentType"})
public class Document   {
        @JsonProperty("id")
        private String id;

        @JsonProperty("documentType")
        private String documentType;

        @JsonProperty("fileStore")
        private String fileStore;
}

