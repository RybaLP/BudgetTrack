package com.filip.budgetapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Personal Budget API")
                        .version("1.0.0")
                        .description("API do zarządzania budżetem osobistym, kontami i historią transakcji.")
                        .contact(new Contact()
                                .name("Filip Liszcz")
                                .email("listektoja@gmail.com")));
    }
}