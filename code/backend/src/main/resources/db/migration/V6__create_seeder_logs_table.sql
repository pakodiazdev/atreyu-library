CREATE TABLE seeder_logs (
    id            BIGSERIAL    NOT NULL,
    seeder_class  VARCHAR(255) NOT NULL,
    executed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_seeder_logs PRIMARY KEY (id),
    CONSTRAINT uq_seeder_logs_class UNIQUE (seeder_class)
);
