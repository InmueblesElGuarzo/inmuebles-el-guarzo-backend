# Auditoría de seguridad — Inmuebles El Guarzo backend

**Fecha:** 2026-09-06
**Alcance:** API Gateway (Kong), backend NestJS, configuración de despliegue, manejo de datos personales.
**Método:** revisión estática de código y configuración. No se ejecutaron pruebas dinámicas (DAST) ni se validó la configuración real de Render/Cloudflare/Doppler — los puntos que dependen de eso están marcados como **(verificar en infraestructura)**.
**Última revisión contra el código:** 2026-10-02 (rama `develop` en `27e632b` + corrección de H-01 punto 2, H-02 y H-03). Estados, referencias de línea y fragmentos citados reflejan el código a esa fecha. Los informes de [zap-reports/](../zap-reports/) (mayo 2026) escanean el frontend (`www.inmuebleselguarzo.com`), no el backend, y no sirven como evidencia de ningún hallazgo de este documento.

---

## 1. Resumen ejecutivo

| #    | Hallazgo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Severidad                            | Área                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------- |
| H-01 | El backend puede ser accesible directamente sin pasar por Kong; la única defensa es un secreto estático compartido. **Verificado y mitigado:** el backend tiene URL pública en Render, pero `KongGatewayGuard` rechaza con 403 todo acceso que no llegue por Kong (salvo `/api/v1/health`); riesgo residual si se filtra `KONG_SECRET`. **Punto 2 resuelto:** Kong exige el header `X-Origin-Verify` que inyecta Cloudflare (`key-auth`), así que la URL de Kong en Render ya no sirve para saltarse Cloudflare | **Medio (residual)** — antes Crítico | Gateway / red          |
| H-02 | El rate limiting de Kong no identifica al cliente real (IP detrás de Cloudflare + Render) → o es inefectivo o causa auto-DoS. **Resuelto:** `limit_by: header` con `CF-Connecting-IP`, sin depender de la cadena de proxies                                                                                                                                                                                                                                                                                     | **Alto**                             | Rate limiting          |
| H-03 | No hay límite específico para el formulario público de captación; 60 req/min es demasiado permisivo para ese endpoint. **Resuelto:** ruta dedicada para `POST /api/v1/publications` con 5/min y 30/h por cliente                                                                                                                                                                                                                                                                                                | **Alto**                             | Rate limiting          |
| H-04 | Verificación de Turnstile "fail-open": si falta la clave, `verify()` devuelve `true`. **Parcialmente resuelto:** ya falla cerrado; pendiente `remoteip` y validar `hostname`/`action`                                                                                                                                                                                                                                                                                                                           | **Alto**                             | Anti-bot               |
| H-05 | Swagger UI (`/api/docs`, `/api/docs-json`) expuesto sin autenticación y sin pasar por los guards. **Resuelto:** no se registra cuando `NODE_ENV` es `production`                                                                                                                                                                                                                                                                                                                                                | **Medio**                            | Exposición             |
| H-06 | `KongGatewayGuard`: comparación de secreto no constante en tiempo + `/health` exento sin throttle. **Resuelto:** comparación con `timingSafeEqual` y header normalizado; `/health` sigue exento por diseño (ver H-01)                                                                                                                                                                                                                                                                                           | **Medio**                            | Gateway                |
| H-07 | CORS: `origin.endsWith('.vercel.app')` + `credentials: true` permite llamar a la API desde cualquier subdominio `*.vercel.app`. **Parcialmente resuelto (PR #87):** patrón anclado al proyecto y team de Vercel; pendiente decidir `!origin`                                                                                                                                                                                                                                                                    | **Medio**                            | CORS                   |
| H-08 | XSS almacenado latente: `ownerFullName` y `proposedLocation` no se sanitizan; plantillas de email con `escapeValue: false`                                                                                                                                                                                                                                                                                                                                                                                      | **Medio**                            | XSS                    |
| H-09 | `entrypoint.sh` inyecta `KONG_SECRET` con `sed` sin escapar → rompe o corrompe la config si el secreto tiene `/ & \n`                                                                                                                                                                                                                                                                                                                                                                                           | **Medio**                            | Gateway / build        |
| H-10 | Fuga de detalle interno en respuestas de error (nombres de columnas de BD en `P2002`; motivo interno de rechazo del JWT en `IAM.INVALID_AUTH_TOKEN`)                                                                                                                                                                                                                                                                                                                                                            | **Bajo**                             | Info disclosure        |
| H-11 | Sin `trust proxy` en Express → `req.ip` guarda la IP del proxy, no la del cliente (afecta trazabilidad Ley 1581 y cualquier rate limit por IP)                                                                                                                                                                                                                                                                                                                                                                  | **Bajo-Medio**                       | Trazabilidad           |
| H-12 | Helmet sin configurar (CSP por defecto, sin `Cross-Origin-Resource-Policy` explícito, headers de versión de Kong visibles)                                                                                                                                                                                                                                                                                                                                                                                      | **Bajo**                             | Headers                |
| H-13 | Rate limiting a nivel de aplicación inexistente pese a estar listado como restricción de seguridad (README §3.6) y tener Redis conectado                                                                                                                                                                                                                                                                                                                                                                        | **Medio**                            | Defensa en profundidad |
| H-14 | Condiciones de carrera: dedup por hash (TOCTOU) y `nextReferenceNumber` (count+1) permiten duplicados bajo concurrencia                                                                                                                                                                                                                                                                                                                                                                                         | **Bajo**                             | Integridad             |
| H-15 | CI sin escaneo de dependencias (`pnpm audit` / Dependabot) y acción de Sonar clavada a `@master`                                                                                                                                                                                                                                                                                                                                                                                                                | **Bajo**                             | Supply chain           |
| H-16 | El `notification_outbox` (patrón outbox transaccional) existe en el esquema pero no se usa: las notificaciones se disparan fuera de transacción y se pierden si el proceso cae                                                                                                                                                                                                                                                                                                                                  | **Bajo**                             | Fiabilidad             |

---

## 2. Parte A — Kong / API Gateway

Archivos revisados: [kong/kong.yml](../kong/kong.yml), [kong/Dockerfile](../kong/Dockerfile), [kong/entrypoint.sh](../kong/entrypoint.sh), [kong/kong.local.yml](../kong/kong.local.yml) + [kong/Dockerfile.local](../kong/Dockerfile.local) (entorno local; desde la corrección de H-01 punto 2, H-02 y H-03 ya **no** replican la config de producción: no tienen `key-auth`, ni la ruta de health, ni los límites nuevos), [src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts).

### A.1 ¿Está _todo_ pasando por Kong? (H-01)

**Arquitectura declarada:** Cliente → Cloudflare (WAF/CDN) → Kong (servicio en Render) → Backend (servicio en Render).

**Arquitectura real según el código (2026-09-28):** Kong ya no llega al backend por la red privada de Render. Desde el PR #81 (`fdbd6a0`) el upstream de [kong.yml:6](../kong/kong.yml#L6) es la **URL pública** `https://inmuebles-el-guarzo-backend-a1zk.onrender.com`; antes era la interna `http://inmuebles-el-guarzo-backend-7wli:10000`. El backend es, por tanto, alcanzable desde Internet, y el tramo Kong → backend viaja por Internet protegido por TLS.

**Estado de H-01: verificado y mitigado a nivel de aplicación.** Se verificó que el backend no se puede usar sin pasar antes por Kong: una petición directa a la URL de Render sin el `X-Kong-Secret` correcto recibe 403. Lo que lo garantiza en el código:

- `KongGatewayGuard` está registrado como `APP_GUARD` global y **es el primer guard** ([app.module.ts:37-40](../src/app.module.ts#L37-L40)), antes del `JwtAuthGuard`, así que corre en **todas** las rutas de controladores, incluidas las `@Public()`.
- Falla cerrado ([kong-gateway.guard.ts:39-47](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts#L39-L47)): header ausente, vacío, duplicado (`string[]`) o distinto de `KONG_SECRET` → `ForbiddenException` (403). La comparación es en tiempo constante (H-06, resuelto).
- `KONG_SECRET` es obligatorio (`@IsString() @IsNotEmpty()` en [env.schema.ts:114-116](../src/shared-kernel/infrastructure/config/env.schema.ts#L114-L116)): la app no arranca sin él, así que no existe un modo "sin secreto".
- Kong añade ese header a todo lo que proxya (`request-transformer`, [kong.yml:37-41](../kong/kong.yml#L37-L41)).
- El secreto no llega a los logs: el serializer de `pino-http` solo registra `id`, `method` y `url` de la petición, sin headers ([pino-logger.config.ts:73-78](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L73-L78)).
- Cubierto por [kong-gateway.guard.spec.ts](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.spec.ts).

**Riesgo residual (por qué queda en Medio y no se cierra):**

1. **El guard es la _única_ barrera.** Como el backend tiene URL pública, cualquiera que descubra o filtre `KONG_SECRET` (un error, un dump de entorno vía otra vuln, el historial de git, un screenshot, Doppler) entra directo al backend **saltándose Kong por completo**: sin rate limiting, sin WAF, sin correlación de logs.
   → **Acción recomendada (no bloqueante):** volver a un **Render Private Service** (solo alcanzable desde la red privada de Render) o quitar el dominio público del backend. Con eso `X-Kong-Secret` pasa de ser "la seguridad" a ser "defensa en profundidad". Mientras tanto, definir la rotación de `KONG_SECRET` (A.4).

2. **Kong en Render también debe aceptar tráfico solo desde Cloudflare — resuelto.**

   **Hallazgo original.** Kong aceptaba cualquier petición que le llegara, así que un atacante podía llamar directo a la URL de Kong en Render y saltarse el WAF de Cloudflare. La recomendación era **Cloudflare Authenticated Origin Pull** o una allowlist de rangos IP de Cloudflare.

   **Por qué se descartó esa recomendación.** Render termina el TLS en su borde y entrega HTTP plano al contenedor, así que Kong nunca ve un certificado de cliente (Authenticated Origin Pull es imposible). La cadena de proxies Render → Kong no está auditada, así que tampoco se confía en `KONG_TRUSTED_IPS`/`KONG_REAL_IP_HEADER` ni en rangos IP para nada.

   **Resuelto.** [kong.yml](../kong/kong.yml) y [entrypoint.sh](../kong/entrypoint.sh):
   - Una Transform Rule de Cloudflare añade el header `X-Origin-Verify` con un valor secreto a todo el tráfico hacia `api.inmuebleselguarzo.com.co`. El valor vive en Doppler (`ORIGIN_VERIFY_SECRET`, sincronizado al servicio de Kong).
   - El servicio principal de Kong tiene `key-auth` ([kong.yml:29-36](../kong/kong.yml#L29-L36)) con `key_names: [X-Origin-Verify]`, `key_in_header: true` y `key_in_query`/`key_in_body: false`: el secreto solo se acepta en el header. Una petición sin el header, con un valor incorrecto o con el header duplicado recibe **401** y nunca llega al backend.
   - `hide_credentials: true`: Kong borra `X-Origin-Verify` antes de proxyar, así que el secreto de origen no sale de Kong.
   - El valor se declara como la credencial del consumer `cloudflare-edge` ([kong.yml:72-75](../kong/kong.yml#L72-L75)) y se inyecta en el arranque con el mismo `sed` que `KONG_SECRET` (hereda la limitación de H-09; el valor es base64url, sin caracteres problemáticos). En `key-auth` el campo `key` es `auto = true`: si quedara vacío, Kong generaría una llave aleatoria y rechazaría todo en silencio. Por eso `entrypoint.sh` aborta el arranque si el placeholder está en la config y `ORIGIN_VERIFY_SECRET` no está definido.
   - `key-auth` (prioridad 1250) corre antes que `rate-limiting` (910): el tráfico rechazado no gasta cupo de rate limiting.
   - **Health check de Render.** Render llama `GET /api/v1/health` directo a Kong, sin pasar por Cloudflare y por tanto sin `X-Origin-Verify`. Lo atiende una ruta sin servicio ([kong.yml:58-70](../kong/kong.yml#L58-L70)), anclada a `~/api/v1/health$` y solo `GET`, con `request-termination`: Kong responde `200 {"status":"ok"}` él mismo, sin llamar al backend. Al estar fuera del servicio principal no hereda `key-auth`, `rate-limiting` ni `request-transformer`. Sin rate limit a propósito: Render llama sin `CF-Connecting-IP`, así que un límite caería en el bucket de la IP del balanceador de Render, que un atacante también puede agotar para provocar reinicios. El health de Kong mide solo a Kong: una caída del backend (que tiene su propio health check en su servicio de Render) ya no reinicia Kong en bucle. Cualquier variante (`/api/v1/health/`, mayúsculas, `HEAD`, `POST`) cae en la ruta general y exige el header.
   - Verificado en local con la imagen de [kong/Dockerfile](../kong/Dockerfile) (Kong 3.9.3) contra un upstream _echo_: `kong config parse` correcto; 401 sin header, con valor incorrecto, duplicado o en query/body; 200 con el header y el upstream sin recibirlo; 10 peticiones rechazadas no consumen cupo; health 200 sin header, sin cabeceras de rate limit, 100 veces seguidas y sin ninguna petición al upstream.

   **Riesgo residual.** Es defensa en profundidad, no prueba criptográfica: quien descubra el valor de `X-Origin-Verify` puede volver a llamar directo a Kong (y además falsificar `CF-Connecting-IP` para rotar de bucket de rate limiting). Sube el costo del ataque sin depender de IPs. Necesita su propio procedimiento de rotación (Cloudflare + Doppler + redeploy de Kong), igual que `KONG_SECRET` (A.4).

3. **`/api/v1/health` está exento del secreto** ([kong-gateway.guard.ts:34-37](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts#L34-L37)) para el health check de Render. Con el backend público este endpoint **sí** es alcanzable directamente: responde `200 {status, timestamp}` sin throttle y no queda en los logs (`autoLogging.ignore`, [pino-logger.config.ts:49](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L49)). No expone datos, pero es un oráculo de reconocimiento. Impacto bajo; deja de importar con el backend privado.

4. **Lo que responde antes de los guards.** Los guards de NestJS solo corren sobre rutas de controladores. Sin el secreto, el backend público también responde a: middleware de Express (`helmet`, la respuesta de CORS a un preflight `OPTIONS`) y el 404 de rutas inexistentes. Ninguno expone datos de negocio.
   - **Swagger (`/api/docs`)** también es middleware (ver H-05). **Resuelto:** en producción no se registra, así que la ruta no existe. El [Dockerfile](../Dockerfile#L27) de producción fija `NODE_ENV=production`; **(verificar en infraestructura)** que Render/Doppler no lo sobrescriba. Fuera de producción sigue accesible sin token.

5. **`request-transformer` con `config.add` NO sobrescribe un header que el cliente ya mandó.** Si un cliente envía `X-Kong-Secret: loquesea`, Kong reenvía **el valor del cliente**, no el suyo. No es un bypass (el backend igual lo rechaza), pero:
   - un cliente legítimo con una extensión de navegador que inyecte ese header recibiría 403 incluso pasando por Kong;
   - Kong debería **eliminar** cualquier `X-Kong-Secret` entrante y **luego** añadir el suyo.
     → **Acción:** añadir `config.remove.headers: ["X-Kong-Secret"]` junto al `add` (Kong aplica `remove` antes que `add`).

### A.2 Rate limiting — análisis detallado (H-02, H-03) — resuelto

**Hallazgo original.** Configuración antes de la corrección (sigue así en [kong.local.yml](../kong/kong.local.yml#L18-L29), que no se tocó):

```yaml
- name: rate-limiting
  config:
    minute: 60
    hour: 1000
    policy: local
    redis: { host: localhost, port: 6379, ... } # ← ignorado con policy: local
```

1. **`policy: local` + config `redis` muerta.** Con `policy: local` el bloque `redis` no se usaba para nada; apuntaba a `localhost:6379`, que no existe en el contenedor de Kong. Con `local`, los contadores viven en memoria **por worker de Nginx**. Hoy `KONG_NGINX_WORKER_PROCESSES=1` ([Dockerfile:14](../kong/Dockerfile#L14)) y presumiblemente 1 instancia en Render, así que "funciona" — pero si Render reinicia o escala Kong, los contadores se resetean/no se comparten. Para rate limiting distribuido de verdad haría falta `policy: redis` con un Redis TCP real (**Upstash Redis REST NO sirve para Kong** — Kong habla protocolo RESP/TCP, no REST).

2. **Nadie identifica al cliente real (H-02).** El plugin no fijaba `limit_by`, así que usaba el default (`consumer` → sin consumers configurados → **fallback a `ip`**). Pero la "IP" que ve Kong es `remote_addr`, que detrás de Cloudflare **y** del balanceador de Render es una IP de infraestructura, no la del usuario. Resultado probable:
   - **todos los usuarios comparten un mismo bucket** → un solo abusador (o tráfico orgánico en hora pico) agota los 60/min **para todos** = auto-DoS; o
   - la IP varía de forma no controlada y el límite es inefectivo.

3. **Límite único y global (H-03).** El plugin estaba en el `service`, con una sola ruta `all-routes` (`paths: [/]`). `minute: 60` aplicaba a **toda** la API combinada, sin límite estricto para el endpoint sensible `POST /api/v1/publications` (formulario público de captación). Turnstile es la barrera real; ya falla cerrado (H-04), pero no está atada a `action`/`hostname`.

**Resuelto.** [kong.yml](../kong/kong.yml):

- **H-02:** los dos `rate-limiting` usan `limit_by: header` con `header_name: CF-Connecting-IP` ([kong.yml:42-48](../kong/kong.yml#L42-L48), [kong.yml:17-23](../kong/kong.yml#L17-L23)), el header con el que Cloudflare entrega la IP real del cliente. No se usa `limit_by: ip` ni `KONG_TRUSTED_IPS`/`KONG_REAL_IP_HEADER`: la cadena de proxies Render → Kong no está auditada (ver A.1 punto 2). Cambiar `limit_by` era obligatorio en el mismo cambio que `key-auth`: con el default `consumer`, todo el tráfico autenticado como el único consumer `cloudflare-edge` habría compartido un solo bucket de 60/min. Si falta `CF-Connecting-IP`, Kong usa `kong.client.get_forwarded_ip()` (la IP del balanceador de Render); solo le pasa a quien ya superó `key-auth` sin ese header.
- **H-03:** ruta dedicada `public-publication-submit` ([kong.yml:10-23](../kong/kong.yml#L10-L23)) con `methods: [POST]` y su propio `rate-limiting` de **5/min y 30/h** por cliente. El path es la regex anclada `~/(?i)api/v1/publications/?$`, no un prefijo: un prefijo habría capturado también `POST :id/approve`, `:id/start-review` y `:id/reject` de los admins, y Express (sin distinguir mayúsculas ni barra final) habría aceptado `POST /api/v1/PUBLICATIONS` o `/api/v1/publications/` por la ruta general, saltándose el límite. Un plugin en la ruta **reemplaza** al del servicio con el mismo nombre, así que ese endpoint cuenta solo contra su bucket. `key-auth`, `request-transformer` y `correlation-id` siguen aplicando porque viven en el servicio. El `GET` de listado de admins sigue en la ruta general (60/min, 1000/h). 30/h deja margen para el CGNAT de los operadores móviles, donde muchos usuarios comparten IP pública; los 4xx (validación, Turnstile) también cuentan.
- **Bloque `redis` muerto eliminado.** `policy: local` se mantiene; el resto del punto 1 (contadores por instancia) sigue vigente.
- Verificado en local (Kong 3.9.3, upstream _echo_): `GET /api/v1/publications` → límite 60; `POST /api/v1/publications`, `/publications/`, `/API/V1/PUBLICATIONS` y `?x=1` → límite 5, y la 6.ª petición recibe **429**; `POST …/approve`, `…/start-review`, `…/reject` y `/publicationsX` → límite 60; otra `CF-Connecting-IP` tiene su propio bucket.

**Riesgo residual.** Quien conozca el valor de `X-Origin-Verify` puede llamar directo a Kong falsificando `CF-Connecting-IP` y rotar de bucket (ver A.1 punto 2). A través de Cloudflare no debería ser posible, porque es Cloudflare quien pone `CF-Connecting-IP` con la IP del cliente; la documentación de Cloudflare no dice explícitamente qué hace con un `CF-Connecting-IP` enviado por el propio cliente. **(verificar en infraestructura)**: mandar `curl -H 'CF-Connecting-IP: 1.2.3.4'` a `api.inmuebleselguarzo.com.co` y confirmar que el bucket no cambia (cabecera `X-RateLimit-Remaining-Minute`). Cloudflare (plan Free) permite **1 regla de rate limiting** — sigue siendo útil como primer filtro grueso para `/api/v1/publications`, por delante del límite fino de Kong.

### A.3 Otras funciones del gateway

| Función                                             | Estado             | Comentario                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enrutamiento                                        | ✅ OK              | Tres rutas, todas con `strip_path: false` para pasar el path completo: `public-publication-submit` (solo `POST` y regex anclada a `/api/v1/publications`, límite estricto, H-03), `all-routes` (`/`, el resto) y `render-health-check` (fuera del servicio, solo `GET /api/v1/health`, responde Kong sin proxyar; A.1 punto 2). |
| Inyección de identidad de gateway (`X-Kong-Secret`) | ⚠️                 | Funciona pero no elimina el header entrante del cliente (A.1 punto 5).                                                                                                                                                                                                                                                          |
| Validación de tokens JWT                            | ❌ No en Kong      | La hace el backend (`JwtAuthGuard` + `SupabaseAuthAdapter`). El README dice que el gateway "valida tokens"; en la práctica no. **Está bien** que la haga el backend (necesita consultar el rol en BD), pero conviene documentarlo para no asumir una defensa que no existe.                                                     |
| `correlation-id`                                    | ✅ OK              | `X-Correlation-ID` UUID, `echo_downstream: true`, y el backend lo usa como id de request y lo propaga a los logs ([pino-logger.config.ts:52-62](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L52-L62)). Bien hecho.                                                                                         |
| Manejo centralizado de errores                      | ❌ No en Kong      | Lo hace el backend (filtros). Ver H-10.                                                                                                                                                                                                                                                                                         |
| Bloqueo tras 5 intentos de login                    | ❌ No implementado | README SEG-C01-E03. Login lo maneja Supabase Auth (fuera de este repo); verificar que Supabase tenga configurado el rate limit de auth.                                                                                                                                                                                         |
| Tamaño máximo de request                            | ❌                 | Sin plugin `request-size-limiting`. Express corta en ~100 kB por defecto, lo cual ayuda, pero conviene un límite explícito en Kong (p. ej. `request-size-limiting` a 256 kB).                                                                                                                                                   |
| Ocultar versión / tecnología                        | ❌                 | Ver H-12: Kong añade `Via: kong/3.9`, `Server: kong/3.9`, y hay un `response-transformer` que **añade** `X-Powered-By: Kong-Gateway` ([kong.yml:77-82](../kong/kong.yml#L77-L82)) — eso es revelar tecnología a propósito. Quitarlo y poner `KONG_HEADERS=off`.                                                                 |

### A.4 Hardening de `kong.yml` / Dockerfile / entrypoint

- **H-09 — `entrypoint.sh` (`sed`):**

  ```sh
  sed -i "s/KONG_SECRET_PLACEHOLDER/${KONG_SECRET}/g" /etc/kong/kong.yml
  ```

  El mismo `entrypoint.sh` lo usa el entorno local ([Dockerfile.local](../kong/Dockerfile.local#L5)). Si `KONG_SECRET` contiene `/`, `&` o saltos de línea (Doppler genera secretos con cualquier carácter base64/hex, y `/` es común en base64), el `sed` produce una config corrupta o el contenedor no arranca. **Solución preferida:** eliminar el `sed` y usar interpolación nativa de Kong 3.x en `kong.yml`:

  ```yaml
  plugins:
    - name: request-transformer
      config:
        remove:
          headers: ['X-Kong-Secret']
        add:
          headers:
            - X-Kong-Secret:${{ env "KONG_SECRET" }}
  ```

  Y en el Dockerfile: `ENV KONG_DECLARATIVE_CONFIG=/etc/kong/kong.yml` ya está; añadir que Kong debe tener habilitado el rendering de vars (por defecto lo está en modo DB-less). Con esto el `entrypoint.sh` se reduce a `exec /docker-entrypoint.sh kong docker-start`.

- **Puerto:** el Dockerfile fija `KONG_PROXY_LISTEN=0.0.0.0:8000` ([Dockerfile:16](../kong/Dockerfile#L16)). Render normalmente inyecta `PORT` (10000). **(verificar)** que el servicio de Kong en Render esté configurado para exponer el puerto 8000, o parametrizar `KONG_PROXY_LISTEN=0.0.0.0:${PORT:-8000}`.
- **`KONG_ADMIN_LISTEN=off`** ✅ correcto, la Admin API está deshabilitada.
- **Añadir plugins recomendados:** `request-size-limiting`, y opcionalmente `bot-detection`. `ip-restriction` (allowlist de Cloudflare) se descartó: el origen se verifica con `X-Origin-Verify` + `key-auth` (A.1 punto 2).
- **Rotación de `KONG_SECRET`:** hoy es estático e indefinido, y con el backend público (H-01) es la única barrera frente al acceso directo. Definir un procedimiento de rotación (cambiar en Doppler → redeploy de Kong y backend). Considerar 2 secretos válidos simultáneamente durante la ventana de rotación. Lo mismo aplica a `ORIGIN_VERIFY_SECRET` (A.1 punto 2), con un paso más: la Transform Rule de Cloudflare y la credencial de Kong deben cambiar juntas, o Kong rechaza todo el tráfico durante la ventana; `key-auth` admite varias credenciales en el consumer `cloudflare-edge`, así que se puede declarar la nueva antes de cambiar Cloudflare y quitar la vieja después.

---

## 3. Parte B — Vulnerabilidades en el backend

### H-04 — Turnstile "fail-open" (Alto) — parcialmente resuelto

**Hallazgo original.** Si faltaba `TURNSTILE_SECRET_KEY`, `verify()` logueaba un warning y devolvía `true`, aceptando cualquier token:

```ts
if (!this.secretKey) {
  this.logger.warn('TURNSTILE_SECRET_KEY no configurada; verificación omitida.');
  return true; // ← acepta cualquier token
}
```

La rama era inalcanzable porque `TURNSTILE_SECRET_KEY` es `@IsNotEmpty()` en `EnvSchema` y la app no arranca sin ella, pero el diseño "en caso de duda, dejar pasar" era peligroso: un cambio del esquema o un error de configuración desactivaba en silencio el anti-bot del formulario público.

**Resuelto (PR #85).** El adapter falla cerrado, sin bypass en ningún entorno ([turnstile-captcha-verifier.adapter.ts:26-38](../src/modules/publications/infrastructure/captcha/turnstile-captcha-verifier.adapter.ts#L26-L38)):

- Si la clave falta, está vacía o solo tiene espacios, el constructor lanza un `Error` y la app no arranca (fail fast). En desarrollo se usa la clave de Doppler dev.
- Se eliminó la rama que devolvía `true`; `secretKey` se tipa como `string`.
- Si la llamada a Cloudflare falla, `verify()` devuelve `false` y loguea el error.
- Cubierto por tests unitarios ([turnstile-captcha-verifier.adapter.spec.ts](../src/modules/publications/infrastructure/captcha/turnstile-captcha-verifier.adapter.spec.ts)) con `fetch` mockeado.

**Pendiente.** No se envía `remoteip` ni se validan los campos `hostname` / `action` de la respuesta de Cloudflare ([turnstile-captcha-verifier.adapter.ts:40-58](../src/modules/publications/infrastructure/captcha/turnstile-captcha-verifier.adapter.ts#L40-L58)). Un token válido obtenido en otro sitio del mismo dominio se puede reutilizar. Estos puntos dependen de la IP real del cliente (H-11) y del frontend, y se abordarán después:

- Añadir `remoteip` (la IP real del cliente) al cuerpo de `siteverify`.
- Validar `data.hostname` contra el dominio esperado y `data.action` contra un valor fijo (`'publication_submit'`) que el frontend setea en el widget.
- Validar el timestamp (`challenge_ts`) para rechazar tokens viejos.
- Devolver `data.success === true` en lugar de `data.success`: si Cloudflare responde un JSON sin `success`, hoy se devuelve `undefined`. El interactor lo rechaza igual por ser falsy, pero el tipo `boolean` no es fiel.
- Comprobar `response.ok` antes de confiar en el cuerpo de la respuesta.
- Timeout en la llamada a `siteverify`.

### H-05 — Swagger expuesto en producción (Medio) — resuelto

**Hallazgo original.** `main.ts` ejecutaba `SwaggerModule.setup('api/docs', ...)` siempre. `/api/docs` y `/api/docs-json` son middleware de Express → **no pasan por `KongGatewayGuard` ni `JwtAuthGuard`**. A través de Kong quedaban rate-limitados pero eran públicos: exponían el esquema completo de la API (todos los endpoints, DTOs, ejemplos).

**Resuelto (PR #83).** El registro de la documentación se extrajo a [swagger.setup.ts](../src/shared-kernel/presentation/http/swagger.setup.ts), que retorna sin registrar nada cuando `NODE_ENV` es `production` ([swagger.setup.ts:18-21](../src/shared-kernel/presentation/http/swagger.setup.ts#L18-L21)). [main.ts:61](../src/main.ts#L61) lo invoca con el `NODE_ENV` validado por `EnvSchema`, y la imagen de producción fija `ENV NODE_ENV=production` ([Dockerfile:27](../Dockerfile#L27)). Cubierto por [swagger.setup.spec.ts](../src/shared-kernel/presentation/http/swagger.setup.spec.ts).

**Nota.** En `development` y `test` Swagger sigue accesible sin autenticación. Es aceptable mientras esos entornos no estén expuestos públicamente; si alguno lo estuviera, protegerlo con basic-auth o con el secreto de Kong.

### H-06 — `KongGatewayGuard`: comparación no constante (Medio) — resuelto

**Hallazgo original.** El guard comparaba `secret !== this.kongSecret`, una comparación de strings que corta en el primer byte distinto → **timing attack** teórico para recuperar el secreto byte a byte. Sobre la red el ruido lo hace poco práctico, pero con el backend público (H-01) cualquiera puede medir tiempos directamente contra él. Además, `request.headers['x-kong-secret']` puede ser `string | string[]`: con dos headers `X-Kong-Secret` el tipo era `string[]` y el rechazo dependía de un efecto colateral del tipo (`!==` contra un array siempre da `true`), no de una regla explícita.

**Resuelto.** [kong-gateway.guard.ts](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts):

- El header se normaliza de forma explícita ([kong-gateway.guard.ts:39-47](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts#L39-L47)): si no es `string` (ausente o `string[]`) o está vacío, se lanza `ForbiddenException` sin comparar.
- La comparación usa `crypto.timingSafeEqual` en un método privado `safeEqual` ([kong-gateway.guard.ts:52-62](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts#L52-L62)). Compara `byteLength` antes (no `length` de caracteres, que difiere de los bytes con entrada no ASCII) porque `timingSafeEqual` lanza con buffers de distinto tamaño. Esto revela la longitud del secreto, lo cual es aceptable y estándar; ocultarla exigiría comparar HMACs.
- `/api/v1/health` sigue exento sin comparar el secreto (por diseño, ver A.1 punto 3).
- `KONG_SECRET` en `EnvSchema` y la inyección del header en Kong no cambian.
- Cubierto por [kong-gateway.guard.spec.ts](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.spec.ts): secreto correcto, incorrecto de igual longitud, de distinta longitud (sin llamar a `timingSafeEqual`), header ausente, vacío, duplicado, y `/health` sin comparar.

### H-07 — CORS demasiado permisivo (Medio) — parcialmente resuelto

**Hallazgo original.** `main.ts` aceptaba, además de la lista de `CORS_ALLOWED_ORIGINS`, cualquier origen que terminara en `.vercel.app`:

```ts
if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
  callback(null, true);
}
...
credentials: true,
```

- `origin.endsWith('.vercel.app')`: **cualquiera** con una cuenta gratis de Vercel puede desplegar `atacante.vercel.app` y hacer peticiones cross-origin hacia la API. El frontend no usa cookies para autenticación (envía `Authorization: Bearer` leído de `localStorage`), así que el robo de sesión vía CSRF no aplica hoy; pero el comodín permitía usar la API desde un origen no controlado por el negocio.
- `!origin` ⇒ permitido: acepta peticiones sin `Origin` (curl, server-to-server). Con `credentials: true` es cuestionable.

**Resuelto (comodín de Vercel, PR #87).** La validación se extrajo a [cors-origin.ts](../src/shared-kernel/presentation/http/cors-origin.ts) (`isOriginAllowed`), que [main.ts](../src/main.ts) usa en el callback de `enableCors`. El comodín se sustituyó por un patrón anclado al proyecto **y** al team de Vercel:

```ts
const VERCEL_PREVIEW_ORIGIN =
  /^https:\/\/inmuebles-el-guarzo-frontend-[a-z0-9-]+-inmuebles-el-guarzo\.vercel\.app$/;
```

- El sufijo del team es imprescindible: en Vercel el nombre de proyecto es único por team, no global, así que el patrón que se propuso originalmente en esta auditoría (sin team) lo satisface cualquiera que cree un proyecto `inmuebles-el-guarzo-frontend` en su propio team.
- `CORS_ALLOWED_ORIGINS`, `credentials`, `methods` y `allowedHeaders` no cambian.
- Cubierto por [cors-origin.spec.ts](../src/shared-kernel/presentation/http/cors-origin.spec.ts): lista permitida, previews del team (deployment y rama) y rechazos (`atacante.vercel.app`, mismo proyecto en otro team, sufijo/prefijo añadido, `http://`, origen desconocido).

**Pendiente.**

- **Decidir `!origin`.** Hoy se sigue permitiendo (cubierto por un test de caracterización). Evaluar si algún cliente legítimo llama sin `Origin` antes de rechazarlo.
- **Riesgo residual del patrón.** No está confirmado que Vercel impida a terceros reservar como dominio de producción un nombre que termine en `-inmuebles-el-guarzo.vercel.app`. La solución totalmente robusta es no depender de `*.vercel.app` (dominio propio para previews o lista explícita).
- **(verificar en infraestructura)** que el nombre del proyecto y el slug del team en Vercel coinciden con el patrón, y que los previews no se truncan por longitud del subdominio.

### H-08 — XSS almacenado latente / sanitización incompleta (Medio)

- `sanitizeText` (allowlist vacía, elimina todo HTML) se aplica a `proposedDescription` ([proposed-description.value-object.ts:27](../src/modules/publications/domain/value-objects/proposed-description.value-object.ts#L27)) y a `decisionMotive` ([reject-publication-request.interactor.ts:64](../src/modules/publications/application/use-cases/reject-publication-request/reject-publication-request.interactor.ts#L64)). **Bien.**
- **Pero NO se sanitiza:**
  - `ownerFullName` — `FullName` ([full-name.value-object.ts](../src/shared-kernel/domain/value-objects/full-name.value-object.ts)) solo bloquea caracteres de control; permite `<`, `>`, `"`, `'`, `&`. Un nombre como `<img src=x onerror=...> Pérez` se almacena tal cual.
  - `proposedLocation` — `ProposedLocation` ([proposed-location.value-object.ts:22-28](../src/modules/publications/domain/value-objects/proposed-location.value-object.ts#L22-L28)) solo hace `trim`.
  - `name`, `message` de `ContactMessage` (módulo aún no implementado, pero el esquema ya está).
- **Dónde detona:**
  - Las **plantillas de email** ([email-templates.ts](../src/modules/notifications/infrastructure/resend/email-templates.ts)) interpolan `ownerFullName` directamente en HTML y `i18next` está inicializado con `interpolation.escapeValue: false` ([i18n.service.ts:42-44](../src/shared-kernel/infrastructure/i18n/i18n.service.ts#L42-L44)). Hoy esta ruta **no está cableada** (ver H-16 / nota abajo) — los emails salen por Novu — pero es una bomba de relojería para cuando se conecte Resend.
  - El **panel de administración** (frontend) que liste solicitudes: si pinta `ownerFullName` / `proposedLocation` sin escapar, es XSS con sesión de ADMIN.

**Acción:**

- Aplicar `sanitizeText` (o al menos escape de entidades HTML) a **todos** los campos de texto libre de origen público: `ownerFullName`, `proposedLocation`, y los futuros de `ContactMessage`.
- En `i18n.service.ts`, no usar `escapeValue: false` global. Si se necesita permitir HTML en algunas claves (los `<strong>` de las plantillas), usar `{{campo}}` para valores (escapado) y `{{- campo}}` solo para el HTML de plantilla controlado, o construir el HTML fuera de i18next.
- Defensa en profundidad: el frontend debe escapar siempre.

> **Nota (H-16 relacionada):** `ResendEmailSenderAdapter` y `EmailTemplates` **no están registrados en ningún módulo** — `NotificationsModule` solo provee el adaptador de Novu ([notifications.module.ts:18-24](../src/modules/notifications/notifications.module.ts#L18-L24)). Son código muerto hoy. Tras la Fase 2, `RESEND_FROM_ADDRESS` es obligatoria en `EnvSchema` aunque el adaptador no se instancie (la validación corre igual al bootstrap) — es aceptable, pero convendría decidir si Resend se cablea o se elimina.

### H-10 — Fuga de detalle interno en errores (Bajo)

- [prisma-exception.filter.ts:31-33](../src/shared-kernel/presentation/filters/prisma-exception.filter.ts#L31-L33): `UniqueConstraintViolationException` devuelve al cliente `A record with the same "email, dedup_hash" already exists.` → **revela nombres de columnas** (`dedup_hash`, etc.). El `message` viaja en el body ([domain-exception.filter.ts:44-50](../src/shared-kernel/presentation/filters/domain-exception.filter.ts#L44-L50)).
- No hay un filtro _catch-all_ que normalice errores no-dominio / no-Prisma al shape `{code, message, type}`. `ForbiddenException`, errores de `ValidationPipe` (`forbidNonWhitelisted: true` lista los nombres de propiedades), y cualquier excepción inesperada usan el formato por defecto de Nest — inconsistente. El stack no se filtra al body (Nest lo manda solo a logs), lo cual está bien.
- **Confirmado:** `SupabaseAuthAdapter` mete el `reason` del error de `jose` en la excepción ([supabase-auth.adapter.ts:80-83](../src/modules/iam/infrastructure/identity-provider/supabase/supabase-auth.adapter.ts#L80-L83)) y `InvalidAuthTokenException` lo concatena al mensaje (`Authentication token is invalid: ${reason}`, [invalid-auth-token.exception.ts:26-28](../src/modules/iam/domain/exceptions/invalid-auth-token.exception.ts#L26-L28)). El comentario del adapter dice que el motivo solo va a logs y que el cliente ve `IAM.INVALID_AUTH_TOKEN`, pero `DomainExceptionFilter` devuelve ese `message` en `body.message`: el cliente recibe el motivo interno de `jose` y, en `extractSub`/`extractEmail` ([supabase-auth.adapter.ts:93](../src/modules/iam/infrastructure/identity-provider/supabase/supabase-auth.adapter.ts#L93), [:114](../src/modules/iam/infrastructure/identity-provider/supabase/supabase-auth.adapter.ts#L114)), el valor del claim rechazado.
- El 403 de `KongGatewayGuard` (`ForbiddenException`) también usa el formato por defecto de Nest (`{statusCode, message, error}`), no el shape de dominio.

**Acción:**

- Mensajes genéricos hacia el cliente; detalle solo a logs/Sentry.
- Añadir un `AllExceptionsFilter` catch-all que unifique el shape y, en producción, oculte `message` para 5xx (`"Error interno"`).
- Revisar que `body.message` de `DomainExceptionFilter` sea apto para el usuario final o quitarlo del body (el frontend ya usa `code` con i18n).

### H-11 — Sin `trust proxy` (Bajo-Medio)

[main.ts](../src/main.ts) nunca llama `app.set('trust proxy', ...)`. Detrás de Cloudflare + Render + Kong, `req.ip` y `req.socket.remoteAddress` son de infraestructura. Impacto:

- `submittedFromIp` se toma de `req.ip` ([publications.controller.ts:119](../src/modules/publications/presentation/http/controllers/publications.controller.ts#L119)) y, junto con `consentIp`, se guarda como **evidencia de consentimiento (Ley 1581)** ([submit-publication-request.interactor.ts:116-133](../src/modules/publications/application/use-cases/submit-publication-request/submit-publication-request.interactor.ts#L116-L133)). Es la IP del proxy, no la del titular. Evidencia legal débil.
- Cualquier rate limiting/auditoría por IP a nivel de app agruparía todo bajo una IP.

**Acción:** `app.set('trust proxy', 1)` (o el número de proxies) y leer la IP del header que corresponda. Como Cloudflare está delante, `CF-Connecting-IP` es la fuente fiable; extraerla explícitamente en el controlador en lugar de `req.ip`.

### H-12 — Helmet y headers (Bajo)

- [main.ts:23](../src/main.ts#L23): `app.use(helmet())` con defaults. Para una API JSON el CSP por defecto (`default-src 'self'`) es aceptable, pero:
  - rompería Swagger UI (scripts/estilos inline); hoy no aplica en producción porque Swagger no se registra allí (H-05), pero sí en desarrollo si se endurece el CSP de forma global;
  - no fija `Cross-Origin-Resource-Policy` / `Cross-Origin-Opener-Policy` de forma explícita.
- Kong revela versión (`Server: kong/3.9`, `Via`) y hay un `X-Powered-By: Kong-Gateway` añadido a propósito ([kong.yml:77-82](../kong/kong.yml#L77-L82)).

**Acción:** configurar Helmet explícitamente; en Kong `ENV KONG_HEADERS=off` y eliminar el `response-transformer` que añade `X-Powered-By`. NestJS por defecto no manda `X-Powered-By: Express` (Nest lo desactiva), verificar.

### H-13 — Rate limiting a nivel de aplicación inexistente (Medio)

README §3.6 lista "Implementación de rate limiting" como restricción de seguridad y `package.json` documenta `@upstash/redis` como base para ello. En el código, Redis (Upstash) se usa **solo como caché** del detalle de publicación ([publications.controller.ts:158-169](../src/modules/publications/presentation/http/controllers/publications.controller.ts#L158-L169)). No hay `@upstash/ratelimit`, ni `ThrottlerModule`, ni ningún guard con `.incr()`.

Depender solo de Kong es frágil (H-01, H-02). **Defensa en profundidad recomendada:** un guard con `@upstash/ratelimit` sobre los endpoints `@Public()` de escritura, keyed por `CF-Connecting-IP`, con límites más estrictos que los de Kong. Upstash REST **sí** sirve aquí (es el cliente del backend, no de Kong).

### H-14 — Condiciones de carrera (Bajo)

- **Dedup TOCTOU:** [submit-publication-request.interactor.ts:97-100](../src/modules/publications/application/use-cases/submit-publication-request/submit-publication-request.interactor.ts#L97-L100) hace `findByDedupHash` y luego `save` en una transacción posterior. Dos requests concurrentes con el mismo hash pasan ambos el check. El `@unique` en `dedup_hash` los frena en BD, pero el segundo revienta con `P2002` → mensaje que filtra columnas (H-10).
- **`nextReferenceNumber` = `count(*) + 1`** ([publication-request.prisma.repository.adapter.ts:90-101](../src/modules/publications/infrastructure/persistence/prisma/publication-request.prisma.repository.adapter.ts#L90-L101)), llamado **fuera** de la transacción ([interactor:103-104](../src/modules/publications/application/use-cases/submit-publication-request/submit-publication-request.interactor.ts#L103-L104)). Dos solicitudes en el mismo año → mismo número de referencia → `P2002` en `reference_number`.

**Acción:** generar el número con una secuencia Postgres (`CREATE SEQUENCE` por año, o un contador atómico `INSERT ... ON CONFLICT DO UPDATE RETURNING`), y mover el dedup-check + insert a la misma transacción con nivel `Serializable` o un `INSERT ... ON CONFLICT DO NOTHING` y tratar 0 filas como duplicado.

### H-15 — Supply chain / CI (Bajo)

- [.github/workflows/ci.yml](../.github/workflows/ci.yml): sin `pnpm audit`, sin Dependabot/Renovate, sin CodeQL. SonarCloud hace algo de SAST pero no cubre CVEs de dependencias.
- `SonarSource/sonarcloud-github-action@master` ([ci.yml:94](../.github/workflows/ci.yml#L94)) — clavar a `@master` es un riesgo de supply chain (una acción comprometida corre con `SONAR_TOKEN` y `GITHUB_TOKEN`). Pinnear a un tag/SHA.
- `jose@^4.15.9` — la v4 está en mantenimiento; v5/v6 son las actuales. 4.15.9 ya incluye los fixes de DoS conocidos, pero conviene planificar el salto a v5+.

**Acción:** añadir job de `pnpm audit --prod` (o `osv-scanner`), activar Dependabot, pinnear la acción de Sonar.

### H-16 — Outbox transaccional no usado (Bajo, fiabilidad)

El esquema define `notification_outbox` para entrega confiable ([schema.prisma:719-750](../prisma/schema.prisma#L719-L750)), pero los handlers llaman a Novu directamente **después** de que la transacción de negocio ya cerró: los interactores publican los eventos tras el `save` y sin pasar `tx` (p. ej. [approve-publication-request.interactor.ts:61-63](../src/modules/publications/application/use-cases/approve-publication-request/approve-publication-request.interactor.ts#L61-L63)), y el handler dispara el workflow ([on-publication-request-approved.handler.ts:27-34](../src/modules/notifications/application/event-handlers/on-publication-request-approved.handler.ts#L27-L34), [in-memory-event-bus.ts:61-74](../src/shared-kernel/infrastructure/event-bus/in-memory-event-bus.ts#L61-L74)). Si el proceso cae entre el commit y el `trigger`, la notificación se pierde sin rastro. No es seguridad, pero sí un requisito (RF-52/RF-55/RF-57) a medio implementar.

---

## 4. Parte C — Lo que está bien (no romper en el refactor)

- **Verificación de JWT sólida:** algoritmo `ES256` en allowlist explícita (previene _algorithm confusion_), `issuer` y `audience` verificados, JWKS remoto con rotación automática vía `jose` ([supabase-auth.adapter.ts:19-23,72-84](../src/modules/iam/infrastructure/identity-provider/supabase/supabase-auth.adapter.ts#L19-L23)).
- **El rol se toma de la BD, no del token** ([jwt-auth.guard.ts:66-76](../src/modules/iam/presentation/http/guards/jwt-auth.guard.ts#L66-L76)): un usuario no puede escalar privilegios manipulando `app_metadata.role` en un token robado/forjado (aunque forjarlo ya lo impide la firma).
- **Autorización por rol en cada endpoint de admin** ([publications.controller.ts](../src/modules/publications/presentation/http/controllers/publications.controller.ts), chequeos `user.role !== 'ADMIN'`).
- **Prisma en todo**, sin `$queryRaw`/`$executeRaw`/`Unsafe` en ningún lado → sin superficie de inyección SQL. Paginación con tope (`Math.min(filters.limit ?? 20, 50)`, [publication-request.prisma.repository.adapter.ts:70](../src/modules/publications/infrastructure/persistence/prisma/publication-request.prisma.repository.adapter.ts#L70)).
- **Tablas append-only por trigger SQL** para `audit_log`, `notification_log`, `offer_state_transitions`, `contact_message_notes`, `personal_data_authorizations` ([migración de triggers append-only](../prisma/migrations/20260506031333_add_append_only_triggers/migration.sql)), y no-DELETE en `publication_requests` + inmutabilidad de `reference_number` ([migración de publication_requests](../prisma/migrations/20260522210559_add_publication_requests_no_delete_trigger/migration.sql)). Muy buen control de integridad.
- **Acceso directo al backend bloqueado** por `KongGatewayGuard` global, fail-closed y con comparación en tiempo constante (H-01, H-06).
- **Kong solo acepta tráfico que pasó por Cloudflare** (`key-auth` sobre `X-Origin-Verify`, sin depender de IPs) y limita por la IP real del cliente (`CF-Connecting-IP`), con un límite propio para el formulario público (H-01 punto 2, H-02, H-03).
- **Validación de entrada exhaustiva** con `class-validator` + `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
- **Validación de entorno al bootstrap** ([env.validator.ts](../src/shared-kernel/infrastructure/config/env.validator.ts)): la app no arranca con config inválida.
- **Sin secretos en el repo:** `.gitignore` cubre `.env`, `.env.local`, `.env.*.local` y `.doppler.yaml`; los únicos archivos versionados son `.env.example` (placeholders) y `doppler.yaml` (solo nombre de proyecto y config, sin secretos). Secretos vía Doppler. Ojo: un `.env.production` o `.env.development` **no** está ignorado; no crearlos o ampliar el patrón a `.env.*` con excepción para `.env.example`.
- **Sentry con `sendDefaultPii: false`** ([instrument.ts:26](../src/instrument.ts#L26)) y **redacción de logs** de `authorization`, `cookie`, `password`, `token` ([pino-logger.config.ts:64-72](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L64-L72)). Además, el serializer de requests solo registra `id`, `method` y `url` ([pino-logger.config.ts:73-78](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L73-L78)), así que ningún header (incluido `X-Kong-Secret`) llega a los logs.
- **`X-Correlation-ID`** propagado extremo a extremo (Kong → backend → BetterStack).
- **Consentimiento Ley 1581** modelado con versión de aviso de privacidad, propósitos, evidencia técnica y revocación append-only.

---

## 5. Parte D — Plan de acción priorizado

### Ahora (antes de exponer a tráfico real)

1. **(H-01)** ~~Confirmar en Render que el backend no es accesible sin pasar por Kong.~~ (verificado: el backend tiene URL pública, pero `KongGatewayGuard` rechaza con 403 todo acceso directo). Residual: pasar a **Private Service** o quitar el dominio público para que `KONG_SECRET` deje de ser la única barrera.
2. **(H-01)** ~~Configurar Cloudflare → origen (Kong) con Authenticated Origin Pull o allowlist de IPs de Cloudflare.~~ (hecho con otro mecanismo: Transform Rule de Cloudflare con `X-Origin-Verify` + `key-auth` en Kong; Authenticated Origin Pull es inviable porque Render termina el TLS. Ver A.1 punto 2).
3. **(H-04)** ~~Turnstile fail-**closed**~~ (hecho: sin bypass en ningún entorno) + enviar `remoteip` + validar `hostname`/`action`.
4. **(H-05)** ~~Deshabilitar Swagger en producción.~~ (hecho en PR #83)
5. **(H-09)** Quitar el `sed` del `entrypoint.sh`, usar `${{ env "KONG_SECRET" }}` en `kong.yml`.

### Siguiente iteración (endurecimiento)

6. **(H-02/H-03)** ~~Rate limiting de Kong: `limit_by: header` + `CF-Connecting-IP` y ruta dedicada con límite estricto para `POST /api/v1/publications`.~~ (hecho: 5/min y 30/h para el formulario; se descartó `KONG_TRUSTED_IPS`/`KONG_REAL_IP_HEADER`, ver A.2).
7. **(H-06)** ~~`timingSafeEqual` en `KongGatewayGuard` + normalizar header a `string`.~~ (hecho)
8. **(H-07)** CORS: ~~regex de preview de Vercel en lugar del wildcard~~ (hecho en PR #87: anclado a proyecto y team); revisar `!origin` + `credentials`.
9. **(H-11)** `trust proxy` + leer `CF-Connecting-IP` para `consentIp`/`submittedFromIp`.
10. **(H-08)** Sanitizar `ownerFullName`, `proposedLocation` (y `ContactMessage`); quitar `escapeValue: false` global de i18next.
11. **(H-10)** Filtro catch-all + mensajes genéricos al cliente; quitar nombres de columnas de los errores `P2002` y el motivo interno de `IAM.INVALID_AUTH_TOKEN`.
12. **(H-13)** Rate limiting a nivel de app con `@upstash/ratelimit` sobre endpoints públicos (defensa en profundidad).

### Backlog

13. **(H-12)** Helmet explícito + `KONG_HEADERS=off` + quitar `X-Powered-By`.
14. **(H-14)** Secuencia Postgres para `reference_number`; dedup-check + insert atómicos.
15. **(H-15)** `pnpm audit`/OSV en CI, Dependabot, pinear acción de Sonar, planificar `jose` v5+.
16. **(H-16)** Implementar el patrón outbox real para notificaciones, o documentar que se acepta la pérdida.
17. **(Kong)** Añadir `request-size-limiting`; documentar procedimiento de rotación de `KONG_SECRET` y `ORIGIN_VERIFY_SECRET` (prioritario mientras el backend sea público, ver H-01).
18. **(Kong)** Verificar que Kong escuche en el puerto que Render espera.

---

_Documento generado como parte de la revisión de arquitectura y revisado contra el código el 2026-09-28. Los puntos marcados **(verificar en infraestructura)** requieren acceso a los dashboards de Render / Cloudflare / Doppler para confirmarse._
