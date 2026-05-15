# Estrategia de Testing — Atreyu Library

> Este documento define qué se testea, en qué capa y por qué.
> Seguir esta estrategia garantiza cobertura efectiva sin desperdiciar
> tiempo de cómputo ni tiempo de desarrollo.

---

## Principio fundamental

> **El costo de un test debe ser proporcional al valor que aporta.**

Las pruebas E2E son las más costosas en tiempo y cómputo. Se reservan para
validar que el sistema funciona de extremo a extremo en el flujo principal.
Los casos alternativos, errores y validaciones se cubren en capas más baratas.

---

## Pirámide de testing

```
         /‾‾‾‾‾‾‾‾‾‾‾‾‾\
        /   E2E (Cypress)  \        ← Pocos, lentos, costosos
       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
      /  Integración (BE+FE)  \     ← Medianos, moderados
     /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
    /    Unitarios (BE + FE)    \   ← Muchos, rápidos, baratos
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

---

## ¿Qué va en cada capa?

### ✅ E2E con Cypress — solo happy path

Los tests E2E validan que **el flujo principal funciona de punta a punta**,
desde la interfaz hasta la base de datos. Son lentos, costosos y frágiles
ante cambios de UI. Se usan con criterio.

**Qué se testea:**
- El usuario puede ver el catálogo de libros
- El usuario puede buscar un libro y obtener resultados
- El usuario puede ver el detalle de un libro
- El usuario puede editar un libro y los cambios persisten
- El usuario puede crear un libro y aparece en el catálogo
- El usuario puede eliminar un libro y desaparece del catálogo

**Qué NO se testea en E2E:**
- Validaciones de formulario (campo requerido, formato inválido)
- Mensajes de error de la API (404, 409, 500)
- Comportamiento con datos vacíos o bordes
- Flujos alternativos o casos de excepción

> **Regla:** si el escenario requiere simular un error del servidor,
> datos inválidos o un estado de excepción — va en unitarios o integración,
> no en E2E.

---

### 🔬 Tests de integración — sad path del backend

Los tests de integración verifican la interacción entre capas del backend
(Controller → Service → Repository → DB) con datos reales.

**Qué se testea:**
- `GET /books` con filtros que no arrojan resultados → 200 con lista vacía
- `GET /books/{id}` con ID inexistente → 404 con cuerpo de error estándar
- `POST /books` con código duplicado → 409 Conflict
- `POST /books` con campos inválidos → 400 con detalle de validación
- `PUT /books/{id}` sobre libro inexistente → 404
- `DELETE /books/{id}` sobre libro inexistente → 404

**Herramienta:** Spring Boot Test + `@SpringBootTest` + Testcontainers (Postgres real)

---

### 🧪 Tests unitarios — lógica y componentes aislados

Los tests unitarios validan la lógica de negocio en aislamiento, sin
levantar contexto de Spring ni base de datos. Son los más rápidos y baratos.

#### Backend (JUnit + Mockito)

**Qué se testea:**
- `BookService`: generación del código de libro (A00–Z99), lógica de búsqueda
- Validaciones de DTOs y entidades
- Mappers entre Entity ↔ DTO
- Casos borde: lista vacía, valores nulos, límites de formato

#### Frontend (Vitest + Testing Library)

**Qué se testea:**
- Componentes Angular: renderizado correcto según inputs
- Pipes: `TruncatePipe` con strings cortos, largos y vacíos
- Servicios: llamadas HTTP correctas, manejo de errores (mock de HttpClient)
- Validaciones de formulario: campos requeridos, longitud, formato

---

## Matriz de responsabilidades

| Escenario | Unitario | Integración | E2E |
|-----------|:--------:|:-----------:|:---:|
| Listar libros (flujo normal) | | | ✅ |
| Buscar libro por título | | | ✅ |
| Ver detalle de un libro | | | ✅ |
| Crear libro (flujo normal) | | | ✅ |
| Editar libro (flujo normal) | | | ✅ |
| Eliminar libro (flujo normal) | | | ✅ |
| Crear libro con código duplicado | | ✅ | |
| Crear libro con campos inválidos | ✅ | ✅ | |
| Buscar con filtros sin resultados | | ✅ | |
| Obtener libro inexistente (404) | | ✅ | |
| Lógica de generación de código | ✅ | | |
| Renderizado de componente Angular | ✅ | | |
| Validación de formulario en UI | ✅ | | |
| Pipe de truncado de texto | ✅ | | |
| Llamada HTTP del servicio Angular | ✅ | | |

---

## Reglas de oro

1. **Un bug en producción → un test unitario nuevo.** Si algo falló en prod, la primera acción es escribir el test que lo hubiera detectado.

2. **E2E no reemplaza unitarios.** Que el E2E pase no garantiza que la lógica de negocio esté cubierta.

3. **No duplicar cobertura entre capas.** Si un caso ya está cubierto en unitarios, no lo repitas en E2E.

4. **Los E2E deben pasar siempre.** Son el contrato mínimo del sistema. Si un E2E falla, es bloqueante.

5. **Sad paths van en la capa más barata que los pueda cubrir.** Primero unitarios, luego integración, nunca E2E.
