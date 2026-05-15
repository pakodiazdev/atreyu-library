package com.atreyulibrary.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * En QA, cada deploy limpia el esquema completo y lo recrea desde cero.
 * Garantiza un entorno consistente sin importar qué rama se desplegó antes.
 *
 * El BookSeeder (Order 2) corre después y resiembra los datos de muestra.
 * En producción este bean no existe — clean-disabled=true allí por defecto.
 */
@Configuration
@Profile("qa")
class QaFlywayConfig {

    @Bean
    FlywayMigrationStrategy qaCleanMigrateStrategy() {
        return flyway -> {
            flyway.clean();
            flyway.migrate();
        };
    }
}
