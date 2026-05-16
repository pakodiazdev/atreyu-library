package com.atreyulibrary.seeder.base;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SeederLogRepository extends JpaRepository<SeederLog, Long> {

    boolean existsBySeederClass(String seederClass);
}
