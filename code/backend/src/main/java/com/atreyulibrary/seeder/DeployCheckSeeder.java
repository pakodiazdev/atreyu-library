package com.atreyulibrary.seeder;

import com.atreyulibrary.seeder.base.OnceSeeder;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DeployCheckSeeder extends OnceSeeder {

    private final JdbcTemplate jdbc;
    private final Environment env;

    public DeployCheckSeeder(
            final JdbcTemplate jdbc,
            final Environment env,
            final SeederLogRepository seederLogRepository) {
        super(seederLogRepository);
        this.jdbc = jdbc;
        this.env = env;
    }

    @Override
    protected void seed() {
        final String activeProfile = env.getActiveProfiles().length > 0
                ? env.getActiveProfiles()[0]
                : "default";
        jdbc.update("INSERT INTO deploy_checks (environment) VALUES (?)", activeProfile);
    }
}
