# AppHeaderComponent

Barra superior para móvil. Muestra el botón hamburguesa (☰) y el título de la sección activa.

## Uso básico

```html
<app-header (burgerToggle)="toggleSidebar()" />
<app-header title="Catálogo" (burgerToggle)="toggleSidebar()" />
```

## Inputs

| Nombre  | Tipo     | Default                  | Descripción                      |
|---------|----------|--------------------------|----------------------------------|
| `title` | `string` | `'Atreyu · biblioteca'`  | Título mostrado en la barra      |

## Outputs

| Nombre          | Tipo   | Descripción                                              |
|-----------------|--------|----------------------------------------------------------|
| `burgerToggle`  | `void` | Emitido al hacer clic en el botón ☰ del header móvil    |

## Variantes

| Breakpoint | Comportamiento          |
|------------|-------------------------|
| `< md`     | Visible (`flex`)        |
| `≥ md`     | Oculto (`md:hidden`)    |

## Notas

- El botón ☰ tiene `data-cy="burger-menu"` para tests E2E y `aria-label="Abrir menú de navegación"` para accesibilidad.
- Usa `input<string>()` y `output<void>()` de Angular signals (Angular 17+).
- El título usa `font-editorial` (IM Fell English) para mantener la estética de la marca.
- Para títulos dinámicos por ruta, pasar el valor desde `AppLayoutComponent` vía un servicio de título o `ActivatedRoute.data`.
