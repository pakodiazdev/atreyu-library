package com.atreyulibrary.seeder.base;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.transaction.annotation.Transactional;

public abstract class OnceSeeder implements CommandLineRunner {

    private static final Logger LOG = LoggerFactory.getLogger(OnceSeeder.class);

    private final SeederLogRepository seederLogRepository;

    protected OnceSeeder(final SeederLogRepository seederLogRepository) {
        this.seederLogRepository = seederLogRepository;
    }

    @Transactional
    @Override
    public final void run(final String... args) {
        final String className = getClass().getName();
        if (seederLogRepository.existsBySeederClass(className)) {
            LOG.info("Seeder {} already ran — skipping", getClass().getSimpleName());
            return;
        }
        seed();
        seederLogRepository.save(SeederLog.of(className));
        LOG.info("Seeder {} completed", getClass().getSimpleName());
    }

    protected abstract void seed();
}
