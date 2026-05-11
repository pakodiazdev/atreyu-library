# AppSidebarComponent

Sidebar de navegación principal. Contiene el branding y los enlaces de la app.

## Uso básico

```html
<app-sidebar />
```

## Variantes

El sidebar se oculta en móvil (`hidden md:flex`) y se muestra a partir del breakpoint `md`.

## Estructura de navegación

| Icono | Etiqueta       | Ruta            |
|-------|----------------|-----------------|
| ⌂     | Inicio         | `/inicio`       |
| ◫     | Catálogo       | `/catalogo`     |
| ◎     | Buscar         | `/buscar`       |
| +     | Añadir libro   | `/libros/nuevo` |
| ⊞     | Géneros        | `/generos`      |

## Notas

- Los enlaces usan `routerLinkActive="bg-oro/20 text-oro"` para resaltar la ruta activa.
- El ancho es fijo: `w-60` (240 px).
- El fondo es `bg-tinta` con texto `text-papel` — inversión del tema principal.
- Para añadir nuevos enlaces, editar la propiedad `navItems` en el componente.
