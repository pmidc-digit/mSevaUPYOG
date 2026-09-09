package org.egov.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

import java.io.IOException;
import java.util.Properties;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

@Configuration
public class ZuulRoutesConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(ZuulRoutesConfiguration.class);

    @Bean
    public RouterFunction<ServerResponse> legacyZuulRoutes() throws IOException {
        Properties props = new Properties();
        try {
            props.load(new ClassPathResource("routes.properties").getInputStream());
        } catch (IOException e) {
            logger.error("Could not load routes.properties", e);
            throw e;
        }

        RouterFunctions.Builder builder = RouterFunctions.route();

        for (String key : props.stringPropertyNames()) {
            if (key.startsWith("zuul.routes.") && key.endsWith(".path")) {
                String name = key.substring("zuul.routes.".length(), key.length() - ".path".length());
                String path = props.getProperty(key);
                String url = props.getProperty("zuul.routes." + name + ".url");

                if (path != null && url != null) {
                    logger.info("Registering route: {} -> {}", path, url);
                    builder.add(
                        route(name)
                            .route(RequestPredicates.path(path), http())
                            .before(org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri(java.net.URI.create(url)))
                            .build()
                    );
                }
            }
        }

        return builder.build();
    }
}
