package com.atreyulibrary.dashboard;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.dashboard.dto.DashboardStatsResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetDashboardStatsController.class)
class GetDashboardStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService service;

    @Test
    void returns200WithStats() throws Exception {
        when(service.getStats()).thenReturn(new DashboardStatsResponse(42L, 8L, 3L));

        mockMvc.perform(get("/api/v1/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBooks").value(42))
                .andExpect(jsonPath("$.distinctGenres").value(8))
                .andExpect(jsonPath("$.addedThisMonth").value(3));
    }

    @Test
    void returns200WhenAllCountsAreZero() throws Exception {
        when(service.getStats()).thenReturn(new DashboardStatsResponse(0L, 0L, 0L));

        mockMvc.perform(get("/api/v1/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBooks").value(0))
                .andExpect(jsonPath("$.distinctGenres").value(0))
                .andExpect(jsonPath("$.addedThisMonth").value(0));
    }
}
