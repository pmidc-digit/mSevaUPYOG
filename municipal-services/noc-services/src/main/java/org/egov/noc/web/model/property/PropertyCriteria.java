package org.egov.noc.web.model.property;

import lombok.*;

import java.util.Set;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyCriteria {

	private String tenantId;

	private Set<String> propertyIds;

	private Set<String> tenantIds;
	
	private Set<String> acknowledgementIds;
	
	private Set<String> uuids;

	private Set<String> oldpropertyids;
	
	private Set<Status> status;

	private String mobileNumber;

	private String name;
	
	private Set<String> ownerIds;
	
	private boolean audit;
	
	private Long offset;

	private Long limit;

	private Long fromDate;

	private Long toDate;
	
	private String locality;

	private String doorNo;

	private String oldPropertyId;
	
	private String propertyType;

	private Set<String> creationReason;
	
	private Set<String> documentNumbers;
	
	@Builder.Default
	private Boolean isSearchInternal = false;

	@Builder.Default
	private Boolean isInboxSearch = false;
	
	@Builder.Default
	private Boolean isDefaulterNoticeSearch = false;
	
	@Builder.Default
	private Boolean isRequestForDuplicatePropertyValidation = false;
	
	private Boolean isCitizen;

	@Builder.Default
	private Boolean isRequestForCount = false;

	@Builder.Default
	private Boolean isRequestForOldDataEncryption = false;
	
	private String surveyId;

    private Boolean plainSearchOffset;
}
