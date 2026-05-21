package com.atreyulibrary.dashboard;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetRecentBooksController.class)
class GetRecentBooksControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService service;

    @Test
    void returns200WithRecentBooks() throws Exception {
        when(service.getRecentBooks()).thenReturn(List.of(
                new BookResponse("A01", "01JTEST00000000000000001",
                        "La metamorfosis", "Franz Kafka", "Ficción", 1915, null, null, null),
                new BookResponse("B34", "01JTEST00000000000000002",
                        "Cien años de soledad", "Gabriel García Márquez",
                        "Realismo mágico", 1967, null, null, null)
        ));

        mockMvc.perform(get("/api/v1/dashboard/recent-books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].code").value("A01"))
                .andExpect(jsonPath("$[0].title").value("La metamorfosis"))
                .andExpect(jsonPath("$[1].code").value("B34"));
    }

    @Test
    void returns200WithEmptyListWhenNoBooksExist() throws Exception {
        when(service.getRecentBooks()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/dashboard/recent-books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
