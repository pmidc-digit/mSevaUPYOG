package com.ingestpipeline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import com.ingestpipeline.util.Constants;


@SpringBootApplication(scanBasePackages={"com.ingestpipeline"})// same as @Configuration @EnableAutoConfiguration @ComponentScan combined
public class IngestApp {

	public static void main(String[] args) {
		SpringApplication.run(IngestApp.class, args);
	}
	
	@Bean
	public RestTemplate restTemplate(@Value("${services.esindexer.username:}") String esUsername,
									 @Value("${services.esindexer.password:}") String esPassword) {
		RestTemplate restTemplate = new RestTemplate();
		if (esUsername != null && !esUsername.isEmpty()) {
			final String username = esUsername;
			final String password = esPassword == null ? "" : esPassword;
			ClientHttpRequestInterceptor authInterceptor = (request, body, execution) -> {
				String auth = username + ":" + password;
				String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
				request.getHeaders().add("Authorization", "Basic " + encodedAuth);
				return execution.execute(request, body);
			};
			List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>(restTemplate.getInterceptors());
			interceptors.add(authInterceptor);
			restTemplate.setInterceptors(interceptors);
		}
		return restTemplate;
	}
	
	 @Bean
	    public WebMvcConfigurer corsConfigurer() {
	        return new WebMvcConfigurerAdapter() {
	            @Override
	            public void addCorsMappings(CorsRegistry registry) {
	                registry.addMapping("/**").allowedMethods(Constants.ALLOWED_METHODS_GET,Constants.ALLOWED_METHODS_POST
	                		).allowedOrigins("*")
	                        .allowedHeaders("*");
	            }
	        };
	    }
}
