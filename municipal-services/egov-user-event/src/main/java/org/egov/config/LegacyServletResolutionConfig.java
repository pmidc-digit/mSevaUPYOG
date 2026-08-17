package org.egov.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Proxy;
import java.util.List;

@Configuration
public class LegacyServletResolutionConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.getParameterType().getName().equals("javax.servlet.http.HttpServletRequest");
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
                HttpServletRequest jakartaRequest = webRequest.getNativeRequest(HttpServletRequest.class);
                if (jakartaRequest == null) {
                    return null;
                }

                // Return a proxy of javax.servlet.http.HttpServletRequest that delegates to jakartaRequest
                return Proxy.newProxyInstance(
                        getClass().getClassLoader(),
                        new Class<?>[]{Class.forName("javax.servlet.http.HttpServletRequest")},
                        (proxy, method, args) -> {
                            if (method.getName().equals("getContentType")) {
                                return jakartaRequest.getContentType();
                            }
                            if (method.getName().equals("getRequestURL")) {
                                return new StringBuffer(jakartaRequest.getRequestURL().toString());
                            }
                            if (method.getName().equals("getInputStream")) {
                                jakarta.servlet.ServletInputStream jakartaStream = jakartaRequest.getInputStream();
                                return Proxy.newProxyInstance(
                                        getClass().getClassLoader(),
                                        new Class<?>[]{Class.forName("javax.servlet.ServletInputStream")},
                                        (streamProxy, streamMethod, streamArgs) -> {
                                            if (streamMethod.getName().equals("read")) {
                                                if (streamArgs == null || streamArgs.length == 0) {
                                                    return jakartaStream.read();
                                                } else if (streamArgs.length == 1) {
                                                    return jakartaStream.read((byte[]) streamArgs[0]);
                                                } else {
                                                    return jakartaStream.read((byte[]) streamArgs[0], (int) streamArgs[1], (int) streamArgs[2]);
                                                }
                                            }
                                            return streamMethod.invoke(jakartaStream, streamArgs);
                                        }
                                );
                            }
                            // Fallback, try to invoke on jakartaRequest if method exists with same signature
                            try {
                                return jakartaRequest.getClass().getMethod(method.getName(), method.getParameterTypes()).invoke(jakartaRequest, args);
                            } catch (NoSuchMethodException e) {
                                return null;
                            }
                        }
                );
            }
        });
    }
}
