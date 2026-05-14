# TD-10 · Acceso público a los servicios de Cloud Run (`--allow-unauthenticated`)

## Decisión

Los cuatro servicios desplegados en Cloud Run (backend prod, backend QA, frontend prod, frontend QA)
se configuran con acceso no autenticado — cualquier cliente puede hacer requests sin un token de
identidad de Google.

## Justificación

Por defecto, Cloud Run despliega servicios **privados**: solo aceptan requests con un header
`Authorization: Bearer <google-identity-token>`. Esta protección tiene sentido para servicios
internos (microservicios que solo se llaman entre sí), pero no para una API pública.

Atreyu Library es una aplicación de catálogo destinada a usuarios finales y a evaluadores técnicos
que acceden desde sus navegadores o herramientas como Postman. Requerir autenticación de GCP
haría el sistema imposible de usar sin credenciales de la cuenta de GCP.

**Nota de seguridad**: la autenticación de la *aplicación* (login de usuarios, JWT, roles) es
responsabilidad de la capa de negocio, no de la infraestructura de red. Esta decisión está
documentada en la arquitectura como trabajo futuro (Spring Security + JWT). El acceso público
a nivel de Cloud Run no equivale a una API sin control de acceso — significa que Cloud Run
no añade una capa adicional de autenticación de infraestructura que no corresponde a este nivel.

## Impacto

| Escenario | Configuración correcta |
|-----------|----------------------|
| API pública / frontend web | `--allow-unauthenticated` ✅ |
| Microservicio interno (solo lo llama otro servicio) | Sin `--allow-unauthenticated` + service account |
| Admin interno | Sin `--allow-unauthenticated` + IAP (Identity-Aware Proxy) |
