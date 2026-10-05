package org.egov.hrms.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class EmployeeEmailRecipient {
    private String uuid;
    private String code;
    private String name;
    private String emailId;
    private String mobileNumber;
    private String tenantId;
}
