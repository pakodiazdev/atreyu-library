package com.atreyulibrary.book;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.dto.BookResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetBookByUlidController.class)
class GetBookByUlidControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    @Test
    void returns200WithBookFields() throws Exception {
        when(service.getByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK",
                        "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967)
        );

        mockMvc.perform(get("/api/v1/books/01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A01"))
                .andExpect(jsonPath("$.ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(jsonPath("$.title").value("Cien años de soledad"))
                .andExpect(jsonPath("$.author").value("Gabriel García Márquez"))
                .andExpect(jsonPath("$.genre").value("Realismo mágico"))
                .andExpect(jsonPath("$.publicationYear").value(1967));
    }

    @Test
    void returns404WhenBookNotFound() throws Exception {
        when(service.getByUlid("01HW00000000000000000000ZZ"))
                .thenThrow(new BookNotFoundException("01HW00000000000000000000ZZ"));

        mockMvc.perform(get("/api/v1/books/01HW00000000000000000000ZZ"))
                .andExpect(status().isNotFound());
    }

    @Test
    void responseDoesNotContainInternalIdField() throws Exception {
        when(service.getByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK", "Título", "Autor", "Género", 2000)
        );

        mockMvc.perform(get("/api/v1/books/01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.ulid").value("01HW5XMTSC9AZAZ5YR0DR7B7GK"));
    }

    @Test
    void delegatesUlidToService() throws Exception {
        when(service.getByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK")).thenReturn(
                new BookResponse("A01", "01HW5XMTSC9AZAZ5YR0DR7B7GK", "Título", "Autor", "Género", 2000)
        );

        mockMvc.perform(get("/api/v1/books/01HW5XMTSC9AZAZ5YR0DR7B7GK"))
                .andExpect(status().isOk());

        verify(service).getByUlid("01HW5XMTSC9AZAZ5YR0DR7B7GK");
    }
}
