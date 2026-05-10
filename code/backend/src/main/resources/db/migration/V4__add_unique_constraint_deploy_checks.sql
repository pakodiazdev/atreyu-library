-- V4: Add unique constraint to deploy_checks.environment
-- Enables atomic ON CONFLICT DO NOTHING inserts in DeployCheckSeeder,
-- making concurrent Cloud Run instance startups race-safe.

ALTER TABLE deploy_checks
    ADD CONSTRAINT uq_deploy_checks_environment UNIQUE (environment);
