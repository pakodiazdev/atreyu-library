package com.atreyulibrary.book.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.exception.BookNotFoundException;
import com.atreyulibrary.book.service.BookService;
import com.atreyulibrary.config.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DeleteBookController.class)
@Import(GlobalExceptionHandler.class)
class DeleteBookControllerTest {

    private static final String ULID = "01HW5XMTSC9AZAZ5YR0DR7B7GK";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    @Test
    void returns204WhenBookIsDeleted() throws Exception {
        doNothing().when(service).deleteByUlid(ULID);

        mockMvc.perform(delete("/api/v1/books/" + ULID))
                .andExpect(status().isNoContent());
    }

    @Test
    void returns404WhenBookNotFound() throws Exception {
        doThrow(new BookNotFoundException(ULID)).when(service).deleteByUlid(ULID);

        mockMvc.perform(delete("/api/v1/books/" + ULID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Libro no encontrado: " + ULID));
    }

    @Test
    void delegatesUlidToService() throws Exception {
        doNothing().when(service).deleteByUlid(ULID);

        mockMvc.perform(delete("/api/v1/books/" + ULID))
                .andExpect(status().isNoContent());

        verify(service).deleteByUlid(ULID);
    }

    @Test
    void responseBodyIsEmpty() throws Exception {
        doNothing().when(service).deleteByUlid(ULID);

        final byte[] body = mockMvc.perform(delete("/api/v1/books/" + ULID))
                .andExpect(status().isNoContent())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        assertEquals(0, body.length);
    }
}
