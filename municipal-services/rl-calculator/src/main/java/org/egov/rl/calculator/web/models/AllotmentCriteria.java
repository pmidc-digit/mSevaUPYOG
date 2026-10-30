package org.egov.rl.calculator.web.models;

import lombok.*;

import java.util.Set;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllotmentCriteria {

	private String tenantId;

	private Set<String> allotmentIds;

	private Set<String> tenantIds;
	
	private Set<String> applicationNumbers;
	
	private Set<String> uuids;

	private Set<String> oldAllotmentIds;
	
	private Set<Status> status;

	private String mobileNumber;

	private String name;
	
	private Set<String> ownerIds;
	
	private boolean audit;
	
	private Long offset;

	private Long limit;

	private Long fromDate;

	private Long toDate;

	private Set<String> creationReason;
	
	private Set<String> documentNumbers;
	
	@Builder.Default
	private Boolean isSearchInternal = false;

	@Builder.Default
	private Boolean isInboxSearch = false;
	
	@Builder.Default
	private Boolean isDefaulterNoticeSearch = false;
	
	@Builder.Default
	private Boolean isReportSearch = false;
	
	@Builder.Default
	private Boolean isRequestForDuplicateAllotmentValidation = false;
	
	private Boolean isCitizen;

	@Builder.Default
	private Boolean isRequestForCount = false;

	@Builder.Default
	private Boolean isRequestForOldDataEncryption = false;

}
