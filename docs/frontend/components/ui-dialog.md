# UiDialogComponent

Modal de confirmación centrado en pantalla. Se monta con animación de fade + scale, bloquea el scroll del body mientras está visible y puede cerrarse con el botón ✕, clic en el backdrop o la tecla `Escape`.

## Uso básico

```html
<ui-dialog [isOpen]="dialog.isOpen()" [title]="'Eliminar libro'" (closed)="closeDialog()">
  <app-book-delete-form />
</ui-dialog>
```

El componente se declara **una única vez** en `AppLayoutComponent`. El contenido del modal se controla mediante `DialogService`; los features nunca instancian `UiDialogComponent` directamente.

## Inputs

| Nombre   | Tipo                   | Default     | Descripción                        |
|----------|------------------------|-------------|------------------------------------|
| `isOpen` | `boolean`              | `false`     | Controla la visibilidad del dialog |
| `title`  | `string \| undefined`  | `undefined` | Título opcional en la cabecera     |

## Outputs

| Nombre   | Tipo                 | Descripción                                              |
|----------|----------------------|----------------------------------------------------------|
| `closed` | `EventEmitter<void>` | Emitido al pulsar ✕, clic en backdrop o tecla `Escape`   |

## Comportamiento

- **Animación de entrada**: opacity 0 + scale-95 → opacity 100 + scale-100 en el siguiente frame RAF (~200ms CSS transition).
- **Animación de salida**: revierte la transición; el elemento se elimina del DOM 210ms después.
- **Scroll lock**: bloquea `document.body` mientras el dialog está visible; se restaura al completar la animación de salida.
- **Backdrop**: semitransparente `bg-tinta/40`, clic lo cierra.
- **Escape**: `HostListener` en `document:keydown.escape` emite `closed`. `AppLayoutComponent` ignora el evento propio cuando el dialog está abierto para evitar doble cierre.

## DialogService

Gestiona el estado del dialog a nivel global. Soporta el modo `'book-delete'`.

```ts
private readonly dialog = inject(DialogService);

// Abrir
this.dialog.openBookDelete(book.code, book.ulid);

// Cerrar
this.dialog.close();

// Notificar eliminación exitosa (cierra el dialog e incrementa el contador)
this.dialog.notifyBookDeleted();
```

### Señales públicas

| Señal          | Tipo                 | Descripción                                      |
|----------------|----------------------|--------------------------------------------------|
| `mode`         | `DialogMode \| null` | Modo activo (`'book-delete'` o `null`)           |
| `isOpen`       | `boolean` (computed) | `true` cuando hay un modo activo                 |
| `bookCode`     | `string \| null`     | Código del libro objetivo (solo en book-delete)  |
| `bookUlid`     | `string \| null`     | ULID del libro objetivo (solo en book-delete)    |
| `bookDeleted`  | `number`             | Contador que se incrementa tras cada eliminación |

## Selector

`ui-dialog` — componente standalone, importar desde el barrel `src/app/shared/ui`.
