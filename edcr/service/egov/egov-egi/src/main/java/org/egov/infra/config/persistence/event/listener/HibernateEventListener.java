/*
 * eGov SmartCity eGovernance suite is licensed under the GNU GPL v3.
 */
package org.egov.infra.config.persistence.event.listener;

import java.util.Date;

import org.egov.infra.admin.master.entity.User;
import org.egov.infra.config.core.ApplicationThreadLocals;
import org.egov.infra.persistence.entity.AbstractAuditable;
import org.egov.infra.persistence.entity.Auditable;
import org.egov.infstr.models.BaseModel;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.event.spi.PreInsertEvent;
import org.hibernate.event.spi.PreInsertEventListener;
import org.hibernate.event.spi.PreUpdateEvent;
import org.hibernate.event.spi.PreUpdateEventListener;

/** Populates eGov audit fields through the Hibernate 7 persistence lifecycle. */
public class HibernateEventListener implements PreInsertEventListener, PreUpdateEventListener {

    @Override
    public boolean onPreInsert(PreInsertEvent event) {
        Object entity = event.getEntity();
        Date now = new Date();
        User user = currentUser(event.getSession());

        if (entity instanceof BaseModel auditable) {
            if (auditable.getCreatedBy() == null) {
                auditable.setCreatedBy(user);
                auditable.setCreatedDate(now);
            }
            auditable.setModifiedBy(user);
            auditable.setModifiedDate(now);
            copyState(event.getPersister().getPropertyNames(), event.getState(), "createdBy", auditable.getCreatedBy());
            copyState(event.getPersister().getPropertyNames(), event.getState(), "createdDate", auditable.getCreatedDate());
            copyState(event.getPersister().getPropertyNames(), event.getState(), "modifiedBy", auditable.getModifiedBy());
            copyState(event.getPersister().getPropertyNames(), event.getState(), "modifiedDate", auditable.getModifiedDate());
        } else if (entity instanceof Auditable && entity instanceof AbstractAuditable auditable) {
            if (auditable.getCreatedBy() == null) {
                auditable.setCreatedBy(user);
                auditable.setCreatedDate(now);
            }
            auditable.setLastModifiedBy(user);
            auditable.setLastModifiedDate(now);
            copyState(event.getPersister().getPropertyNames(), event.getState(), "createdBy", auditable.getCreatedBy());
            copyState(event.getPersister().getPropertyNames(), event.getState(), "createdDate", auditable.getCreatedDate());
            copyState(event.getPersister().getPropertyNames(), event.getState(), "lastModifiedBy", auditable.getLastModifiedBy());
            copyState(event.getPersister().getPropertyNames(), event.getState(), "lastModifiedDate", auditable.getLastModifiedDate());
        }
        return false;
    }

    @Override
    public boolean onPreUpdate(PreUpdateEvent event) {
        Object entity = event.getEntity();
        Date now = new Date();
        User user = currentUser(event.getSession());
        if (entity instanceof BaseModel auditable) {
            auditable.setModifiedBy(user);
            auditable.setModifiedDate(now);
            copyState(event.getPersister().getPropertyNames(), event.getState(), "modifiedBy", user);
            copyState(event.getPersister().getPropertyNames(), event.getState(), "modifiedDate", now);
        } else if (entity instanceof Auditable && entity instanceof AbstractAuditable auditable) {
            auditable.setLastModifiedBy(user);
            auditable.setLastModifiedDate(now);
            copyState(event.getPersister().getPropertyNames(), event.getState(), "lastModifiedBy", user);
            copyState(event.getPersister().getPropertyNames(), event.getState(), "lastModifiedDate", now);
        }
        return false;
    }

    private static User currentUser(SharedSessionContractImplementor session) {
        Long userId = ApplicationThreadLocals.getUserId();
        return userId == null ? null : (User) session.internalLoad(User.class.getName(), userId, false, false);
    }

    private static void copyState(String[] propertyNames, Object[] state, String propertyName, Object value) {
        for (int index = 0; index < propertyNames.length; index++) {
            if (propertyName.equals(propertyNames[index])) {
                state[index] = value;
                return;
            }
        }
    }
}
