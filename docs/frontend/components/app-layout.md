# AppLayoutComponent

Shell principal de la aplicación. Gestiona el sidebar móvil, el drawer global de contenido y la navegación asociada.

## Uso básico

```html
<!-- app.html -->
<app-layout />
```

> Renderizado automáticamente desde `AppComponent`. No se instancia directamente en otras vistas.

## Estado interno

| Signal / Método     | Descripción                                                                        |
|---------------------|------------------------------------------------------------------------------------|
| `sidebarOpen`       | Signal `boolean` — indica si el sidebar móvil está abierto                        |
| `toggleSidebar()`   | Invierte `sidebarOpen`; llamado desde `AppHeaderComponent`                         |
| `closeSidebar()`    | Establece `sidebarOpen` en `false`; llamado desde backdrop, nav-link o Escape      |
| `closeDrawer()`     | Cierra el drawer global vía `DrawerService`; si el modo era `'detail'`, navega a `/catalogo` con `replaceUrl: true` para no contaminar el historial |
| `onEscape()`        | `@HostListener('document:keydown.escape')` → llama `closeDrawer()` + `closeSidebar()` |

## Drawer global

`AppLayoutComponent` monta un `<ui-drawer>` fuera del `<router-outlet>`, lo que permite abrirlo desde cualquier ruta sin navegación. El estado del drawer lo gestiona `DrawerService` (inyectado como `providedIn: 'root'`).

| Modo (`DrawerService.mode`) | Contenido renderizado       |
|-----------------------------|-----------------------------|
| `'detail'`                  | `<app-libro-detail>`        |
| `'form'`                    | `<app-libro-form>`          |
| `null`                      | Drawer cerrado (sin DOM)    |

Al cerrar el drawer en modo `'detail'`, la URL vuelve a `/catalogo` usando `router.navigate(['/catalogo'], { replaceUrl: true })` — necesario porque la URL del detalle se estableció con `Location.replaceState` (sin entrada en el historial del router).

## Variantes

| Breakpoint | Comportamiento |
|------------|----------------|
| `< md`     | Sidebar como drawer deslizante; header con botón ☰ visible; backdrop semitransparente al abrir |
| `≥ md`     | Sidebar estático siempre visible; header oculto; `sidebarOpen` ignorado |

## Estructura interna

```
app-layout
├── [backdrop data-cy="sidebar-backdrop"]  (solo móvil, solo cuando sidebarOpen = true)
├── app-sidebar [isOpen] (closed)
├── div.flex-col
│   ├── app-header (burgerToggle)
│   └── main > router-outlet
└── ui-drawer [isOpen] [title] (closed)="closeDrawer()"
    ├── @if detail → app-libro-detail [bookCode]
    └── @if form   → app-libro-form
```

## Notas

- El backdrop del sidebar solo cubre `x > 200px` (ancho del sidebar) para que el click cierre correctamente en móvil.
- La tecla Escape cierra tanto el drawer global como el sidebar.
- El scroll de la página ocurre en `<main>`, no en `<body>` (el drawer bloquea el scroll de `<body>` mientras está abierto).
- `data-cy="sidebar-backdrop"` en el backdrop y `data-cy="global-drawer"` en el drawer para tests E2E.
