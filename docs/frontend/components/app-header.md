# AppHeaderComponent

Barra superior para móvil. Muestra el título de la sección activa.

## Uso básico

```html
<app-header />
<app-header title="Catálogo" />
```

## Inputs

| Nombre  | Tipo     | Default                  | Descripción                      |
|---------|----------|--------------------------|----------------------------------|
| `title` | `string` | `'Atreyu · biblioteca'`  | Título mostrado en la barra      |

## Variantes

| Breakpoint | Comportamiento          |
|------------|-------------------------|
| `< md`     | Visible (`flex`)        |
| `≥ md`     | Oculto (`md:hidden`)    |

## Notas

- Usa `input<string>()` de Angular signals (Angular 17+).
- El título usa `font-editorial` (IM Fell English) para mantener la estética de la marca.
- Para títulos dinámicos por ruta, pasar el valor desde `AppLayoutComponent` vía un servicio de título o `ActivatedRoute.data`.
