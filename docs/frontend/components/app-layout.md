# AppLayoutComponent

Shell principal de la aplicación. Combina sidebar fijo + área de contenido con scroll.

## Uso básico

```html
<!-- app.html -->
<app-layout />
```

> Renderizado automáticamente desde `AppComponent`. No se instancia directamente en otras vistas.

## Variantes

| Breakpoint | Comportamiento |
|------------|----------------|
| `< md`     | Sidebar oculto; se muestra `AppHeaderComponent` en la parte superior |
| `≥ md`     | Sidebar visible (ancho fijo 240 px); header oculto |

## Estructura interna

```
app-layout
├── app-sidebar   (oculto en móvil)
└── div.flex-col
    ├── app-header  (oculto en desktop)
    └── main > router-outlet
```

## Notas

- Usa `display: contents` en `:host` para no introducir un elemento extra en el DOM.
- El scroll de la página ocurre en `<main>`, no en `<body>`.
- Para añadir una barra de título por ruta, inyectar el título vía `@Input` en `AppHeaderComponent`.
