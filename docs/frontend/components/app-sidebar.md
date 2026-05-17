# AppSidebarComponent

Sidebar de navegación principal. En desktop es un panel fijo; en móvil actúa como drawer lateral animado controlado desde `AppLayoutComponent`.

## Uso básico

```html
<app-sidebar [isOpen]="sidebarOpen()" (closed)="closeSidebar()" />
```

## Inputs

| Nombre   | Tipo      | Default | Descripción                                          |
|----------|-----------|---------|------------------------------------------------------|
| `isOpen` | `boolean` | `false` | Controla si el drawer está visible en móvil          |

## Outputs

| Nombre   | Tipo   | Descripción                                                        |
|----------|--------|--------------------------------------------------------------------|
| `closed` | `void` | Emitido al hacer clic en un enlace de nav (para cerrar el drawer) |

## Variantes

| Breakpoint | Comportamiento                                                        |
|------------|-----------------------------------------------------------------------|
| `< md`     | Drawer fijo (`position: fixed`), entra desde la izquierda con `translateX`. Visible solo cuando `isOpen = true` |
| `≥ md`     | Panel estático (`md:static md:translate-x-0`), siempre visible, ignorando `isOpen` |

## Animación

La transición usa clases Tailwind puras (`transition-transform duration-300 ease-in-out`) sin dependencias externas. Las clases `translate-x-0` / `-translate-x-full` se aplican mediante binding `[class]`.

## Estructura de navegación

| Icono | Etiqueta       | Ruta            |
|-------|----------------|-----------------|
| ⌂     | Inicio         | `/inicio`       |
| ◫     | Catálogo       | `/catalogo`     |
| ◎     | Buscar         | `/buscar`       |
| +     | Añadir libro   | `/libros/nuevo` |
| ⊞     | Géneros        | `/generos`      |

## Notas

- Los enlaces usan `routerLinkActive` para resaltar la ruta activa.
- El ancho es fijo: `w-[200px]`.
- El `data-cy="sidebar-drawer"` está presente en `<aside>` para tests E2E.
- Para añadir nuevos enlaces, editar la propiedad `navItems` en el componente.
