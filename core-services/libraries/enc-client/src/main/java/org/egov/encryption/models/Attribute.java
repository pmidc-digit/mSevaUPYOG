package org.egov.encryption.models;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Attribute {

    private String name ;

    private String jsonPath ;

    private String patternId ;

    private Visibility defaultVisibility ;

}
