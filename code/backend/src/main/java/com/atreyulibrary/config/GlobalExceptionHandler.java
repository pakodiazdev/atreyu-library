package com.atreyulibrary.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de excepciones.
 * Convierte errores de validación de Bean Validation en 422 Unprocessable Entity
 * con un cuerpo estructurado por campo.
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
}
