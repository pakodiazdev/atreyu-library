# UiDrawerComponent

Panel lateral deslizante reutilizable. Se monta desde el borde derecho de la pantalla con animación CSS, bloquea el scroll del body mientras está visible y puede cerrarse con el botón ✕, clic en el backdrop o la tecla `Escape`.

## Uso básico

```html
<ui-drawer [isOpen]="isDrawerOpen()" (closed)="closeDrawer()">
  <app-libro-detail [bookCode]="bookCode" />
</ui-drawer>
```

## Inputs

| Nombre  | Tipo                    | Default     | Descripción                          |
|---------|-------------------------|-------------|--------------------------------------|
| `isOpen` | `boolean`              | `false`     | Controla la visibilidad del drawer   |
| `title`  | `string \| undefined`  | `undefined` | Título opcional en el header         |
| `size`   | `'sm' \| 'md' \| 'lg'` | `'md'`      | Ancho del panel (ver variantes)      |

## Outputs

| Nombre   | Tipo                   | Descripción                                            |
|----------|------------------------|--------------------------------------------------------|
| `closed` | `EventEmitter<void>`   | Emitido al pulsar ✕, clic en backdrop o tecla `Escape` |

## Variantes de tamaño

| Size | Comportamiento responsivo                                  |
|------|------------------------------------------------------------|
| `sm` | `w-full` → `sm:w-[min(80%,360px)]`                        |
| `md` | `w-full` → `sm:w-4/5` → `md:w-3/5` → `lg:w-[38%] min-w-[30vw]` |
| `lg` | `w-full` → `md:w-3/5` → `lg:w-[55%]`                     |

## Comportamiento

- **Animación de entrada**: el panel monta con `translate-x-full` y en el siguiente frame de animación pasa a `translate-x-0` (~350ms CSS transition).
- **Animación de salida**: al cerrar, revierte a `translate-x-full` y el elemento se elimina del DOM 360ms después (al terminar la transición).
- **Scroll lock**: bloquea `document.body` mientras el panel está visible; se restaura al completar la animación de salida.
- **Backdrop**: semitransparente, clic lo cierra.
- **Escape**: `HostListener` en `document:keydown.escape` emite `closed`.

## Selector

`ui-drawer` — componente standalone, importar desde el barrel `src/app/shared/ui`.
