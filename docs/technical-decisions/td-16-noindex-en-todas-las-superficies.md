# TD-16 · Ninguna superficie del proyecto se expone a indexación por buscadores

## Decisión

Tanto el frontend (producción y QA) como el backend API responden con la cabecera
`X-Robots-Tag: noindex, nofollow` en todas sus rutas. Adicionalmente, el frontend
sirve un `robots.txt` con `Disallow: /`. El entorno QA añade una capa de
**HTTP Basic Auth** sobre nginx para restringir el acceso a personas autorizadas.

## Implementación por superficie

| Superficie | Mecanismo | Alcance |
|---|---|---|
| Frontend QA | `nginx-qa.conf`: `X-Robots-Tag` + `robots.txt` + `auth_basic` | Todas las rutas |
| Frontend producción | `nginx.conf`: `X-Robots-Tag` + `robots.txt` | Todas las rutas |
| Backend API (todos los ambientes) | `NoIndexFilter` (`@ConditionalOnProperty`) activado en `application.properties` | Todas las respuestas HTTP |

## Justificación

**Por qué no indexar ninguna superficie:**

Atreyu Library es una **prueba técnica**, no un producto destinado al público general.
Que las URLs aparezcan en resultados de búsqueda no aporta valor al proyecto y
genera ruido — un evaluador externo podría confundir una URL de QA con producción,
o encontrar el demo en un estado parcial durante el desarrollo.

El backend es una **API REST** — sus endpoints devuelven JSON y no tienen sentido
semántico para un motor de búsqueda. Indexarlos no aportaría valor y podría exponer
la estructura interna de la API a scrapers.

**Por qué Basic Auth en QA y no en producción:**

El ambiente de QA es una ventana de pre-producción donde los cambios se validan antes
de llegar a los usuarios. Limitar el acceso garantiza que:

- Solo el equipo de desarrollo y los revisores designados acceden a estados intermedios del producto
- Los datos de prueba (seeder) no se confunden con datos reales de producción
- El ambiente puede estar en un estado intencionalmente incompleto sin que eso sea visible externamente

En producción no se aplica Basic Auth porque el objetivo es que el producto sea
accesible (aunque no indexado): evaluadores técnicos y stakeholders deben poder
acceder sin fricción adicional.

**Por qué `NoIndexFilter` activo por defecto en el backend:**

Una API REST nunca debe indexarse, independientemente del ambiente. El filtro se
activa en `application.properties` (base) para que aplique en dev, QA y producción
sin necesidad de configurarlo por perfil. Si en el futuro el proyecto evoluciona hacia
un backend con endpoints renderizados para buscadores (SEO server-side), este default
puede sobreescribirse por perfil.

## Nota sobre las credenciales de QA en el README

Las credenciales del ambiente QA (`qa` / `preview`) están documentadas intencionalmente
en el `README.md` para facilitar la verificación del demo por parte del evaluador.
En un proyecto productivo, las credenciales de acceso a entornos restringidos se
gestionarían a través de un gestor de secretos (1Password, HashiCorp Vault, etc.)
