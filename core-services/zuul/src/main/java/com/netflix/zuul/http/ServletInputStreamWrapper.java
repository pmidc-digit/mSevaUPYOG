package com.netflix.zuul.http;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

public class ServletInputStreamWrapper extends ServletInputStream {

    private InputStream is;

    public ServletInputStreamWrapper(byte[] data) {
        this.is = new ByteArrayInputStream(data);
    }
    
    public ServletInputStreamWrapper(InputStream is) {
        this.is = is;
    }

    @Override
    public boolean isFinished() {
        try {
            return is.available() == 0;
        } catch (IOException e) {
            return true;
        }
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
        return is.read();
    }
}
