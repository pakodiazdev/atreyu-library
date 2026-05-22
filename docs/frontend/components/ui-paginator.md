# UiPaginatorComponent

Paginador de tabla estilo Spartan/UI. Muestra selector de tamaño de página, ventana de navegación de páginas con ellipsis y resumen "X–Y de Z".

## Uso básico

```html
<ui-paginator
  [page]="store.page()"
  [size]="store.size()"
  [totalElements]="store.totalElements()"
  [totalPages]="store.totalPages()"
  [hasNext]="store.hasNext()"
  [hasPrevious]="store.hasPrevious()"
  (pageChange)="store.setPage($event)"
  (sizeChange)="store.setSize($event)" />
```

## Inputs

| Nombre          | Tipo      | Requerido | Descripción                              |
|-----------------|-----------|-----------|------------------------------------------|
| `page`          | `number`  | ✅        | Página actual (base 0)                   |
| `size`          | `number`  | ✅        | Elementos por página                     |
| `totalElements` | `number`  | ✅        | Total de registros en el backend         |
| `totalPages`    | `number`  | ✅        | Total de páginas                         |
| `hasNext`       | `boolean` | ✅        | Si existe página siguiente               |
| `hasPrevious`   | `boolean` | ✅        | Si existe página anterior                |

## Outputs

| Nombre       | Tipo     | Descripción                                   |
|--------------|----------|-----------------------------------------------|
| `pageChange` | `number` | Emite el índice de página (base 0) solicitado |
| `sizeChange` | `number` | Emite el nuevo tamaño de página seleccionado  |

## Comportamiento

- **Selector de tamaño**: botones para `10 / 20 / 50 / 100` filas por página; el activo se muestra con variante `secondary`.
- **Ventana de páginas**: muestra hasta 8 botones numerados con ellipsis (`…`) cuando hay más de 8 páginas. La página activa se resalta con `secondary` y recibe `aria-current="page"`.
- **Clamp interno**: si `page` llega fuera de rango (> `totalPages - 1`), los cálculos de rango y el highlight se basan en el valor clampeado, evitando resúmenes imposibles.
- **Resumen**: muestra `inicio–fin de total` solo cuando `totalElements > 0`.
- **Navegación rápida**: botones `«` / `»` saltan a primera/última página; `‹` / `›` avanzan una página; se deshabilitan según `hasPrevious`/`hasNext`.

## Constantes exportadas

```typescript
export const PAGE_SIZES = [10, 20, 50, 100] as const;
```

## Selector

`ui-paginator` — componente standalone. Importar desde el barrel `src/app/shared/ui`.
