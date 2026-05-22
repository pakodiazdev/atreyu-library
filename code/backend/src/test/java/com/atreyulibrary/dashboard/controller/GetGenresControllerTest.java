package com.atreyulibrary.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.dashboard.dto.GenreStats;
import com.atreyulibrary.dashboard.service.DashboardService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetGenresController.class)
class GetGenresControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService service;

    @Test
    void returns200WithGenreList() throws Exception {
        when(service.getGenreStats()).thenReturn(List.of(
                new GenreStats("Novela", 5L),
                new GenreStats("Fantasía", 3L)
        ));

        mockMvc.perform(get("/api/v1/dashboard/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].genre").value("Novela"))
                .andExpect(jsonPath("$[0].count").value(5))
                .andExpect(jsonPath("$[1].genre").value("Fantasía"));
    }

    @Test
    void returns200WithEmptyListWhenNoBooksExist() throws Exception {
        when(service.getGenreStats()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/dashboard/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
