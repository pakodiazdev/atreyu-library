package com.atreyulibrary.config;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;

class QaFlywayConfigTest {

    private final QaFlywayConfig config = new QaFlywayConfig();

    @Test
    void strategyCallsCleanBeforeMigrate() {
        FlywayMigrationStrategy strategy = config.qaCleanMigrateStrategy();
        Flyway flyway = mock(Flyway.class);

        strategy.migrate(flyway);

        var order = inOrder(flyway);
        order.verify(flyway).clean();
        order.verify(flyway).migrate();
    }
}
