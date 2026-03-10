package org.egov.encryption.models;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SecurityPolicy {

    private String model ;

    private UniqueIdentifier uniqueIdentifier ;

    private List<Attribute> attributes ;

    private List<RoleBasedDecryptionPolicy> roleBasedDecryptionPolicy;

}
