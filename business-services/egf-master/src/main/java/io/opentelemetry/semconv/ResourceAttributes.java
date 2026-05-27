package io.opentelemetry.semconv;

import io.opentelemetry.api.common.AttributeKey;

/**
 * Dummy class to satisfy OpenTelemetry resource initialization.
 * The opentelemetry-resources 2.1.0-alpha library references this class,
 * which was repackaged or removed in opentelemetry-semconv 1.37.0.
 */
public final class ResourceAttributes {
    public static final AttributeKey<String> OS_TYPE = AttributeKey.stringKey("os.type");
    public static final AttributeKey<String> OS_DESCRIPTION = AttributeKey.stringKey("os.description");
    public static final AttributeKey<String> OS_NAME = AttributeKey.stringKey("os.name");
    public static final AttributeKey<String> OS_VERSION = AttributeKey.stringKey("os.version");
    
    public static final AttributeKey<Long> PROCESS_PID = AttributeKey.longKey("process.pid");
    public static final AttributeKey<String> PROCESS_EXECUTABLE_PATH = AttributeKey.stringKey("process.executable.path");
    public static final AttributeKey<String> PROCESS_COMMAND_LINE = AttributeKey.stringKey("process.command_line");
    public static final AttributeKey<String> PROCESS_OWNER = AttributeKey.stringKey("process.owner");
    
    public static final AttributeKey<String> PROCESS_RUNTIME_NAME = AttributeKey.stringKey("process.runtime.name");
    public static final AttributeKey<String> PROCESS_RUNTIME_VERSION = AttributeKey.stringKey("process.runtime.version");
    public static final AttributeKey<String> PROCESS_RUNTIME_DESCRIPTION = AttributeKey.stringKey("process.runtime.description");
    
    public static final AttributeKey<String> SERVICE_NAME = AttributeKey.stringKey("service.name");
    public static final AttributeKey<String> SERVICE_VERSION = AttributeKey.stringKey("service.version");
    public static final AttributeKey<String> SERVICE_INSTANCE_ID = AttributeKey.stringKey("service.instance.id");
    
    public static final AttributeKey<String> HOST_NAME = AttributeKey.stringKey("host.name");
    public static final AttributeKey<String> HOST_ARCH = AttributeKey.stringKey("host.arch");
    
    public static final AttributeKey<String> TELEMETRY_SDK_NAME = AttributeKey.stringKey("telemetry.sdk.name");
    public static final AttributeKey<String> TELEMETRY_SDK_LANGUAGE = AttributeKey.stringKey("telemetry.sdk.language");
    public static final AttributeKey<String> TELEMETRY_SDK_VERSION = AttributeKey.stringKey("telemetry.sdk.version");
    public static final AttributeKey<String> TELEMETRY_AUTO_VERSION = AttributeKey.stringKey("telemetry.auto.version");
    
    public static final AttributeKey<String> CONTAINER_ID = AttributeKey.stringKey("container.id");

    private ResourceAttributes() {}
}
