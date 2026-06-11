package com.marcosbarbero.cloud.autoconfigure.zuul.ratelimit.config.repository;

public class DefaultRateLimiterErrorHandler implements RateLimiterErrorHandler {
    @Override
    public void handleSaveError(String key, Exception e) {}
    @Override
    public void handleFetchError(String key, Exception e) {}
    @Override
    public void handleError(String msg, Exception e) {}
}
