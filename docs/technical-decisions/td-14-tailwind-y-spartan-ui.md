# TD-14 · Tailwind CSS + spartan/ui como stack de UI para Angular

## Decisión

El frontend usa **Tailwind CSS** como framework de estilos y **spartan/ui** como biblioteca
de componentes headless. Angular Material y otras bibliotecas de componentes opinadas
fueron descartadas.

## Justificación

### Por qué Tailwind CSS y no otro framework

Los wireframes del proyecto (`docs/prototyping/wireframes.html`) definen una estética custom
de "biblioteca cálida con tono fantástico" que requiere control total sobre el sistema visual:

- **Paleta de colores propia** — papel, tinte, tinta, oro, ámbar, óxido, musgo — sin correspondencia
  con ninguna paleta de sistema predefinida (Material, Bootstrap, Ant Design)
- **Tipografías editoriales** — IM Fell English (títulos), Patrick Hand (UI), Caveat (anotaciones),
  JetBrains Mono (códigos de libro)
- **Componentes visuales custom** — badges de género coloreados por categoría, cards de
  libro con bordes artesanales, sidebar de navegación con iconografía propia

Un framework de componentes opinado (Bootstrap, Material) forzaría sobreescribir su sistema
de diseño en su totalidad, generando una base de CSS en conflicto con los estilos propios.
Tailwind resuelve esto porque **no tiene opinión sobre el diseño** — provee utilidades atómicas
que se componen directamente en los templates, sin especificidad CSS que competir.

Además, Tailwind es totalmente compatible con **Angular 21 standalone components + signals**:
las clases se aplican en el template, no hay integración con el sistema de detección de cambios.

### Por qué spartan/ui y no Angular Material u otras alternativas

| Criterio | Angular Material | spartan/ui |
|----------|-----------------|------------|
| Integración con Tailwind | Conflicto de estilos — Material tiene su propio sistema de theming | Nativa — construida sobre Tailwind CSS |
| Propiedad del código | Componentes como dependencia opaca | Los componentes se copian al proyecto — el equipo los posee y modifica |
| Compatibilidad con Angular 21 | Compatible | Compatible — construida con CDK + signals |
| Flexibility visual | Alta resistencia al override | Control total — el HTML y CSS están en el proyecto |
| Filosofía de diseño | Impone Material Design | Headless — solo lógica, sin visual opinion |

**spartan/ui** implementa la filosofía de shadcn/ui (ampliamente adoptada en React) para Angular:
los componentes no son una caja negra en `node_modules` sino archivos que viven en el proyecto,
copiados mediante CLI. Esto permite ajustar botones, diálogos y tablas a la estética del wireframe
sin pelear contra una biblioteca externa.

Componentes de spartan/ui que cubre este proyecto: `hlm-button`, `hlm-dialog`, `hlm-table`,
`hlm-badge`, `hlm-card`, `hlm-input`, `hlm-select`.

### Alternativas descartadas

- **Angular Material**: visual language de Material Design incompatible con la estética definida
  en los wireframes. Sobrescribir el theming completo (paleta, tipografía, forma de componentes)
  requeriría más trabajo que construir directamente con Tailwind.
- **Bootstrap**: framework orientado a proyectos con look genérico. Su sistema de grid y
  componentes predefinidos añaden peso sin aportar valor en un diseño custom como este.
- **shadcn/ui**: exclusivo de React — construido sobre Radix UI que no tiene soporte para Angular.
  spartan/ui es el equivalente Angular mantenido activamente.

## Impacto en la arquitectura

Tailwind se integra en el build de Angular vía **PostCSS** (`postcss.config.json`), usando
el plugin `@tailwindcss/postcss`. El builder de Angular (`@angular/build`) requiere el
archivo de configuración en formato JSON — el formato `.mjs` es ignorado en la pipeline de
build estándar.

Los tokens de diseño (colores, tipografías, espaciado) se definen directamente en
`src/styles.css` dentro del bloque `@theme {}`, que es la forma nativa de Tailwind CSS v4
para extender el tema. No existe `tailwind.config.js` — ese archivo es un artefacto de
Tailwind v3 que en v4 queda obsoleto.

Los componentes de spartan/ui se incorporarán en `code/frontend/src/app/shared/ui/` y se
consumirán como standalone components desde cualquier feature del proyecto. Este directorio
se crea cuando se introduzca spartan/ui en un issue dedicado.
