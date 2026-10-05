package org.egov.hrms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class EmailRequest {
    private Set<String> emailTo;
    private String email;
    private String subject;
    private String body;

    @JsonProperty("isHTML")
    private boolean isHTML;

    @JsonProperty("isHTML")
    public boolean isHTML() {
        return isHTML;
    }

    @JsonProperty("isHTML")
    public void setHTML(boolean isHTML) {
        this.isHTML = isHTML;
    }

    @JsonProperty("html")
    public boolean getHtml() {
        return isHTML;
    }
}
