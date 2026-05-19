package com.atreyulibrary.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.atreyulibrary.book.BookCodePoolEmptyException;
import com.atreyulibrary.book.BookNotFoundException;

/**
 * Manejador global de excepciones.
 * Convierte errores de validación de Bean Validation en 422 Unprocessable Entity
 * con un cuerpo estructurado por campo, y excepciones de recurso no encontrado
 * en 404 con body {@code { "error": "..." }}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Convierte {@link MethodArgumentNotValidException} en 422 con los errores por campo.
     *
     * @param ex excepción lanzada por {@code @Valid}
     * @return mapa {@code { "errors": { "campo": "mensaje" } }}
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public Map<String, Object> handleValidation(final MethodArgumentNotValidException ex) {
        final Map<String, String> errors = new LinkedHashMap<>();
        for (final FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        final Map<String, Object> body = new LinkedHashMap<>();
        body.put("errors", errors);
        return body;
    }

    @ExceptionHandler(BookNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleNotFound(final BookNotFoundException ex) {
        return Map.of("error", ex.getMessage());
    }

    @ExceptionHandler(BookCodePoolEmptyException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Map<String, Object> handlePoolEmpty(final BookCodePoolEmptyException ex) {
        return Map.of("error", ex.getMessage());
    }
}
