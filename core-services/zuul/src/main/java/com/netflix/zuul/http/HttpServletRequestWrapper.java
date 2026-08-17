package com.netflix.zuul.http;

import jakarta.servlet.http.HttpServletRequest;

public class HttpServletRequestWrapper extends jakarta.servlet.http.HttpServletRequestWrapper {
    public HttpServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }
}
