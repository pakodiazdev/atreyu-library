package com.atreyulibrary.seeder.base;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;

public abstract class OnceSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(OnceSeeder.class);

    private final SeederLogRepository seederLogRepository;

    protected OnceSeeder(final SeederLogRepository seederLogRepository) {
        this.seederLogRepository = seederLogRepository;
    }

    @Override
    public final void run(final String... args) {
        final String className = getClass().getName();
        if (seederLogRepository.existsBySeederClass(className)) {
            log.info("Seeder {} already ran — skipping", getClass().getSimpleName());
            return;
        }
        seed();
        seederLogRepository.save(SeederLog.of(className));
        log.info("Seeder {} completed", getClass().getSimpleName());
    }

    protected abstract void seed();
}
