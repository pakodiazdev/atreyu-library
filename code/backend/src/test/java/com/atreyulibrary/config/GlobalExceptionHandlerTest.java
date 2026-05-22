package com.atreyulibrary.config;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atreyulibrary.book.controller.GetBookByCodeController;
import com.atreyulibrary.book.exception.BookNotFoundException;
import com.atreyulibrary.book.service.BookService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GetBookByCodeController.class)
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    @Test
    void returns404WithErrorBodyWhenBookNotFound() throws Exception {
        when(service.getByCode("Z99")).thenThrow(new BookNotFoundException("Z99"));

        mockMvc.perform(get("/api/v1/books/Z99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Libro no encontrado: Z99"))
                .andExpect(jsonPath("$.timestamp").doesNotExist())
                .andExpect(jsonPath("$.status").doesNotExist())
                .andExpect(jsonPath("$.path").doesNotExist());
    }
}
