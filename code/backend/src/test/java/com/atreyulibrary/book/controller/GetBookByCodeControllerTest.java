package com.atreyulibrary.book.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookResponse;
import com.atreyulibrary.book.exception.BookNotFoundException;
import com.atreyulibrary.book.service.BookService;
import com.atreyulibrary.config.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetBookByCodeController.class)
@Import(GlobalExceptionHandler.class)
class GetBookByCodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    @Test
    void returns200WithBookFields() throws Exception {
        when(service.getByCode("A01")).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Cien años de soledad", "Gabriel García Márquez",
                        "Realismo mágico", 1967, null, null, null)
        );

        mockMvc.perform(get("/api/v1/books/A01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A01"))
                .andExpect(jsonPath("$.title").value("Cien años de soledad"))
                .andExpect(jsonPath("$.author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$.genre").value("Realismo mágico"))
                .andExpect(jsonPath("$.publicationYear").value(1967));
    }

    @Test
    void returns404WhenBookNotFound() throws Exception {
        when(service.getByCode("Z99"))
                .thenThrow(new BookNotFoundException("Z99"));

        mockMvc.perform(get("/api/v1/books/Z99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Libro no encontrado: Z99"));
    }

    @Test
    void responseDoesNotContainInternalIdField() throws Exception {
        when(service.getByCode("A01")).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Título", "Autor", "Género", 2000, null, null, null)
        );

        mockMvc.perform(get("/api/v1/books/A01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"));
    }

    @Test
    void delegatesCodeToService() throws Exception {
        when(service.getByCode("B05")).thenReturn(
                new BookResponse("B05", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Título", "Autor", "Género", 2000, null, null, null)
        );

        mockMvc.perform(get("/api/v1/books/B05"))
                .andExpect(status().isOk());

        verify(service).getByCode("B05");
    }
}
