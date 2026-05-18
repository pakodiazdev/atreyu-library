# UiToastComponent

Notificación flotante no bloqueante que confirma el resultado de una acción al usuario. Se muestra en la esquina inferior-izquierda y se auto-descarta tras 4 segundos.

## Uso básico

El componente se declara una única vez en `AppLayoutComponent` y se controla exclusivamente a través de `ToastService`. Los features nunca instancian `UiToastComponent` directamente.

```ts
// En cualquier store o service:
private readonly toast = inject(ToastService);

this.toast.show('Libro eliminado del catálogo');                     // success por defecto
this.toast.show('No se pudo guardar el libro', 'error');
this.toast.show('Libro añadido al catálogo', 'success', 400);       // con delay en ms
```

## API de ToastService

| Método | Firma | Descripción |
|--------|-------|-------------|
| `show` | `(message: string, variant?: ToastVariant, delayMs?: number) => void` | Muestra una notificación |
| `dismiss` | `(id: number) => void` | Descarta una notificación por id |

## Variantes

| Valor | Color | Cuándo usarlo |
|-------|-------|---------------|
| `'success'` | Verde musgo | Acción completada correctamente |
| `'error'` | Rojo óxido | Error irrecuperable o rechazo del servidor |
| `'info'` | Dorado oro | Información neutral, sin acción requerida |

## Regla de uso — cuándo y qué notificar

**Toda acción mutante iniciada por el usuario debe emitir un toast** al completarse (éxito o error no recuperable). La notificación es la confirmación explícita de que el sistema procesó la acción.

| Acción | Variante | Mensaje |
|--------|----------|---------|
| Crear libro | `success` | `'Libro añadido al catálogo'` |
| Editar libro | `success` | `'Cambios guardados'` |
| Eliminar libro | `success` | `'Libro eliminado del catálogo'` |
| Error de servidor (500 / red) | `error` | Mensaje descriptivo del error |

**Acciones que NO necesitan toast:** navegación, apertura/cierre de drawers y dialogs, cambios de filtro — son feedback visual inmediato, el usuario ya lo ve.

### Delay post-animación

Cuando la acción cierra un drawer o dialog antes de mostrar el toast, usar `delayMs` para que la notificación aparezca una vez terminada la animación de cierre. El drawer usa 350 ms, por lo que el valor recomendado es **400 ms**.

```ts
this.toast.show('Libro eliminado del catálogo', 'success', 400);
```

## Notas

- Máximo visible a la vez: sin límite técnico, pero el diseño asume mensajes de texto corto (< 60 caracteres).
- Los toasts se apilan verticalmente si hay varios activos simultáneamente.
- El usuario puede descartarlos manualmente con el botón ✕.
- `ToastService` es `providedIn: 'root'` — una única instancia compartida por toda la app.
