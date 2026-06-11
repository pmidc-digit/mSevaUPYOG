package com.netflix.zuul.monitoring;

public class Tracer {
    public static class TracerFactory {
        public static TracerFactory instance() { return new TracerFactory(); }
        public void startMicroTracer(String name) {}
        public void stopAndLogMicroTracer() {}
    }
}
