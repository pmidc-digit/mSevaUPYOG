package io.opentelemetry.semconv;

import io.opentelemetry.api.common.AttributeKey;

/**
 * Dummy class to satisfy OpenTelemetry Logback appender instrumentation.
 * The opentelemetry-logback-appender library references this class,
 * which was repackaged or removed in newer opentelemetry-semconv versions.
 */
public final class SemanticAttributes {
    public static final AttributeKey<String> EXCEPTION_TYPE = AttributeKey.stringKey("exception.type");
    public static final AttributeKey<String> EXCEPTION_MESSAGE = AttributeKey.stringKey("exception.message");
    public static final AttributeKey<String> EXCEPTION_STACKTRACE = AttributeKey.stringKey("exception.stacktrace");
    public static final AttributeKey<String> ERROR_TYPE = AttributeKey.stringKey("error.type");
    
    public static final AttributeKey<String> THREAD_NAME = AttributeKey.stringKey("thread.name");
    public static final AttributeKey<Long> THREAD_ID = AttributeKey.longKey("thread.id");
    
    // HTTP attributes
    public static final AttributeKey<String> HTTP_METHOD = AttributeKey.stringKey("http.method");
    public static final AttributeKey<String> HTTP_REQUEST_METHOD = AttributeKey.stringKey("http.request.method");
    public static final AttributeKey<Long> HTTP_RESPONSE_STATUS_CODE = AttributeKey.longKey("http.response.status_code");
    public static final AttributeKey<String> HTTP_ROUTE = AttributeKey.stringKey("http.route");
    public static final AttributeKey<String> HTTP_URL = AttributeKey.stringKey("http.url");
    public static final AttributeKey<Long> HTTP_STATUS_CODE = AttributeKey.longKey("http.status_code");
    public static final AttributeKey<String> HTTP_TARGET = AttributeKey.stringKey("http.target");
    public static final AttributeKey<String> HTTP_SCHEME = AttributeKey.stringKey("http.scheme");
    public static final AttributeKey<String> HTTP_HOST = AttributeKey.stringKey("http.host");
    public static final AttributeKey<String> HTTP_CLIENT_IP = AttributeKey.stringKey("http.client_ip");
    
    // URL attributes
    public static final AttributeKey<String> URL_FULL = AttributeKey.stringKey("url.full");
    public static final AttributeKey<String> URL_PATH = AttributeKey.stringKey("url.path");
    public static final AttributeKey<String> URL_QUERY = AttributeKey.stringKey("url.query");
    public static final AttributeKey<String> URL_SCHEME = AttributeKey.stringKey("url.scheme");
    
    // Network & Server attributes
    public static final AttributeKey<String> NETWORK_PROTOCOL_NAME = AttributeKey.stringKey("network.protocol.name");
    public static final AttributeKey<String> NETWORK_PROTOCOL_VERSION = AttributeKey.stringKey("network.protocol.version");
    public static final AttributeKey<String> SERVER_ADDRESS = AttributeKey.stringKey("server.address");
    public static final AttributeKey<Long> SERVER_PORT = AttributeKey.longKey("server.port");
    public static final AttributeKey<String> CLIENT_ADDRESS = AttributeKey.stringKey("client.address");
    public static final AttributeKey<Long> CLIENT_PORT = AttributeKey.longKey("client.port");
    
    public static final AttributeKey<String> USER_AGENT_ORIGINAL = AttributeKey.stringKey("user_agent.original");

    private SemanticAttributes() {}
}
