# TD-03 · PostgreSQL como motor de base de datos — Supabase como proveedor del demo

## Decisión

El motor de base de datos es **PostgreSQL**. Para el ambiente de demo, el hosting se
realiza en **Supabase** (tier gratuito).

## Justificación del motor

- Stack enterprise y corporativo, estándar en entornos productivos con Spring Boot
- El modelo de datos es claro y bien definido (entidad `Book` con esquema estático),
  lo que hace de una base de datos relacional la elección natural
- Integración nativa con Spring Data JPA sin capas adicionales de abstracción

## Justificación del proveedor (Supabase)

La elección del proveedor es una **decisión operativa y financiera**, independiente
del motor. El código de la aplicación no distingue entre proveedores — Spring Boot
se conecta a través de un connection string estándar de PostgreSQL.

Supabase se elige para el demo por:

- **Costo cero** en tier gratuito (500MB, más que suficiente para el demo)
- **Dashboard visual** — permite mostrar tablas, registros y queries durante la
  presentación, lo que aporta valor demostrativo
- **PostgreSQL puro** por debajo — sin adaptaciones ni drivers especiales
- **Portabilidad total** — migrar a Cloud SQL, RDS o cualquier otro proveedor
  PostgreSQL es únicamente un cambio de connection string en las variables de
  entorno de Cloud Run, sin tocar el código

## Estrategia de escalabilidad

Si el proyecto crece y requiere mayor capacidad, la migración a un proveedor más
robusto (Google Cloud SQL, Amazon RDS, etc.) es transparente para la aplicación.
Esta portabilidad es una ventaja directa de usar un motor estándar con JPA como
capa de abstracción.
