package com.atreyulibrary.book;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.BookNotFoundException;

import com.atreyulibrary.book.dto.BookResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BookController.class)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    // ── GET /api/v1/books/{ulid} ─────────────────────────────────────────────

    @Test
    void getByUlidReturns200WithBookFields() throws Exception {
        when(service.getByUlid("01HWXYZ1234567890ABCDEFGH")).thenReturn(
                new BookResponse("A01", "01HWXYZ1234567890ABCDEFGH",
                        "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967)
        );

        mockMvc.perform(get("/api/v1/books/01HWXYZ1234567890ABCDEFGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A01"))
                .andExpect(jsonPath("$.ulid").value("01HWXYZ1234567890ABCDEFGH"))
                .andExpect(jsonPath("$.title").value("Cien años de soledad"))
                .andExpect(jsonPath("$.author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$.genre").value("Realismo mágico"))
                .andExpect(jsonPath("$.publicationYear").value(1967));
    }

    @Test
    void getByUlidReturns404WhenBookNotFound() throws Exception {
        when(service.getByUlid("ULID_INEXISTENTE_00000000"))
                .thenThrow(new BookNotFoundException("ULID_INEXISTENTE_00000000"));

        mockMvc.perform(get("/api/v1/books/ULID_INEXISTENTE_00000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByUlidResponseDoesNotContainInternalIdField() throws Exception {
        when(service.getByUlid("01HWXYZ1234567890ABCDEFGH")).thenReturn(
                new BookResponse("A01", "01HWXYZ1234567890ABCDEFGH", "Título", "Autor", "Género", 2000)
        );

        mockMvc.perform(get("/api/v1/books/01HWXYZ1234567890ABCDEFGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.ulid").value("01HWXYZ1234567890ABCDEFGH"));
    }

    @Test
    void getByUlidDelegatesUlidToService() throws Exception {
        when(service.getByUlid("01HWXYZ1234567890ABCDEFGH")).thenReturn(
                new BookResponse("A01", "01HWXYZ1234567890ABCDEFGH", "Título", "Autor", "Género", 2000)
        );

        mockMvc.perform(get("/api/v1/books/01HWXYZ1234567890ABCDEFGH"))
                .andExpect(status().isOk());

        verify(service).getByUlid("01HWXYZ1234567890ABCDEFGH");
    }

    // ── GET /api/v1/books — happy paths ──────────────────────────────────────

    @Test
    void listReturns200WithBooksFromService() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of(
                new BookResponse("A01", "01HWXYZ1234567890ABCDEFGH",
                        "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967)
        ));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("A01"))
                .andExpect(jsonPath("$[0].ulid").value("01HWXYZ1234567890ABCDEFGH"))
                .andExpect(jsonPath("$[0].title").value("Cien años de soledad"))
                .andExpect(jsonPath("$[0].author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$[0].genre").value("Realismo mágico"))
                .andExpect(jsonPath("$[0].publicationYear").value(1967));
    }

    @Test
    void listWithNoResultsReturnsEmptyArray() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void listPassesTitleFilterToService() throws Exception {
        when(service.findAll("quijote", null, null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books").param("title", "quijote"))
                .andExpect(status().isOk());

        verify(service).findAll("quijote", null, null);
    }

    @Test
    void listPassesAuthorFilterToService() throws Exception {
        when(service.findAll(null, "orwell", null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books").param("author", "orwell"))
                .andExpect(status().isOk());

        verify(service).findAll(null, "orwell", null);
    }

    @Test
    void listPassesGenreFilterToService() throws Exception {
        when(service.findAll(null, null, "terror")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books").param("genre", "terror"))
                .andExpect(status().isOk());

        verify(service).findAll(null, null, "terror");
    }

    @Test
    void listPassesAllFiltersToService() throws Exception {
        when(service.findAll("1984", "orwell", "distop")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/books")
                        .param("title", "1984")
                        .param("author", "orwell")
                        .param("genre", "distop"))
                .andExpect(status().isOk());

        verify(service).findAll("1984", "orwell", "distop");
    }

    @Test
    void listResponseDoesNotContainInternalIdField() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of(
                new BookResponse("A01", "01HWXYZ1234567890ABCDEFGH", "Título", "Autor", "Género", 2000)
        ));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").doesNotExist())
                .andExpect(jsonPath("$[0].ulid").value("01HWXYZ1234567890ABCDEFGH"));
    }

    @Test
    void listWithNullPublicationYearSerializesAsNull() throws Exception {
        when(service.findAll(null, null, null)).thenReturn(List.of(
                new BookResponse("B01", "01HWXYZ0000000000ABCDEFGH", "La odisea", "Homero", "Épica", null)
        ));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].publicationYear").isEmpty());
    }
}
