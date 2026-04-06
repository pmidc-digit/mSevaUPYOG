package org.egov.persistence.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.egov.TestConfiguration;
import org.egov.persistence.entity.Message;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.util.StringUtils;


@Import(TestConfiguration.class)
public class MessageJpaRepositoryTest {

    @Autowired
    private MessageJpaRepository messageJpaRepository;

    @Test
    @Disabled
    @Sql(scripts = {"/sql/clearMessages.sql", "/sql/createMessages.sql"})
    public void shouldFetchMessagesForGivenTenantAndLocale() {
        final List<Message> actualMessages = messageJpaRepository
            .find("tenant1", "en_US");

        assertEquals(2, actualMessages.size());
    }

    @Test
    @Disabled
    @Sql(scripts = {"/sql/clearMessages.sql", "/sql/createMessages.sql"})
    public void shouldSaveMessages() {
        final String locale = "newLocale";
        final String tenant = "newTenant";

        final Message message1 = Message.builder()
            .tenantId(tenant)
            .code("code1")
            .locale(locale)
            .message("New message1")
            .module("module")
            .createdBy(1L)
            .createdDate(new Date())
            .build();
        final Message message2 = Message.builder()
            .tenantId(tenant)
            .code("code2")
            .locale(locale)
            .message("New message2")
            .module("module")
            .createdBy(1L)
            .createdDate(new Date())
            .build();

        messageJpaRepository.saveAll(Arrays.asList(message1, message2));

        assertTrue(!StringUtils.hasText(message1.getId()), "Id generated for message1");
        assertTrue(!StringUtils.hasText(message2.getId()), "Id generated for message2");

        assertEquals(2, messageJpaRepository.find(tenant, locale).size());
    }
}