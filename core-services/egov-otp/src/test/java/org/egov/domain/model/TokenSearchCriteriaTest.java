package org.egov.domain.model;

import org.egov.domain.exception.InvalidTokenSearchCriteriaException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenSearchCriteriaTest {

    @Test
    void should_not_throw_exception_when_search_criteria_has_mandatory_fields() {
        TokenSearchCriteria searchCriteria =
                new TokenSearchCriteria("uuid", "tenant");

        assertDoesNotThrow(searchCriteria::validate);
    }

    @Test
    void should_throw_validation_exception_when_tenant_id_is_not_present() {
        TokenSearchCriteria searchCriteria =
                new TokenSearchCriteria("uuid", null);

        assertTrue(searchCriteria.isTenantIdAbsent());

        assertThrows(
                InvalidTokenSearchCriteriaException.class,
                searchCriteria::validate
        );
    }

    @Test
    void should_throw_validation_exception_when_uuid_is_not_present() {
        TokenSearchCriteria searchCriteria =
                new TokenSearchCriteria(null, "tenant");

        assertTrue(searchCriteria.isIdAbsent());

        assertThrows(
                InvalidTokenSearchCriteriaException.class,
                searchCriteria::validate
        );
    }
}