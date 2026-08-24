package org.egov.infra.web.context;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.web.context.ContextLoaderListener;

/**
 * Restores the shared EAR parent context that Spring Framework 7 no longer
 * creates from the legacy locatorFactorySelector and parentContextKey params.
 */
public class SharedParentContextLoaderListener extends ContextLoaderListener {

    private static final String LOCATOR_SELECTOR_PARAM = "locatorFactorySelector";
    private static final String PARENT_CONTEXT_KEY_PARAM = "parentContextKey";
    private static final Object MONITOR = new Object();

    private static ConfigurableApplicationContext locatorContext;
    private static ApplicationContext parentContext;
    private static int users;
    private boolean registered;

    @Override
    protected ApplicationContext loadParentContext(ServletContext servletContext) {
        synchronized (MONITOR) {
            if (parentContext == null) {
                String selector = requiredParameter(servletContext, LOCATOR_SELECTOR_PARAM);
                String parentKey = requiredParameter(servletContext, PARENT_CONTEXT_KEY_PARAM);
                locatorContext = new ClassPathXmlApplicationContext(selector);
                parentContext = locatorContext.getBean(parentKey, ApplicationContext.class);
            }
            users++;
            registered = true;
            return parentContext;
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent event) {
        try {
            super.contextDestroyed(event);
        } finally {
            releaseParentContext();
        }
    }

    private void releaseParentContext() {
        synchronized (MONITOR) {
            if (!registered) {
                return;
            }
            registered = false;
            if (--users == 0 && locatorContext != null) {
                locatorContext.close();
                locatorContext = null;
                parentContext = null;
            }
        }
    }

    private static String requiredParameter(ServletContext servletContext, String name) {
        String value = servletContext.getInitParameter(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing servlet context parameter: " + name);
        }
        return value;
    }
}
