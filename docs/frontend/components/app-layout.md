# AppLayoutComponent

Shell principal de la aplicación. Gestiona el estado del drawer de navegación móvil y combina sidebar + área de contenido.

## Uso básico

```html
<!-- app.html -->
<app-layout />
```

> Renderizado automáticamente desde `AppComponent`. No se instancia directamente en otras vistas.

## Estado interno

| Signal / Método     | Descripción                                                    |
|---------------------|----------------------------------------------------------------|
| `sidebarOpen`       | Signal `boolean` — indica si el drawer móvil está abierto     |
| `toggleSidebar()`   | Invierte `sidebarOpen`; llamado desde `AppHeaderComponent`     |
| `closeSidebar()`    | Establece `sidebarOpen` en `false`; llamado desde backdrop, nav-link o Escape |
| `onEscape()`        | `@HostListener('document:keydown.escape')` → llama `closeSidebar()` |

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
└── div.flex-col
    ├── app-header (burgerToggle)
    └── main > router-outlet
```

## Notas

- El backdrop cierra el drawer al hacer clic (`(click)="closeSidebar()"`).
- La tecla Escape cierra el drawer desde cualquier punto de la página.
- El scroll de la página ocurre en `<main>`, no en `<body>`.
- `data-cy="sidebar-backdrop"` en el backdrop para tests E2E.
