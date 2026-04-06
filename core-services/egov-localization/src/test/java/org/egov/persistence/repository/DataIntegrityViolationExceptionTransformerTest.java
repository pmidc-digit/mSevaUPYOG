package org.egov.persistence.repository;

import org.egov.domain.model.DuplicateMessageIdentityException;
import org.egov.domain.model.MessagePersistException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertThrows;

public class DataIntegrityViolationExceptionTransformerTest {

    @Test
    public void test_should_convert_data_integrity_exception_for_unique_constraint_violation_to_domain_exception() {
        final String message = "ERROR: duplicate key value violates unique constraint \"unique_message_entry\"";
        final DataIntegrityViolationException exception = new DataIntegrityViolationException(message);

        assertThrows(DuplicateMessageIdentityException.class, () -> {
            new DataIntegrityViolationExceptionTransformer(exception).transform();
        });
    }

    @Test
    public void test_should_convert_unknown_data_integrity_exception_to_domain_exception() {
        final String message = "ERROR: duplicate key value violates unique constraint \"foo\"";
        final DataIntegrityViolationException exception = new DataIntegrityViolationException(message);

        assertThrows(MessagePersistException.class, () -> {
            new DataIntegrityViolationExceptionTransformer(exception).transform();
        });
    }

}