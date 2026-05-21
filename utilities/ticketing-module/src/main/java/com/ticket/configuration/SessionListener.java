package com.ticket.configuration;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
 
public class SessionListener implements HttpSessionListener {
 
    @Override
    public void sessionCreated(HttpSessionEvent event) {
        event.getSession().setMaxInactiveInterval(12*60*60);
    }
 
    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
    }
}
