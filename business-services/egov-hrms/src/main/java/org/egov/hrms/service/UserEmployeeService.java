
package org.egov.hrms.service;

import lombok.RequiredArgsConstructor;
import org.egov.common.contract.request.RequestInfo;

import org.egov.hrms.model.AuditDetails;
import org.egov.hrms.model.UserEmployee;
import org.egov.hrms.repository.UserEmployeeRepository;
import org.egov.hrms.web.contract.UserEmployeeRequest;
import org.egov.hrms.web.contract.UserEmployeeResponse;
import org.egov.hrms.web.contract.UserEmployeeSearchCriteria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserEmployeeService {

    private final UserEmployeeRepository repository;

    @Transactional
    public UserEmployeeResponse create(UserEmployeeRequest userEmployeeRequest) {
        final RequestInfo requestInfo = userEmployeeRequest.getRequestInfo();
        final List<UserEmployee> users = userEmployeeRequest.getUserEmployees();

        validateUsers(users);

        final String requesterUuid = extractRequesterUuid(requestInfo);
        final long now = Instant.now().toEpochMilli();

        for (UserEmployee ue : users) {
            // Normalize strings
            ue.setCategory(normalize(ue.getCategory()));
            ue.setSubcategory(normalize(ue.getSubcategory()));
            ue.setZone(normalize(ue.getZone()));
            ue.setTenantId(normalize(ue.getTenantId()));

            AuditDetails ad = ue.getAuditDetails();
            if (ad == null) {
                ue.setAuditDetails(
                        AuditDetails.builder()
                                .createdBy(requesterUuid)
                                .createdDate(now)
                                .lastModifiedBy(requesterUuid)
                                .lastModifiedDate(now)
                                .build()
                );
            } else {
                if (ad.getCreatedBy() == null) ad.setCreatedBy(requesterUuid);
                if (ad.getCreatedDate() == null) ad.setCreatedDate(now);
                ad.setLastModifiedBy(requesterUuid);
                ad.setLastModifiedDate(now);
            }
        }

        repository.saveAll(users);

        return UserEmployeeResponse.builder()
                .userEmployees(users)
                .build();
    }

    @Transactional(readOnly = true)
    public UserEmployeeResponse search(UserEmployeeSearchCriteria criteria, RequestInfo requestInfo) {
        criteria.setTenantId(normalize(criteria.getTenantId()));
        criteria.setCategory(normalize(criteria.getCategory()));
        criteria.setSubcategory(normalize(criteria.getSubcategory()));
        criteria.setZone(normalize(criteria.getZone()));

        List<UserEmployee> results = repository.search(criteria);

        return UserEmployeeResponse.builder()
                .userEmployees(results)
                .build();
    }

    // ----------------- Helpers -----------------

    private String extractRequesterUuid(RequestInfo requestInfo) {
        if (requestInfo == null) return "system";
        RequestInfo ui = requestInfo;
        return (ui != null && ui.getUserInfo().getUuid() != null) ? ui.getUserInfo().getUuid() : "system";
    }

    private String normalize(String s) {
        return (s == null) ? null : (s.trim().isEmpty() ? null : s.trim());
    }

    private void validateUsers(List<UserEmployee> users) {
        if (users == null || users.isEmpty()) {
            throw new IllegalArgumentException("UserEmployees list must not be null or empty.");
        }

        Set<Long> seenIds = new HashSet<Long>();
        int index = 0;

        for (UserEmployee ue : users) {
            if (ue == null) {
                throw new IllegalArgumentException("UserEmployee entry at index " + index + " must not be null.");
            }

            if (ue.getId() == null) {
                throw new IllegalArgumentException("UserEmployee.id is required at index " + index + ".");
            }

            if (seenIds.contains(ue.getId())) {
                throw new IllegalArgumentException("Duplicate UserEmployee.id " + ue.getId() +
                        " found within request at index " + index + ".");
            } else {
                seenIds.add(ue.getId());
            }

            String tenantId = normalize(ue.getTenantId());
            if (tenantId == null) {
                throw new IllegalArgumentException("UserEmployee.tenantId is required at index " + index + ".");
            }
            if (tenantId.length() > 250) {
                throw new IllegalArgumentException("UserEmployee.tenantId length must be <= 250 at index " + index + ".");
            }

            String category = normalize(ue.getCategory());
            if (category == null) {
                throw new IllegalArgumentException("UserEmployee.category is required at index " + index + ".");
            }
            if (category.length() > 256) {
                throw new IllegalArgumentException("UserEmployee.category length must be <= 256 at index " + index + ".");
            }

            String subcategory = normalize(ue.getSubcategory());
            if (subcategory == null) {
                throw new IllegalArgumentException("UserEmployee.subcategory is required at index " + index + ".");
            }
            if (subcategory.length() > 256) {
                throw new IllegalArgumentException("UserEmployee.subcategory length must be <= 256 at index " + index + ".");
            }

            String zone = normalize(ue.getZone());
            if (zone == null) {
                throw new IllegalArgumentException("UserEmployee.zone is required at index " + index + ".");
            }
            if (zone.length() > 256) {
                throw new IllegalArgumentException("UserEmployee.zone length must be <= 256 at index " + index + ".");
            }

            index++;
        }
    }
}
