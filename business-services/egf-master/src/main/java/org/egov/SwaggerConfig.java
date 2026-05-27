package org.egov;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
	@Bean
	public OpenAPI egfMasterOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("EGF Master API")
						.description("eGov Financial Masters API")
						.version("v1.1.3"));
	}
}