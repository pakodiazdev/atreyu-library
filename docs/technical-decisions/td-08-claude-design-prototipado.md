# TD-08 · Claude Design como herramienta de prototipado

## Decisión

Los wireframes interactivos de la UI (`docs/prototyping/wireframes.html`) se generan
con **Claude Design**, dentro del mismo esquema de AI-assisted development que el
proyecto adopta para codificación (Claude Code, GitHub Copilot) y revisión (Devin).
Cada capa del flujo tiene un agente especializado; Claude Design es el responsable
de la capa de diseño y prototipado.

## Justificación

- Produce prototipos funcionales en HTML/CSS/JS en un único archivo autocontenido,
  sin dependencias externas ni herramientas de diseño adicionales
- El archivo `.html` se visualiza directamente en el navegador y se versiona en el
  repositorio sin builds ni bundlers
- El formato es legible, editable y previsualizable dentro del mismo entorno de
  desarrollo, sin licencias ni acceso a servicios de terceros
