package org.egov.rl.services.models;

import java.util.Set;

import org.egov.rl.services.models.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
	
	private Set<String> propertyId;
	
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

	private String currentDate;

	private Set<String> creationReason;
	
	private Set<String> documentNumbers;
	
	@Builder.Default
	private Boolean isSearchInternal = false;
	
	@Builder.Default
	private Boolean isExpaireFlag = true;

	@Builder.Default
	private Boolean isInboxSearch = false;
	
	@Builder.Default
	private Boolean isDefaulterNoticeSearch = false;
	
	@Builder.Default
	private Boolean isRequestForDuplicateAllotmentValidation = false;
	
	private Boolean isCitizen;

	@Builder.Default
	private Boolean isRequestForCount = false;

	@Builder.Default
	private Boolean isRequestForOldDataEncryption = false;

}
