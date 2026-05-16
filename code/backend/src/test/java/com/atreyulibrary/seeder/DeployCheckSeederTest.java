package com.atreyulibrary.seeder;

import com.atreyulibrary.seeder.base.SeederLog;
import com.atreyulibrary.seeder.base.SeederLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeployCheckSeederTest {

    @Mock
    private SeederLogRepository seederLogRepository;

    @Mock
    private JdbcTemplate jdbc;

    @Mock
    private Environment env;

    @InjectMocks
    private DeployCheckSeeder seeder;

    @Test
    void insertsRowWithActiveProfileOnFirstRun() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        when(env.getActiveProfiles()).thenReturn(new String[]{"qa"});

        seeder.run();

        verify(jdbc).update(anyString(), eq("qa"));
        verify(seederLogRepository).save(any(SeederLog.class));
    }

    @Test
    void insertsRowWithFirstActiveProfileWhenMultipleAreSet() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        when(env.getActiveProfiles()).thenReturn(new String[]{"qa", "debug"});

        seeder.run();

        verify(jdbc).update(anyString(), eq("qa"));
    }

    @Test
    void fallsBackToDefaultProfileWhenNoProfileIsActive() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(false);
        when(env.getActiveProfiles()).thenReturn(new String[]{});

        seeder.run();

        verify(jdbc).update(anyString(), eq("default"));
    }

    @Test
    void skipsWhenAlreadyRan() {
        when(seederLogRepository.existsBySeederClass(anyString())).thenReturn(true);

        seeder.run();

        verify(jdbc, never()).update(anyString(), anyString());
        verify(seederLogRepository, never()).save(any());
    }
}
