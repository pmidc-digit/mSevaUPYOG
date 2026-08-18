package org.egov.domain.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

public class TokenTest {

    private static final String IST = "Asia/Calcutta";

    @Test
    void test_is_expired_should_return_false_when_token_expiry_is_in_the_future() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of(IST));

        Token token = Token.builder()
                .expiryDateTime(now.plusSeconds(30))
                .build();

        assertFalse(token.isExpired(now));
    }

    @Test
    void test_is_expired_should_return_false_when_token_expiry_is_now() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of(IST));

        Token token = Token.builder()
                .expiryDateTime(now)
                .build();

        assertFalse(token.isExpired(now));
    }

    @Test
    void test_is_expired_should_return_true_when_token_expiry_is_in_the_past() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of(IST));

        Token token = Token.builder()
                .expiryDateTime(now.minusSeconds(30))
                .build();

        assertTrue(token.isExpired(now));
    }
}