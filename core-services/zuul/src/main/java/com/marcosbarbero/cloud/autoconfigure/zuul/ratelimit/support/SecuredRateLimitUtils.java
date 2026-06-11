package com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.support;

import com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config.RateLimitUtils;
import com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config.properties.RateLimitProperties;
import jakarta.servlet.http.HttpServletRequest;

public class SecuredRateLimitUtils implements RateLimitUtils {
    public SecuredRateLimitUtils(RateLimitProperties rateLimitProperties) {}

    @Override
    public String getUser(HttpServletRequest request) { return null; }

    @Override
    public String getRemoteAddress(HttpServletRequest request) { return null; }
    
    @Override
    public java.util.Set<String> getUserRoles() { return null; }
}
