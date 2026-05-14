# TD-18 · Single Action Controller como patrón para los endpoints REST

## Decisión

Cada endpoint REST tiene su propia clase controladora con un único método público `handle()`. En lugar de un `BookController` con múltiples métodos, el paquete expone clases especializadas:

| Clase | Endpoint |
|-------|----------|
| `GetBookByUlidController` | `GET /api/v1/books/{ulid}` |
| `ListBooksController` | `GET /api/v1/books` |
| `CreateBookController` *(futuro)* | `POST /api/v1/books` |
| `UpdateBookController` *(futuro)* | `PUT /api/v1/books/{ulid}` |
| `DeleteBookController` *(futuro)* | `DELETE /api/v1/books/{ulid}` |

Todas las clases comparten el mismo `@Tag(name = "Books")` de Swagger para mantener la agrupación en la UI de la documentación.

## Justificación

**SRP estricto — una clase, una razón para cambiar.**
Un controlador tradicional que agrupa todos los endpoints de un recurso cambia cada vez que cambia cualquiera de ellos: nueva validación en el listado, nueva cabecera en el detalle, nuevo parámetro en la creación. Con SAC, cada clase solo cambia cuando cambia su propio contrato HTTP. En proyectos con vida larga, esto reduce drásticamente los conflictos de merge y el riesgo de regresión.

**Dependencias explícitas por acción.**
Un controlador clásico inyecta todos los servicios que cualquiera de sus métodos pueda necesitar. Con SAC, el constructor declara exactamente lo que esa acción necesita — ni más, ni menos. Leer el constructor es leer el grafo de dependencias del endpoint.

**La verbosidad dejó de ser un argumento relevante.**
Pre-IA, escribir boilerplate era costoso en tiempo y era el principal contra del patrón. Con asistencia de IA, generar una clase SAC completa con tests es cuestión de segundos. El costo de creación se aproxima a cero, pero el beneficio de mantenimiento a largo plazo se mantiene intacto.

**Facilita el testing aislado.**
Cada controlador se testea en su propio archivo con su propio `@WebMvcTest`. No hay riesgo de que el setup de un test interfiera con otro endpoint del mismo controlador.

**Escalabilidad del equipo.**
Cuando varios desarrolladores trabajan en paralelo sobre el mismo recurso, los conflictos de merge en un archivo de controlador monolítico son frecuentes. Con SAC, cada desarrollador trabaja en su propio archivo.

**Economía de contexto en desarrollo asistido por IA.**
Un controlador monolítico que agrupa cinco endpoints ocupa cinco veces más tokens de contexto cada vez que un agente lo carga. Si la tarea es modificar solo el endpoint de detalle, el agente igualmente ingiere el código de listado, creación, actualización y eliminación — pagando un costo de contexto innecesario en cada interacción.

Con SAC, el agente carga únicamente el archivo relevante para la tarea. El resto de los controladores nunca forman parte del contexto activo si no son necesarios. En un proyecto con decenas de endpoints, la diferencia acumulada en tokens — y por tanto en latencia y costo — es significativa.

Este argumento invierte el peso histórico de la decisión: la verbosidad que antes era el principal contra del patrón es ahora irrelevante (generación IA), mientras que la granularidad que antes era un lujo se convierte en una ventaja operativa directa en flujos de trabajo asistidos por IA.

## Contras asumidos y descartados

| Contra | Impacto real |
|--------|-------------|
| Más archivos en el paquete | Bajo — los IDEs y la búsqueda por nombre compensan completamente |
| Swagger no agrupa automáticamente | Mitigado con `@Tag(name = "Books")` en cada clase |
| Más boilerplate por clase | Irrelevante en el contexto de desarrollo asistido por IA |
| Más beans en el contexto de Spring | Ver análisis debajo — no es un problema real |

### ¿Más beans de Spring es un problema?

Es el contra que más se menciona contra SAC en el mundo Java. La respuesta corta es **no**, y aquí está el por qué:

Cada `@RestController` registra un bean en el `ApplicationContext`. Pasar de 1 `BookController` a 5 SACs agrega 4 beans. El problema es que ese argumento ignora la escala real: una aplicación Spring Boot arranca con **300–500 beans de autoconfiguración** antes de que el desarrollador escriba una sola línea. 4 beans adicionales representan menos del 1% del total — el impacto en tiempo de arranque es literalmente inmeasurable.

El único escenario donde el número de clases tiene impacto real es **GraalVM Native Image**, donde la compilación AOT analiza el grafo de clases y más clases sí aumentan el tiempo de compilación y el tamaño del binario. Pero ese es un cambio de runtime completo que se decide por razones de latencia de cold start — no es una consecuencia de tener 4 controllers extra, y en Cloud Run con instancias mínimas activas el cold start no es el problema a resolver.

**Conclusión:** el argumento de beans es válido en teoría y falso en la práctica para cualquier proyecto Spring Boot de tamaño real. No es una razón para agrupar controllers.

## Implementación

El método de acción se nombra `handle` para mantener consistencia entre todos los controladores del proyecto, independientemente del verbo HTTP. El nombre es idiomático en el ecosistema Spring — el propio framework lo usa en `HttpRequestHandler`, `HandlerMethod` y `HandlerAdapter` — y describe con precisión el rol del método: este objeto *maneja* esta petición.

> **¿Por qué no `invoke`?** En Java, `invoke` pertenece semánticamente a la Reflection API (`Method.invoke()`, `InvocationHandler.invoke()`). Usarlo en un controlador generaría confusión sobre si el método es reflectivo o de negocio.
>
> **¿Por qué no el nombre del verbo HTTP (`get`, `post`)?** Mezcla el protocolo con el dominio y puede colisionar con nombres de métodos heredados de `Object`.

```java
@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books")
public class GetBookByUlidController {

    private final BookService service;

    public GetBookByUlidController(final BookService service) {
        this.service = service;
    }

    @GetMapping("/{ulid}")
    public ResponseEntity<BookResponse> handle(@PathVariable final String ulid) {
        return ResponseEntity.ok(service.getByUlid(ulid));
    }
}
```

