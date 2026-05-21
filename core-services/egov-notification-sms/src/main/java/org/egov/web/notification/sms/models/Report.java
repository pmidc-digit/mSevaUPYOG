package org.egov.web.notification.sms.models;


import lombok.*;
//import org.hibernate.validator.constraints.SafeHtml;

import java.util.Date;

import jakarta.validation.constraints.Pattern;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@ToString
public class Report {

	@Pattern(regexp = "^[a-zA-Z0-9_-]*$")
    private String jobno;

    @Pattern(regexp = "^[a-zA-Z0-9_-]*$")
    private int messagestatus;

    @Pattern(regexp = "^[a-zA-Z0-9_-]*$")
    private String DoneTime;

    @Pattern(regexp = "^[a-zA-Z0-9_-]*$")
    private String usernameHash;
}
