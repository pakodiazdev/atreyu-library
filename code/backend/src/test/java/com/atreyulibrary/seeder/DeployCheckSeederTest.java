package com.atreyulibrary.seeder;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class DeployCheckSeederTest {

    @Mock
    private JdbcTemplate jdbc;

    @Mock
    private Environment env;

    @InjectMocks
    private DeployCheckSeeder seeder;

    @Test
    void insertsRowWithActiveProfile() throws Exception {
        when(env.getActiveProfiles()).thenReturn(new String[]{"qa"});

        seeder.run();

        verify(jdbc).update(anyString(), eq("qa"));
    }

    @Test
    void insertsRowWithFirstActiveProfileWhenMultipleAreSet() throws Exception {
        when(env.getActiveProfiles()).thenReturn(new String[]{"qa", "debug"});

        seeder.run();

        verify(jdbc).update(anyString(), eq("qa"));
    }

    @Test
    void fallsBackToDefaultProfileWhenNoProfileIsActive() throws Exception {
        when(env.getActiveProfiles()).thenReturn(new String[]{});

        seeder.run();

        verify(jdbc).update(anyString(), eq("default"));
    }
}
