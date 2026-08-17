package com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config;

import jakarta.servlet.http.HttpServletRequest;

public interface RateLimitUtils {
    String getUser(HttpServletRequest request);
    String getRemoteAddress(HttpServletRequest request);
    java.util.Set<String> getUserRoles();
}
