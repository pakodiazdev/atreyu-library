package com.atreyulibrary.dashboard;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.dashboard.dto.ActivityEntry;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetRecentActivityController.class)
class GetRecentActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService service;

    @Test
    void returns200WithActivityEntries() throws Exception {
        when(service.getRecentActivity()).thenReturn(List.of(
                new ActivityEntry("A01", "La metamorfosis", "Franz Kafka",
                        "CREATED", "2026-05-21T10:00:00Z"),
                new ActivityEntry("B34", "Cien años de soledad", "García Márquez",
                        "UPDATED", "2026-05-20T15:00:00Z")
        ));

        mockMvc.perform(get("/api/v1/dashboard/recent-activity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].bookCode").value("A01"))
                .andExpect(jsonPath("$[0].eventType").value("CREATED"))
                .andExpect(jsonPath("$[1].eventType").value("UPDATED"));
    }

    @Test
    void returns200WithEmptyListWhenNoActivity() throws Exception {
        when(service.getRecentActivity()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/dashboard/recent-activity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
