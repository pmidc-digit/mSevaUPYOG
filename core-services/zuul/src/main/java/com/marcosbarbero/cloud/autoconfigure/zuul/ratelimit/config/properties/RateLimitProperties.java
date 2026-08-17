package com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "zuul.ratelimit")
public class RateLimitProperties {
    private boolean enabled;
    private boolean behindProxy;
    private boolean addResponseHeaders;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isBehindProxy() { return behindProxy; }
    public void setBehindProxy(boolean behindProxy) { this.behindProxy = behindProxy; }

    public boolean isAddResponseHeaders() { return addResponseHeaders; }
    public void setAddResponseHeaders(boolean addResponseHeaders) { this.addResponseHeaders = addResponseHeaders; }

    public void setPreFilterOrder(int order) {}
}
