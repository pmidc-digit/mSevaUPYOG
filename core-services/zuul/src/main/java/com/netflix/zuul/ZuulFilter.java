package com.netflix.zuul;

import com.netflix.zuul.exception.ZuulException;

public abstract class ZuulFilter {
    public abstract String filterType();
    public abstract int filterOrder();
    public abstract boolean shouldFilter();
    public abstract Object run() throws ZuulException;
}
