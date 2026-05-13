package com.atreyulibrary.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Configuración global de CORS — permite al frontend alcanzar la API. */
@Configuration
public class CorsConfig {

    /**
     * Patrones de origen permitidos, separados por coma.
     * El valor por defecto {@code http://localhost:*} acepta cualquier puerto de localhost,
     * lo que facilita el desarrollo con múltiples instancias o puertos configurables.
     * En prod/qa se sobreescribe con el dominio real vía variable de entorno.
     */
    @Value("${app.cors.allowed-origins:http://localhost:*}")
    private String allowedOrigins;

    /**
     * Registra las reglas de CORS para todos los endpoints de {@code /api/**}.
     * Usa {@code allowedOriginPatterns} para soportar el comodín {@code *} en el puerto
     * (p.ej. {@code http://localhost:*}).
     *
     * @return {@link WebMvcConfigurer} configurado
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(final CorsRegistry registry) {
                final String[] patterns = Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toArray(String[]::new);
                registry.addMapping("/api/**")
                        .allowedOriginPatterns(patterns)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .maxAge(3600);
            }
        };
    }
}
