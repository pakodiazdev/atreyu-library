package com.atreyulibrary.book;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ListBooksController.class)
class ListBooksControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    // ── happy paths ──────────────────────────────────────────────────────────

    @Test
    void returns200WithBooksFromService() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967, null, null, null)
        ));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("A01"))
                .andExpect(jsonPath("$[0].ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(jsonPath("$[0].title").value("Cien años de soledad"))
                .andExpect(jsonPath("$[0].author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$[0].genre").value("Realismo mágico"))
                .andExpect(jsonPath("$[0].publicationYear").value(1967));
    }

    @Test
    void withNoResultsReturnsEmptyArray() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    // ── filtros ──────────────────────────────────────────────────────────────

    @Test
    void passesTitleFilterToService() throws Exception {
        when(service.findAll("quijote", null, null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books").param("title", "quijote"))
                .andExpect(status().isOk());

        verify(service).findAll("quijote", null, null);
    }

    @Test
    void passesAuthorFilterToService() throws Exception {
        when(service.findAll(null, "orwell", null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books").param("author", "orwell"))
                .andExpect(status().isOk());

        verify(service).findAll(null, "orwell", null);
    }

    @Test
    void passesGenreFilterToService() throws Exception {
        when(service.findAll(null, null, "terror")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books").param("genre", "terror"))
                .andExpect(status().isOk());

        verify(service).findAll(null, null, "terror");
    }

    @Test
    void passesAllFiltersToService() throws Exception {
        when(service.findAll("1984", "orwell", "distop")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books")
                        .param("title", "1984")
                        .param("author", "orwell")
                        .param("genre", "distop"))
                .andExpect(status().isOk());

        verify(service).findAll("1984", "orwell", "distop");
    }

    // ── serialización ────────────────────────────────────────────────────────

    @Test
    void responseDoesNotContainInternalIdField() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK", "Título", "Autor", "Género", 2000, null, null, null)
        ));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").doesNotExist())
                .andExpect(jsonPath("$[0].ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"));
    }

    @Test
    void withNullPublicationYearSerializesAsNull() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of(
                new BookResponse("B01", "01HW5XMTSC0000000000000000", "La odisea", "Homero", "Épica", null, null, null, null)
        ));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].publicationYear").isEmpty());
    }
}
