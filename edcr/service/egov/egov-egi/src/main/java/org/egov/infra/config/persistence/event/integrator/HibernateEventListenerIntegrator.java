/*
 * eGov SmartCity eGovernance suite is licensed under the GNU GPL v3.
 */
package org.egov.infra.config.persistence.event.integrator;

import org.egov.infra.config.persistence.event.listener.HibernateEventListener;
import org.hibernate.boot.Metadata;
import org.hibernate.boot.spi.BootstrapContext;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.integrator.spi.Integrator;
import org.hibernate.service.spi.SessionFactoryServiceRegistry;

/** Registers the audit listener through the Hibernate 7 Integrator SPI. */
public class HibernateEventListenerIntegrator implements Integrator {

    @Override
    public void integrate(Metadata metadata, BootstrapContext bootstrapContext,
            SessionFactoryImplementor sessionFactory) {
        EventListenerRegistry registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);
        HibernateEventListener listener = new HibernateEventListener();
        registry.prependListeners(EventType.PRE_INSERT, listener);
        registry.prependListeners(EventType.PRE_UPDATE, listener);
    }

    @Override
    public void disintegrate(SessionFactoryImplementor sessionFactory,
            SessionFactoryServiceRegistry serviceRegistry) {
        // Hibernate owns and releases the listener registry.
    }
}
