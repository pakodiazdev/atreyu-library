# TD-19 · Rebase and merge como estrategia de merge en PRs

## Decisión

Todos los pull requests se mergean a `main` usando **Rebase and merge**. Las estrategias
"Create a merge commit" y "Squash and merge" están deshabilitadas en la configuración del
repositorio.

## Justificación

**Historial lineal y legible.**
Con la convención de commits `✨ [#NNN] - descripción ✨`, cada commit tiene significado
propio y cuenta una parte de la historia del proyecto. Rebase los preserva todos en `main`
en orden cronológico — `git log --oneline` lee como una narrativa coherente. Un merge commit
añade `Merge pull request #N from feature/...` que no aporta información que no esté ya
en el PR de GitHub.

**Cada commit es reversible de forma quirúrgica.**
Si un bug entra con un commit específico, `git revert <sha>` lo deshace sin afectar los
commits vecinos. Con merge commits, revertir un PR completo requiere revertir el commit de
merge, lo que genera un `Revert "Merge pull request..."` — y si luego se quiere recuperar,
un segundo `Revert of revert`, contaminando el historial con commits sin valor semántico.

**`git bisect` funciona correctamente.**
`git bisect` necesita historia lineal para localizar el commit que introdujo un bug.
Los merge commits crean nodos en el grafo que pueden hacer que bisect evalúe commits
de ramas ya integradas en orden inesperado, complicando el diagnóstico.

**El contexto del PR vive en GitHub, no en el grafo.**
La única ventaja del merge commit es preservar en el grafo "esta rama se mergeó en este
punto exacto". Esa información ya existe en GitHub con todo el contexto: descripción,
commits, comentarios y reviews del PR. Duplicarla en el grafo de git no añade valor.

## Por qué no Squash and merge

Squash and merge colapsa todos los commits de un PR en uno solo. Esto destruye la
granularidad que la convención de commits del proyecto busca preservar deliberadamente.
Un PR con cinco commits significativos — cada uno trazable a una actividad concreta —
se convierte en un único commit cuyo mensaje no puede capturar todas las intenciones.
Además, elimina la capacidad de hacer `git bisect` dentro del trabajo de un PR.

## Configuración del repositorio

En **Settings → General → Pull Requests**, dejar activo únicamente:

- ✅ Allow rebase merging
- ☐ Allow merge commits
- ☐ Allow squash merging
