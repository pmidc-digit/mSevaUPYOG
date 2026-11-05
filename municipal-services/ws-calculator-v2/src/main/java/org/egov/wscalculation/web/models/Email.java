package org.egov.wscalculation.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
@Builder
public class Email {
    private Set<String> emailTo;
    private Set<String> emailCc;
    private String subject;
    private String body;
    @JsonProperty("isHTML")
    private boolean isHTML;
}
