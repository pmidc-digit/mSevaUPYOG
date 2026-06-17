package org.egov.tracer.http.filters;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;

public class MultiReadRequestWrapper extends HttpServletRequestWrapper {
    private static final Logger log = LoggerFactory.getLogger(MultiReadRequestWrapper.class);
    private ByteArrayOutputStream cachedBytes;

    public MultiReadRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        if (cachedBytes == null) {
            cacheInputStream();
        }
        return new CachedServletInputStream(this);
    }

    public void update(ByteArrayOutputStream cachedBytes) {
        this.cachedBytes = cachedBytes;
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(getInputStream()));
    }

    private void cacheInputStream() throws IOException {
        cachedBytes = new ByteArrayOutputStream();
        IOUtils.copy(super.getInputStream(), cachedBytes);
    }

    private static class CachedServletInputStream extends ServletInputStream {
        private final ByteArrayInputStream input;
        private final MultiReadRequestWrapper wrapper;

        public CachedServletInputStream(MultiReadRequestWrapper wrapper) {
            this.wrapper = wrapper;
            this.input = new ByteArrayInputStream(wrapper.cachedBytes.toByteArray());
        }

        @Override
        public boolean isFinished() {
            return input.available() == 0;
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener readListener) {
        }

        @Override
        public int read() throws IOException {
            return input.read();
        }
    }
}
