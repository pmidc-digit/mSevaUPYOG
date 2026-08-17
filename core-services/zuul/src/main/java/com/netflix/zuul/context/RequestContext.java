package com.netflix.zuul.context;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

public class RequestContext extends ConcurrentHashMap<String, Object> {
    private static final ThreadLocal<RequestContext> threadLocal = new ThreadLocal<RequestContext>() {
        @Override
        protected RequestContext initialValue() {
            return new RequestContext();
        }
    };

    public static RequestContext getCurrentContext() {
        return threadLocal.get();
    }

    public HttpServletRequest getRequest() {
        return (HttpServletRequest) get("request");
    }

    public void setRequest(HttpServletRequest request) {
        put("request", request);
    }

    public HttpServletResponse getResponse() {
        return (HttpServletResponse) get("response");
    }

    public void setResponse(HttpServletResponse response) {
        put("response", response);
    }

    public void setSendZuulResponse(boolean b) {
        put("sendZuulResponse", b);
    }
    
    public boolean sendZuulResponse() {
        return get("sendZuulResponse") == null ? true : (Boolean) get("sendZuulResponse");
    }

    public InputStream getResponseDataStream() {
        return (InputStream) get("responseDataStream");
    }

    public void setResponseDataStream(InputStream stream) {
        put("responseDataStream", stream);
    }

    public void setResponseBody(String body) {
        put("responseBody", body);
    }
    
    public String getResponseBody() {
        return (String) get("responseBody");
    }

    public void setResponseStatusCode(int code) {
        put("responseStatusCode", code);
    }
    
    public int getResponseStatusCode() {
        return get("responseStatusCode") == null ? 200 : (Integer) get("responseStatusCode");
    }

    public Map<String, List<String>> getRequestQueryParams() {
        return (Map<String, List<String>>) get("requestQueryParams");
    }

    public void setRequestQueryParams(Map<String, List<String>> qp) {
        put("requestQueryParams", qp);
    }

    public void unset() {
        threadLocal.remove();
    }
    
    public void set(String key, Object value) {
        put(key, value);
    }
    
    public void set(String key) {
        put(key, Boolean.TRUE);
    }
    
    public boolean getBoolean(String key) {
        return get(key) != null && (Boolean) get(key);
    }
    
    public Throwable getThrowable() {
        return (Throwable) get("throwable");
    }
    
    public void setThrowable(Throwable th) {
        put("throwable", th);
    }
    
    public void addZuulRequestHeader(String name, String value) {
    }
    
    public java.util.Map<String, String> getZuulRequestHeaders() {
        return new java.util.HashMap<>();
    }
    
    public void addZuulResponseHeader(String name, String value) {
    }
    
    public List<com.netflix.util.Pair<String,String>> getZuulResponseHeaders() {
        return new java.util.ArrayList<>();
    }
    
    public void setRouteHost(java.net.URL routeHost) {
        put("routeHost", routeHost);
    }
}

