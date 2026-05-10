package com.atreyulibrary.seeder;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Inserts one deploy_check row on startup to verify migrations and seeder run per environment.
 * Active only in dev and qa profiles.
 * Race-safe: relies on the unique constraint on environment + ON CONFLICT DO NOTHING.
 */
@Component
@Profile({"dev", "qa"})
public class DeployCheckSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbc;
    private final Environment env;

    public DeployCheckSeeder(final JdbcTemplate jdbc, final Environment env) {
        this.jdbc = jdbc;
        this.env = env;
    }

    @Override
    public void run(final String... args) {
        final String activeProfile = env.getActiveProfiles().length > 0
                ? env.getActiveProfiles()[0]
                : "default";
        jdbc.update(
                "INSERT INTO deploy_checks (environment) VALUES (?)"
                + " ON CONFLICT (environment) DO NOTHING",
                activeProfile);
    }
}
