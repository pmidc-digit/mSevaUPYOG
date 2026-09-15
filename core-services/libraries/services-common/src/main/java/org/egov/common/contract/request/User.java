package org.egov.common.contract.request;

import lombok.*;

import jakarta.validation.constraints.Size;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    private Long id;

    @Size(max = 180)
    private String userName;

    @Size(max = 250)
    private String name;

    @Size(max = 50)
    private String type;

    @Size(max = 150)
    private String mobileNumber;

    @Size(max = 300)
    private String emailId;

    private List<Role> roles;

    @Size(max = 256)
    private String tenantId;

    @Size(max = 36)
    private String uuid;
    
}

