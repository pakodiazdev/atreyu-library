# Convenciones — Template de Tareas

> Este documento define la estructura estándar para la creación de issues en el proyecto
> Atreyu Library. Su objetivo es garantizar consistencia en el backlog, facilitar la lectura
> del board y establecer criterios claros de completitud para cada tarea.

---

## Título

```
{emoji_area} {Verbo} {objeto concreto}
```

| Emoji | Área |
|-------|------|
| 📚 | Documentación |
| 🏗️ | Infraestructura |
| ⚙️ | CI/CD |
| ☁️ | Cloud |
| ⚡ | Backend |
| 🎨 | Frontend |
| 🧪 | Testing |
| 🧹 | Chore |

---

## Labels

| Categoría | Opciones |
|-----------|----------|
| Tipo | ✨ feature · 🐛 bug · 📝 docs · 🔧 chore |
| Prioridad | 🔴 priority: high · 🟡 priority: medium · 🟢 priority: low |
| Sprint | 🏃 sprint-0 · 🏃 sprint-1 · 🏃 sprint-2 · 🏃 sprint-3 · 🏃 sprint-4 · 🏃 sprint-5 |

---

## Template

```markdown
## 👤 Historia de usuario *(solo para issues ✨ feature)*
Como [rol], quiero [acción], para [beneficio].

## Objetivo
Qué se quiere lograr y por qué.

## Alcance
Qué incluye y qué NO incluye este issue.

## Notas técnicas
Decisiones de implementación relevantes.

## 📋 Requerimientos *(omitir si no aplica)*
- RF-XX / RNF-XX: descripción corta

## Criterios de aceptación
- [ ] ...

## Definition of Done
- [ ] Tests pasando
- [ ] Lint sin errores
- [ ] SonarCloud sin issues nuevos
- [ ] Review de Copilot sin observaciones críticas
- [ ] Review de Devin sin observaciones críticas
- [ ] PR aprobado y mergeado a main
- [ ] Desplegado en producción

## ⏱️ Estimación
- **Optimista:** —
- **Pesimista:** —
- **Tiempo real invertido:** —

## 📅 Registro de sesiones
```json
{
  "estimate": {
    "optimisticMinutes": 0,
    "pessimisticMinutes": 0
  },
  "sessions": []
}
```

## 📊 Desviación *(completar al cerrar el issue)*
- Diferencia vs optimista: —
- Diferencia vs pesimista: —
```

### Registro de tiempo

**Estimación** — se completa al crear el issue, antes de iniciar desarrollo. Los minutos
en `estimate` son la fuente de verdad para el cálculo de desviación.

| Campo | Descripción |
|-------|-------------|
| Optimista | Tiempo mínimo si todo sale bien |
| Pesimista | Tiempo máximo considerando imprevistos |
| Tiempo real invertido | Se calcula sumando la duración de todas las sesiones al cerrar el issue |

**Sesiones** — se registran en tiempo real durante el desarrollo. El agente es responsable
de ayudar a mantener este registro:

- Al iniciar trabajo en el issue, el agente agrega automáticamente el `start`
- Al terminar la sesión, el developer lo indica y el agente registra el `end`
- Cada sesión es un objeto independiente dentro de `sessions`

```json
{
  "estimate": {
    "optimisticMinutes": 60,
    "pessimisticMinutes": 180
  },
  "sessions": [
    { "date": "2026-05-08", "start": "20:00", "end": "21:30" },
    { "date": "2026-05-09", "start": "08:00", "end": "11:00" }
  ]
}
```

**Desviación** — se completa al cerrar el issue. Fórmula: tiempo real − estimado.
Signo positivo = excedido, negativo = por debajo.

```
Tiempo real invertido: 4h 30m  (270 min)
Diferencia vs optimista:  +3h 30m  (270 − 60)
Diferencia vs pesimista:  +1h 30m  (270 − 180)
```

---

## Ejemplos de títulos

```
📚 Create architecture document
🏗️ Initialize monorepo structure
⚙️ Configure PR workflow with lint and tests
☁️ Deploy backend to Cloud Run
⚡ Implement GET /books with search filters
🎨 Implement book list with search
🧪 Add unit tests for BookService
🧹 Configure ESLint and Prettier
```

---

## Ejemplo completo

**Título:** `📚 Define task template and project conventions`

**Labels:** `📝 docs` · `🔴 priority: high` · `🏃 sprint-0`

```markdown
## Objetivo
Establecer la estructura estándar de issues y convenciones del proyecto para garantizar
consistencia en el backlog y facilitar la revisión técnica.

> 👤 Historia de usuario no aplica — issue tipo 📝 docs.

## Alcance
✅ Incluye: formato de título, sistema de labels con emojis, template de issue,
   Definition of Done, flujo de review (Copilot + Devin).
❌ No incluye: convenciones de código, git flow, API naming.

## Notas técnicas
- Se opta por labels sobre campos nativos de GitHub Projects para que la prioridad
  sea visible desde la vista de Issues sin necesidad de abrir el board.
- El DoD incluye review de Copilot y Devin como parte del workflow de
  AI-assisted development del proyecto.

## 📋 Requerimientos
- RNF-08: El proyecto debe incluir documentación de arquitectura de solución
- RNF-10: El proyecto debe incluir documentación de componentes con entradas y salidas

## Criterios de aceptación
- [ ] Documento publicado en docs/conventions/tasks.md
- [ ] Labels creados en GitHub con emojis
- [ ] Issue template disponible en .github/ISSUE_TEMPLATE/

## Definition of Done
- [ ] PR aprobado y mergeado a main

## ⏱️ Estimación
- **Optimista:** 1h
- **Pesimista:** 3h
- **Tiempo real invertido:** 2h 30m

## 📅 Registro de sesiones
```json
{
  "estimate": {
    "optimisticMinutes": 60,
    "pessimisticMinutes": 180
  },
  "sessions": [
    { "date": "2026-05-08", "start": "20:00", "end": "21:30" },
    { "date": "2026-05-09", "start": "08:00", "end": "09:00" }
  ]
}
```

## 📊 Desviación *(completar al cerrar el issue)*
- Diferencia vs optimista: +1h 30m
- Diferencia vs pesimista: -0h 30m
```
