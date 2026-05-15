# UiBadgeComponent

Chip de etiqueta para mostrar categorías o géneros. Sigue el patrón Spartan/UI con CVA.

## Uso básico

```html
<ui-badge>Fantasía</ui-badge>
<ui-badge variant="gold">Fantasía</ui-badge>
<ui-badge variant="moss">Poesía</ui-badge>
<ui-badge variant="rust">Drama</ui-badge>
```

## Inputs

| Nombre    | Tipo                                    | Default     | Descripción              |
|-----------|-----------------------------------------|-------------|--------------------------|
| `variant` | `'default' \| 'gold' \| 'moss' \| 'rust'` | `'default'` | Esquema de color del chip |

## Variantes

| Variante  | Color de fondo        | Uso sugerido         |
|-----------|-----------------------|----------------------|
| `default` | `tinta/10`            | Géneros sin categoría |
| `gold`    | `ambar/20`            | Fantasía, aventura    |
| `moss`    | `musgo/15`            | Poesía, lírica        |
| `rust`    | `oxido/15`            | Drama, suspenso       |

## Selector

`ui-badge` — componente standalone, importar desde el barrel `src/app/shared/ui` usando la ruta relativa que corresponda.
