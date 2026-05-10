-- V3: Create deploy_checks table
-- Temporary validation table to verify Flyway migrations and seeder run correctly per environment.
-- Will be removed once CRUD sprints are complete.

CREATE TABLE deploy_checks (
    id          SERIAL       NOT NULL,
    environment VARCHAR(20)  NOT NULL,
    deployed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_deploy_checks PRIMARY KEY (id)
);
