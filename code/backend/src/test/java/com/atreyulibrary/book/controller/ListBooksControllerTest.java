package com.atreyulibrary.book.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.book.dto.PageResponse;
import com.atreyulibrary.book.service.BookService;
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

    private static final BookResponse SAMPLE = new BookResponse(
            "A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
            "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967, null, null, null);

    private static PageResponse<BookResponse> pageOf(final BookResponse... books) {
        final List<BookResponse> list = List.of(books);
        final int totalPages = list.isEmpty() ? 0 : 1;
        return new PageResponse<>(list, 0, 10, list.size(), totalPages, false, false);
    }

    // ── happy paths ──────────────────────────────────────────────────────────

    @Test
    void returns200WithBooksFromService() throws Exception {
        when(service.findAll(null, null, null, 0, 10)).thenReturn(pageOf(SAMPLE));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].code").value("A01"))
                .andExpect(jsonPath("$.content[0].ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(jsonPath("$.content[0].title").value("Cien años de soledad"))
                .andExpect(jsonPath("$.content[0].author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$.content[0].genre").value("Realismo mágico"))
                .andExpect(jsonPath("$.content[0].publicationYear").value(1967));
    }

    @Test
    void withNoResultsReturnsEmptyContentArray() throws Exception {
        when(service.findAll(null, null, null, 0, 10)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    // ── paginación ───────────────────────────────────────────────────────────

    @Test
    void returnsPaginationMetadata() throws Exception {
        final PageResponse<BookResponse> fullPage = new PageResponse<>(
                List.of(SAMPLE), 0, 10, 1500L, 75, true, false);
        when(service.findAll(null, null, null, 0, 10)).thenReturn(fullPage);

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1500))
                .andExpect(jsonPath("$.totalPages").value(75))
                .andExpect(jsonPath("$.hasNext").value(true))
                .andExpect(jsonPath("$.hasPrevious").value(false));
    }

    @Test
    void passesPageAndSizeToService() throws Exception {
        when(service.findAll(null, null, null, 3, 50)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books").param("page", "3").param("size", "50"))
                .andExpect(status().isOk());

        verify(service).findAll(null, null, null, 3, 50);
    }

    @Test
    void usesDefaultPageAndSizeWhenNotProvided() throws Exception {
        when(service.findAll(null, null, null, 0, 10)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk());

        verify(service).findAll(null, null, null, 0, 10);
    }

    // ── filtros ──────────────────────────────────────────────────────────────

    @Test
    void passesTitleFilterToService() throws Exception {
        when(service.findAll("quijote", null, null, 0, 10)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books").param("title", "quijote"))
                .andExpect(status().isOk());

        verify(service).findAll("quijote", null, null, 0, 10);
    }

    @Test
    void passesAuthorFilterToService() throws Exception {
        when(service.findAll(null, "orwell", null, 0, 10)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books").param("author", "orwell"))
                .andExpect(status().isOk());

        verify(service).findAll(null, "orwell", null, 0, 10);
    }

    @Test
    void passesGenreFilterToService() throws Exception {
        when(service.findAll(null, null, "terror", 0, 10)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books").param("genre", "terror"))
                .andExpect(status().isOk());

        verify(service).findAll(null, null, "terror", 0, 10);
    }

    @Test
    void passesAllFiltersToService() throws Exception {
        when(service.findAll("1984", "orwell", "distop", 0, 10)).thenReturn(pageOf());

        mockMvc.perform(get("/api/v1/books")
                        .param("title", "1984")
                        .param("author", "orwell")
                        .param("genre", "distop"))
                .andExpect(status().isOk());

        verify(service).findAll("1984", "orwell", "distop", 0, 10);
    }

    // ── serialización ────────────────────────────────────────────────────────

    @Test
    void responseDoesNotContainInternalIdField() throws Exception {
        when(service.findAll(null, null, null, 0, 10)).thenReturn(pageOf(SAMPLE));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").doesNotExist())
                .andExpect(jsonPath("$.content[0].ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"));
    }

    @Test
    void withNullPublicationYearSerializesAsNull() throws Exception {
        final BookResponse bookWithoutYear = new BookResponse(
                "B01", "01HW5XMTSC0000000000000000", "La odisea", "Homero", "Épica", null, null, null, null);
        when(service.findAll(null, null, null, 0, 10)).thenReturn(pageOf(bookWithoutYear));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].publicationYear").isEmpty());
    }
}
