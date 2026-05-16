package com.atreyulibrary.seeder.base;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "seeder_logs")
public class SeederLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seeder_class", nullable = false, unique = true, length = 255)
    private String seederClass;

    @Column(name = "executed_at", nullable = false)
    private OffsetDateTime executedAt;

    protected SeederLog() { }

    private SeederLog(final String seederClass) {
        this.seederClass = seederClass;
        this.executedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public static SeederLog of(final String seederClass) {
        return new SeederLog(seederClass);
    }

    public Long getId() { return id; }
    public String getSeederClass() { return seederClass; }
    public OffsetDateTime getExecutedAt() { return executedAt; }
}
