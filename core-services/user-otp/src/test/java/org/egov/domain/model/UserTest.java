package org.egov.domain.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void equalsShouldReturnTrueWhenBothInstancesHaveSameFieldValues() {

        User user1 = new User(1L, "foo@bar.com", "");
        User user2 = new User(1L, "foo@bar.com", "");

        assertEquals(user1, user2);
    }

    @Test
    void hashCodeShouldBeSameWhenBothInstancesHaveSameFieldValues() {

        User user1 = new User(1L, "foo@bar.com", "");
        User user2 = new User(1L, "foo@bar.com", "");

        assertEquals(user1.hashCode(), user2.hashCode());
    }

    @Test
    void equalsShouldReturnFalseWhenBothInstancesHaveDifferentFieldValues() {

        User user1 = new User(1L, "foo1@bar.com", "");
        User user2 = new User(2L, "foo2@bar.com", "");

        assertNotEquals(user1, user2);
    }

    @Test
    void hashCodeShouldBeDifferentWhenBothInstancesHaveDifferentFieldValues() {

        User user1 = new User(1L, "foo1@bar.com", "");
        User user2 = new User(2L, "foo2@bar.com", "");

        assertNotEquals(user1.hashCode(), user2.hashCode());
    }
}