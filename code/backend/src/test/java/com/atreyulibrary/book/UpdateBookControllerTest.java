package com.atreyulibrary.book;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookRequest;
import com.atreyulibrary.book.dto.BookResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.atreyulibrary.config.GlobalExceptionHandler;

@WebMvcTest(UpdateBookController.class)
@Import(GlobalExceptionHandler.class)
class UpdateBookControllerTest {

    private static final String ULID = "01HW5XMTSC9AZAZ5YR0DR7B7GK";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookService service;

    @Test
    void returns200WithUpdatedBook() throws Exception {
        final BookRequest request = new BookRequest(
                "Crónica de una muerte anunciada", "García Márquez",
                "Novela", 1981, null);
        when(service.update(eq(ULID), any())).thenReturn(
                new BookResponse("A01", ULID,
                        "Crónica de una muerte anunciada", "García Márquez",
                        "Novela", 1981, null, null, null)
        );

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Crónica de una muerte anunciada"))
                .andExpect(jsonPath("$.author").value("García Márquez"))
                .andExpect(jsonPath("$.genre").value("Novela"))
                .andExpect(jsonPath("$.publicationYear").value(1981));
    }

    @Test
    void returns404WhenBookNotFound() throws Exception {
        final BookRequest request = new BookRequest("Título", "Autor", null, null, null);
        when(service.update(eq(ULID), any()))
                .thenThrow(new BookNotFoundException(ULID));

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Libro no encontrado: " + ULID));
    }

    @Test
    void returns422WhenTitleIsBlank() throws Exception {
        final BookRequest request = new BookRequest("", "Autor", null, null, null);

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void returns422WhenAuthorIsBlank() throws Exception {
        final BookRequest request = new BookRequest("Título", "", null, null, null);

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.author").exists());
    }

    @Test
    void responseDoesNotContainInternalId() throws Exception {
        final BookRequest request = new BookRequest("Título", "Autor", null, null, null);
        when(service.update(eq(ULID), any())).thenReturn(
                new BookResponse("A01", ULID, "Título", "Autor", null, null, null, null, null)
        );

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").doesNotExist());
    }

    @Test
    void codeIsNotChangedAfterUpdate() throws Exception {
        final BookRequest request = new BookRequest("Nuevo título", "Autor", null, null, null);
        when(service.update(eq(ULID), any())).thenReturn(
                new BookResponse("A01", ULID, "Nuevo título", "Autor", null, null, null, null, null)
        );

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A01"));
    }

    @Test
    void delegatesUlidAndRequestToService() throws Exception {
        final BookRequest request = new BookRequest("Título", "Autor", null, null, null);
        when(service.update(eq(ULID), any())).thenReturn(
                new BookResponse("A01", ULID, "Título", "Autor", null, null, null, null, null)
        );

        mockMvc.perform(put("/api/v1/books/" + ULID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(service).update(eq(ULID), any(BookRequest.class));
    }
}
