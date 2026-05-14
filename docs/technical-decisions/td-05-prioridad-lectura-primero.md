# TD-05 · Prioridad de desarrollo: Lectura → Actualización → Creación → Eliminación

## Decisión

El orden de implementación de las operaciones CRUD no sigue el orden convencional
(Create → Read → Update → Delete), sino uno basado en **valor de negocio**:

1. Infraestructura
2. Lectura
3. Actualización
4. Creación
5. Eliminación

## Justificación

- **Lectura primero**: la consulta de datos es la operación de mayor frecuencia y valor
  inmediato para el usuario final.
- **Actualización antes de Creación**: al contar con datos iniciales provistos por el
  seeder, la funcionalidad de edición puede entregar valor real sin depender de que el
  usuario haya creado registros. La Creación queda al final porque su valor es la
  **autonomía del usuario** para gestionar su propio catálogo, no un prerrequisito
  funcional para las operaciones anteriores.
- Esta secuencia sirve también como demostración explícita de **priorización basada en
  valor**, no en conveniencia técnica.
