package org.egov.encryption.models;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttributeAccess {

    private String attribute ;

    private Visibility firstLevelVisibility ;

    private Visibility secondLevelVisibility ;

}
