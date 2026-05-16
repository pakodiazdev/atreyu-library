package com.atreyulibrary;

import com.atreyulibrary.seeder.BookSeederProd;
import com.atreyulibrary.seeder.DeployCheckSeeder;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

// Fuerza H2 aunque SPRING_DATASOURCE_URL del entorno apunte a PostgreSQL.
// Mockea DeployCheckSeeder para evitar INSERT en deploy_checks (tabla sin entidad JPA, no creada por Hibernate en H2).
// BookSeederProd usa JPA puro y podría correr en H2, pero se mockea para mantener el test como smoke test puro.
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.profiles.active=dev"
})
class AtreyuLibraryApplicationTests {

    @MockitoBean
    DeployCheckSeeder deployCheckSeeder;

    @MockitoBean
    BookSeederProd bookSeederProd;

    @Test
    void contextLoads() {
    }

}
