package com.atreyulibrary.book;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.config.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CreateBookController.class)
@Import(GlobalExceptionHandler.class)
class CreateBookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    // ── happy path ───────────────────────────────────────────────────────────

    @Test
    void returns201WithCreatedBook() throws Exception {
        when(service.create(any(BookRequest.class))).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Cien años de soledad", "Gabriel García Márquez",
                        "Realismo mágico", 1967, null, null, null)
        );

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "title": "Cien años de soledad",
                              "author": "Gabriel García Márquez",
                              "genre": "Realismo mágico",
                              "publicationYear": 1967
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("A01"))
                .andExpect(jsonPath("$.ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(jsonPath("$.title").value("Cien años de soledad"))
                .andExpect(jsonPath("$.author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$.genre").value("Realismo mágico"))
                .andExpect(jsonPath("$.publicationYear").value(1967));
    }

    @Test
    void returns201WithLocationHeader() throws Exception {
        when(service.create(any(BookRequest.class))).thenReturn(
                new BookResponse("B05", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "1984", "George Orwell", null, 1949, null, null, null)
        );

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "title": "1984",
                              "author": "George Orwell"
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/books/B05"));
    }

    @Test
    void doesNotExposeInternalId() throws Exception {
        when(service.create(any(BookRequest.class))).thenReturn(
                new BookResponse("C01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "El principito", "Antoine de Saint-Exupéry", null, 1943, null, null, null)
        );

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "title": "El principito",
                              "author": "Antoine de Saint-Exupéry"
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").doesNotExist());
    }

    @Test
    void delegatesRequestToService() throws Exception {
        when(service.create(any(BookRequest.class))).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Moby Dick", "Herman Melville", "Aventura", 1851, null, null, null)
        );

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "title": "Moby Dick",
                              "author": "Herman Melville",
                              "genre": "Aventura",
                              "publicationYear": 1851
                            }
                            """))
                .andExpect(status().isCreated());

        verify(service).create(any(BookRequest.class));
    }

    // ── validación — 422 ────────────────────────────────────────────────────

    @Test
    void returns422WhenTitleIsMissing() throws Exception {
        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "author": "George Orwell"
                            }
                            """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void returns422WhenAuthorIsMissing() throws Exception {
        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "title": "1984"
                            }
                            """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.author").exists());
    }

    @Test
    void returns422WhenBodyIsEmpty() throws Exception {
        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors").isMap());
    }
}
