# Auditoría de seguridad — Inmuebles El Guarzo backend

**Fecha:** 2026-09-06
**Alcance:** API Gateway (Kong), backend NestJS, configuración de despliegue, manejo de datos personales.
**Método:** revisión estática de código y configuración. No se ejecutaron pruebas dinámicas (DAST) ni se validó la configuración real de Render/Cloudflare/Doppler — los puntos que dependen de eso están marcados como **(verificar en infraestructura)**.

---

## 1. Resumen ejecutivo

| # | Hallazgo | Severidad | Área |
|---|----------|-----------|------|
| H-01 | El backend puede ser accesible directamente sin pasar por Kong; la única defensa es un secreto estático compartido | **Crítico (verificar)** | Gateway / red |
| H-02 | El rate limiting de Kong no identifica al cliente real (IP detrás de Cloudflare + Render) → o es inefectivo o causa auto-DoS | **Alto** | Rate limiting |
| H-03 | No hay límite específico para el formulario público de captación; 60 req/min es demasiado permisivo para ese endpoint | **Alto** | Rate limiting |
| H-04 | Verificación de Turnstile "fail-open": si falta la clave, `verify()` devuelve `true` | **Alto** | Anti-bot |
| H-05 | Swagger UI (`/api/docs`, `/api/docs-json`) expuesto sin autenticación y sin pasar por los guards | **Medio** | Exposición |
| H-06 | `KongGatewayGuard`: comparación de secreto no constante en tiempo + `/health` exento sin throttle | **Medio** | Gateway |
| H-07 | CORS: `origin.endsWith('.vercel.app')` + `credentials: true` permite exfiltración desde cualquier subdominio `*.vercel.app` | **Medio** | CORS |
| H-08 | XSS almacenado latente: `ownerFullName` y `proposedLocation` no se sanitizan; plantillas de email con `escapeValue: false` | **Medio** | XSS |
| H-09 | `entrypoint.sh` inyecta `KONG_SECRET` con `sed` sin escapar → rompe o corrompe la config si el secreto tiene `/ & \n` | **Medio** | Gateway / build |
| H-10 | Fuga de detalle interno en respuestas de error (nombres de columnas de BD en `P2002`) | **Bajo** | Info disclosure |
| H-11 | Sin `trust proxy` en Express → `req.ip` guarda la IP del proxy, no la del cliente (afecta trazabilidad Ley 1581 y cualquier rate limit por IP) | **Bajo-Medio** | Trazabilidad |
| H-12 | Helmet sin configurar (CSP por defecto, sin `Cross-Origin-Resource-Policy` explícito, headers de versión de Kong visibles) | **Bajo** | Headers |
| H-13 | Rate limiting a nivel de aplicación inexistente pese a estar listado como restricción de seguridad (README §3.6) y tener Redis conectado | **Medio** | Defensa en profundidad |
| H-14 | Condiciones de carrera: dedup por hash (TOCTOU) y `nextReferenceNumber` (count+1) permiten duplicados bajo concurrencia | **Bajo** | Integridad |
| H-15 | CI sin escaneo de dependencias (`pnpm audit` / Dependabot) y acción de Sonar clavada a `@master` | **Bajo** | Supply chain |
| H-16 | El `notification_outbox` (patrón outbox transaccional) existe en el esquema pero no se usa: las notificaciones se disparan fuera de transacción y se pierden si el proceso cae | **Bajo** | Fiabilidad |

---

## 2. Parte A — Kong / API Gateway

Archivos revisados: [kong/kong.yml](../kong/kong.yml), [kong/Dockerfile](../kong/Dockerfile), [kong/entrypoint.sh](../kong/entrypoint.sh), [src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts).

### A.1 ¿Está *todo* pasando por Kong?

**Arquitectura declarada:** Cliente → Cloudflare (WAF/CDN) → Kong (servicio en Render) → Backend (servicio en Render).

**Lo que el código garantiza:**

- `KongGatewayGuard` está registrado como `APP_GUARD` global y **es el primer guard** ([app.module.ts:37-40](../src/app.module.ts#L37-L40)), antes del `JwtAuthGuard`. Rechaza con 403 cualquier request cuyo header `X-Kong-Secret` no coincida con `KONG_SECRET`.
- Kong añade ese header a todo lo que proxya (`request-transformer`, [kong.yml:13-17](../kong/kong.yml#L13-L17)).

**Lo que NO garantiza (por qué H-01 es crítico):**

1. **El guard es la *única* barrera.** Si el servicio del backend en Render tiene URL pública (`*.onrender.com`), cualquiera que descubra o filtre `KONG_SECRET` (logs, un error, un dump de entorno vía otra vuln, el historial de git, un screenshot) entra directo al backend **saltándose Kong por completo**: sin rate limiting, sin WAF, sin correlación de logs.
   → **Acción:** el backend debe ser un **Render Private Service** (solo alcanzable desde la red privada de Render). La URL interna `http://inmuebles-el-guarzo-backend-7wli:10000` en [kong.yml:6](../kong/kong.yml#L6) sugiere que ya usan red privada — **hay que confirmar en el dashboard de Render que el backend NO tiene también un dominio público**. Si lo tiene, quitarlo. Con esto `X-Kong-Secret` pasa de ser "la seguridad" a ser "defensa en profundidad".

2. **Kong en Render también debe aceptar tráfico solo desde Cloudflare.** Si no, un atacante hace las peticiones directo a la URL de Kong en Render y se salta el WAF de Cloudflare. Configurar **Cloudflare Authenticated Origin Pull** o allowlist de rangos IP de Cloudflare a nivel de Kong/Render. **(verificar en infraestructura)**

3. **`/api/v1/health` está exento del secreto** ([kong-gateway.guard.ts:31-33](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts#L31-L33)). Si el backend fuera alcanzable directamente, este endpoint confirma que el servicio está vivo y no tiene throttle. Impacto bajo por sí solo, pero es un oráculo de reconocimiento. Con el backend privado deja de importar.

4. **Swagger (`/api/docs`) se salta los guards** (ver H-05 más abajo): es middleware de Express montado por `SwaggerModule.setup`, y los guards de NestJS no corren sobre middleware. A través de Kong queda rate-limitado, pero es accesible sin token.

5. **`request-transformer` con `config.add` NO sobrescribe un header que el cliente ya mandó.** Si un cliente envía `X-Kong-Secret: loquesea`, Kong reenvía **el valor del cliente**, no el suyo. No es un bypass (el backend igual lo rechaza), pero:
   - un cliente legítimo con una extensión de navegador que inyecte ese header recibiría 403 incluso pasando por Kong;
   - Kong debería **eliminar** cualquier `X-Kong-Secret` entrante y **luego** añadir el suyo.
   → **Acción:** añadir `config.remove.headers: ["X-Kong-Secret"]` junto al `add` (Kong aplica `remove` antes que `add`).

### A.2 Rate limiting — análisis detallado

Configuración actual ([kong.yml:18-29](../kong/kong.yml#L18-L29)):

```yaml
- name: rate-limiting
  config:
    minute: 60
    hour: 1000
    policy: local
    redis: { host: localhost, port: 6379, ... }   # ← ignorado con policy: local
```

**Problemas:**

1. **`policy: local` + config `redis` muerta.** Con `policy: local` el bloque `redis` no se usa para nada; apunta a `localhost:6379` que no existe en el contenedor de Kong. Es configuración engañosa. Con `local`, los contadores viven en memoria **por worker de Nginx**. Hoy `KONG_NGINX_WORKER_PROCESSES=1` ([Dockerfile:14](../kong/Dockerfile#L14)) y presumiblemente 1 instancia en Render, así que "funciona" — pero si Render reinicia o escala Kong, los contadores se resetean/no se comparten. Para rate limiting distribuido de verdad haría falta `policy: redis` con un Redis TCP real (**Upstash Redis REST NO sirve para Kong** — Kong habla protocolo RESP/TCP, no REST).

2. **Nadie identifica al cliente real (H-02).** El plugin no fija `limit_by`, así que usa el default (`consumer` → sin consumers configurados → **fallback a `ip`**). Pero la "IP" que ve Kong es `remote_addr`, que detrás de Cloudflare **y** del balanceador de Render es una IP de infraestructura, no la del usuario. Kong no tiene configurado `KONG_TRUSTED_IPS` ni `KONG_REAL_IP_HEADER`. Resultado probable:
   - **todos los usuarios comparten un mismo bucket** → un solo abusador (o tráfico orgánico en hora pico) agota los 60/min **para todos** = auto-DoS; o
   - la IP varía de forma no controlada y el límite es inefectivo.

3. **Límite único y global.** El plugin está en el `service`, con una sola ruta `all-routes` (`paths: [/]`). `minute: 60` aplica a **toda** la API combinada. No hay límite estricto para el endpoint sensible `POST /api/v1/publications` (formulario público de captación). 60 req/min = hasta ~1000 solicitudes de spam/hora por origen — Turnstile es la barrera real, pero es "fail-open" (H-04) y no está atada a `action`/`hostname`.

**Recomendación (H-02 + H-03):**

Como hay Cloudflare delante, lo más robusto en Kong OSS es limitar por el header que Cloudflare inyecta con la IP real del cliente:

```yaml
services:
  - name: inmuebles-el-guarzo-backend
    url: http://inmuebles-el-guarzo-backend-7wli:10000
    routes:
      # Ruta específica y estricta para el formulario público
      - name: public-publication-submit
        paths: ["/api/v1/publications"]
        methods: ["POST"]
        strip_path: false
        plugins:
          - name: rate-limiting
            config:
              minute: 5
              hour: 30
              policy: local            # o redis si se añade un Redis TCP real
              limit_by: header
              header_name: CF-Connecting-IP
              error_message: "Demasiadas solicitudes. Intenta de nuevo en unos minutos."
      # Ruta general para el resto
      - name: all-routes
        paths: ["/"]
        strip_path: false
        plugins:
          - name: rate-limiting
            config:
              minute: 120
              hour: 2000
              policy: local
              limit_by: header
              header_name: CF-Connecting-IP
```

Y en el `Dockerfile` de Kong, para que además funcione el `limit_by: ip` como respaldo y la IP real aparezca en los logs:

```dockerfile
ENV KONG_TRUSTED_IPS=0.0.0.0/0,::/0
ENV KONG_REAL_IP_HEADER=X-Forwarded-For
ENV KONG_REAL_IP_RECURSIVE=on
```

> Nota: confiar en `X-Forwarded-For` de forma amplia solo es seguro **si** Kong solo recibe tráfico de Cloudflare/Render (ver A.1 punto 2). Si el origen queda expuesto, un atacante falsifica `CF-Connecting-IP` / `X-Forwarded-For` y evade el límite. Los dos hallazgos van juntos.

Cloudflare (plan Free) permite **1 regla de rate limiting** — úsala como primer filtro grueso para `/api/v1/publications` y deja el límite fino en Kong.

### A.3 Otras funciones del gateway

| Función | Estado | Comentario |
|---|---|---|
| Enrutamiento | ✅ OK | Ruta única `/` con `strip_path: false`, correcto para pasar el path completo. |
| Inyección de identidad de gateway (`X-Kong-Secret`) | ⚠️ | Funciona pero no elimina el header entrante del cliente (A.1 punto 5). |
| Validación de tokens JWT | ❌ No en Kong | La hace el backend (`JwtAuthGuard` + `SupabaseAuthAdapter`). El README dice que el gateway "valida tokens"; en la práctica no. **Está bien** que la haga el backend (necesita consultar el rol en BD), pero conviene documentarlo para no asumir una defensa que no existe. |
| `correlation-id` | ✅ OK | `X-Correlation-ID` UUID, `echo_downstream: true`, y el backend lo propaga a los logs ([pino-logger.config.ts:49-60](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L49-L60)). Bien hecho. |
| Manejo centralizado de errores | ❌ No en Kong | Lo hace el backend (filtros). Ver H-10. |
| Bloqueo tras 5 intentos de login | ❌ No implementado | README SEG-C01-E03. Login lo maneja Supabase Auth (fuera de este repo); verificar que Supabase tenga configurado el rate limit de auth. |
| Tamaño máximo de request | ❌ | Sin plugin `request-size-limiting`. Express corta en ~100 kB por defecto, lo cual ayuda, pero conviene un límite explícito en Kong (p. ej. `request-size-limiting` a 256 kB). |
| Ocultar versión / tecnología | ❌ | Ver H-12: Kong añade `Via: kong/3.9`, `Server: kong/3.9`, y hay un `response-transformer` que **añade** `X-Powered-By: Kong-Gateway` ([kong.yml:36-42](../kong/kong.yml#L36-L42)) — eso es revelar tecnología a propósito. Quitarlo y poner `KONG_HEADERS=off`. |

### A.4 Hardening de `kong.yml` / Dockerfile / entrypoint

- **H-09 — `entrypoint.sh` (`sed`):**

  ```sh
  sed -i "s/KONG_SECRET_PLACEHOLDER/${KONG_SECRET}/g" /etc/kong/kong.yml
  ```

  Si `KONG_SECRET` contiene `/`, `&` o saltos de línea (Doppler genera secretos con cualquier carácter base64/hex, y `/` es común en base64), el `sed` produce una config corrupta o el contenedor no arranca. **Solución preferida:** eliminar el `sed` y usar interpolación nativa de Kong 3.x en `kong.yml`:

  ```yaml
  plugins:
    - name: request-transformer
      config:
        remove:
          headers: ["X-Kong-Secret"]
        add:
          headers:
            - X-Kong-Secret:${{ env "KONG_SECRET" }}
  ```

  Y en el Dockerfile: `ENV KONG_DECLARATIVE_CONFIG=/etc/kong/kong.yml` ya está; añadir que Kong debe tener habilitado el rendering de vars (por defecto lo está en modo DB-less). Con esto el `entrypoint.sh` se reduce a `exec /docker-entrypoint.sh kong docker-start`.

- **Puerto:** el Dockerfile fija `KONG_PROXY_LISTEN=0.0.0.0:8000`. Render normalmente inyecta `PORT` (10000). **(verificar)** que el servicio de Kong en Render esté configurado para exponer el puerto 8000, o parametrizar `KONG_PROXY_LISTEN=0.0.0.0:${PORT:-8000}`.
- **`KONG_ADMIN_LISTEN=off`** ✅ correcto, la Admin API está deshabilitada.
- **Añadir plugins recomendados:** `request-size-limiting`, y opcionalmente `bot-detection` y `ip-restriction` (allowlist de Cloudflare).
- **Rotación de `KONG_SECRET`:** hoy es estático e indefinido. Definir un procedimiento de rotación (cambiar en Doppler → redeploy de Kong y backend). Considerar 2 secretos válidos simultáneamente durante la ventana de rotación.

---

## 3. Parte B — Vulnerabilidades en el backend

### H-04 — Turnstile "fail-open" (Alto)

[turnstile-captcha-verifier.adapter.ts:30-33](../src/modules/publications/infrastructure/captcha/turnstile-captcha-verifier.adapter.ts#L30-L33):

```ts
if (!this.secretKey) {
  this.logger.warn('TURNSTILE_SECRET_KEY no configurada; verificación omitida.');
  return true;   // ← acepta cualquier token
}
```

Mitigado hoy porque `TURNSTILE_SECRET_KEY` es `@IsNotEmpty()` en `EnvSchema` y la app no arranca sin ella. Pero el diseño "en caso de duda, dejar pasar" es peligroso: un error de configuración en producción desactiva silenciosamente el anti-bot del formulario público.

**Además:** no se envía `remoteip` ni se validan los campos `hostname` / `action` de la respuesta de Cloudflare ([turnstile-captcha-verifier.adapter.ts:36-47](../src/modules/publications/infrastructure/captcha/turnstile-captcha-verifier.adapter.ts#L36-L47)). Un token válido obtenido en otro sitio del mismo dominio se puede reutilizar.

**Acción:**
- `if (!this.secretKey)` → devolver `true` solo si `NODE_ENV !== 'production'`; en producción, `return false` o lanzar.
- Añadir `remoteip` (la IP real del cliente) al cuerpo de `siteverify`.
- Validar `data.hostname` contra el dominio esperado y `data.action` contra un valor fijo (`'publication_submit'`) que el frontend setea en el widget.
- Validar el timestamp (`challenge_ts`) para rechazar tokens viejos.

### H-05 — Swagger expuesto en producción (Medio)

[main.ts:56-63](../src/main.ts#L56-L63): `SwaggerModule.setup('api/docs', ...)` se ejecuta siempre. `/api/docs` y `/api/docs-json` son middleware de Express → **no pasan por `KongGatewayGuard` ni `JwtAuthGuard`**. A través de Kong quedan rate-limitados pero son públicos: exponen el esquema completo de la API (todos los endpoints, DTOs, ejemplos).

**Acción:**
```ts
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
```
o protegerlo con basic-auth. Si se quiere en producción, al menos moverlo bajo el prefijo protegido y/o exigir el secreto de Kong con un middleware propio.

### H-06 — `KongGatewayGuard`: comparación no constante (Medio)

[kong-gateway.guard.ts:38](../src/shared-kernel/presentation/http/guards/kong-gateway.guard.ts#L38): `secret !== this.kongSecret` es una comparación de strings que corta en el primer byte distinto → **timing attack** teórico para recuperar el secreto byte a byte. Sobre la red el ruido lo hace poco práctico, pero la corrección es trivial:

```ts
import { timingSafeEqual } from 'node:crypto';

private safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
```

También: `request.headers['x-kong-secret']` puede ser `string | string[]`; si llegan dos headers `X-Kong-Secret` el tipo es `string[]` y `secret !== this.kongSecret` siempre da `true` (rechaza) — no es vuln, pero conviene normalizar.

### H-07 — CORS demasiado permisivo (Medio)

[main.ts:31-33](../src/main.ts#L31-L33) (tras el refactor de la Fase 2, la lista viene de `CORS_ALLOWED_ORIGINS` pero se mantiene):

```ts
if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
  callback(null, true);
}
...
credentials: true,
```

- `origin.endsWith('.vercel.app')`: **cualquiera** puede desplegar `atacante.vercel.app` y, con `credentials: true`, hacer peticiones cross-origin autenticadas (leer respuestas con cookies/tokens del usuario víctima si esta visita el sitio del atacante). Es un vector de robo de datos de sesión.
- `!origin` ⇒ permitido: acepta peticiones sin `Origin` (curl, server-to-server). Con `credentials: true` es cuestionable.

**Acción (ya acordada para la iteración de seguridad):** sustituir el wildcard por un patrón específico de los previews del proyecto:

```ts
const VERCEL_PREVIEW = /^https:\/\/inmuebles-el-guarzo-frontend-[a-z0-9-]+\.vercel\.app$/;
const isAllowed = !origin
  ? false  // decidir: ¿de verdad hace falta permitir sin Origin?
  : allowedOrigins.includes(origin) || VERCEL_PREVIEW.test(origin);
```

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
- No hay un filtro *catch-all* que normalice errores no-dominio / no-Prisma al shape `{code, message, type}`. `ForbiddenException`, errores de `ValidationPipe` (`forbidNonWhitelisted: true` lista los nombres de propiedades), y cualquier excepción inesperada usan el formato por defecto de Nest — inconsistente. El stack no se filtra al body (Nest lo manda solo a logs), lo cual está bien.
- `SupabaseAuthAdapter` mete el `reason` del error de `jose` en la excepción ([supabase-auth.adapter.ts:80-83](../src/modules/iam/infrastructure/identity-provider/supabase/supabase-auth.adapter.ts#L80-L83)); el comentario dice que solo va a logs y el cliente ve `IAM.INVALID_AUTH_TOKEN` — **verificar** que el `DomainExceptionFilter` no esté devolviendo ese `message` detallado al cliente (hoy sí lo devuelve en `body.message`).

**Acción:**
- Mensajes genéricos hacia el cliente; detalle solo a logs/Sentry.
- Añadir un `AllExceptionsFilter` catch-all que unifique el shape y, en producción, oculte `message` para 5xx (`"Error interno"`).
- Revisar que `body.message` de `DomainExceptionFilter` sea apto para el usuario final o quitarlo del body (el frontend ya usa `code` con i18n).

### H-11 — Sin `trust proxy` (Bajo-Medio)

[main.ts](../src/main.ts) nunca llama `app.set('trust proxy', ...)`. Detrás de Cloudflare + Render + Kong, `req.ip` y `req.socket.remoteAddress` son de infraestructura. Impacto:
- `submittedFromIp` y `consentIp` que se guardan como **evidencia de consentimiento (Ley 1581)** ([submit-publication-request.interactor.ts:119-131](../src/modules/publications/application/use-cases/submit-publication-request/submit-publication-request.interactor.ts#L119-L131)) son la IP del proxy, no la del titular. Evidencia legal débil.
- Cualquier rate limiting/auditoría por IP a nivel de app agruparía todo bajo una IP.

**Acción:** `app.set('trust proxy', 1)` (o el número de proxies) y leer la IP del header que corresponda. Como Cloudflare está delante, `CF-Connecting-IP` es la fuente fiable; extraerla explícitamente en el controlador en lugar de `req.ip`.

### H-12 — Helmet y headers (Bajo)

- [main.ts:20](../src/main.ts#L20): `app.use(helmet())` con defaults. Para una API JSON el CSP por defecto (`default-src 'self'`) es aceptable, pero:
  - rompe Swagger UI si se deja en producción (scripts/estilos inline);
  - no fija `Cross-Origin-Resource-Policy` / `Cross-Origin-Opener-Policy` de forma explícita.
- Kong revela versión (`Server: kong/3.9`, `Via`) y hay un `X-Powered-By: Kong-Gateway` añadido a propósito ([kong.yml:37-42](../kong/kong.yml#L37-L42)).

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
- `SonarSource/sonarcloud-github-action@master` — clavar a `@master` es un riesgo de supply chain (una acción comprometida corre con `SONAR_TOKEN` y `GITHUB_TOKEN`). Pinnear a un tag/SHA.
- `jose@^4.15.9` — la v4 está en mantenimiento; v5/v6 son las actuales. 4.15.9 ya incluye los fixes de DoS conocidos, pero conviene planificar el salto a v5+.

**Acción:** añadir job de `pnpm audit --prod` (o `osv-scanner`), activar Dependabot, pinnear la acción de Sonar.

### H-16 — Outbox transaccional no usado (Bajo, fiabilidad)

El esquema define `notification_outbox` para entrega confiable ([schema.prisma:719-750](../prisma/schema.prisma#L719-L750)), pero los handlers llaman a Novu directamente **después** de que la transacción de negocio ya cerró ([on-publication-request-approved.handler.ts:27-34](../src/modules/notifications/application/event-handlers/on-publication-request-approved.handler.ts#L27-L34), [in-memory-event-bus.ts:61-74](../src/shared-kernel/infrastructure/event-bus/in-memory-event-bus.ts#L61-L74)). Si el proceso cae entre el commit y el `trigger`, la notificación se pierde sin rastro. No es seguridad, pero sí un requisito (RF-52/RF-55/RF-57) a medio implementar.

---

## 4. Parte C — Lo que está bien (no romper en el refactor)

- **Verificación de JWT sólida:** algoritmo `ES256` en allowlist explícita (previene *algorithm confusion*), `issuer` y `audience` verificados, JWKS remoto con rotación automática vía `jose` ([supabase-auth.adapter.ts:19-23,72-84](../src/modules/iam/infrastructure/identity-provider/supabase/supabase-auth.adapter.ts#L19-L23)).
- **El rol se toma de la BD, no del token** ([jwt-auth.guard.ts:66-76](../src/modules/iam/presentation/http/guards/jwt-auth.guard.ts#L66-L76)): un usuario no puede escalar privilegios manipulando `app_metadata.role` en un token robado/forjado (aunque forjarlo ya lo impide la firma).
- **Autorización por rol en cada endpoint de admin** ([publications.controller.ts](../src/modules/publications/presentation/http/controllers/publications.controller.ts), chequeos `user.role !== 'ADMIN'`).
- **Prisma en todo**, sin `$queryRaw`/`$executeRaw`/`Unsafe` en ningún lado → sin superficie de inyección SQL. Paginación con tope (`Math.min(limit, 50)`).
- **Tablas append-only por trigger SQL** para `audit_log`, `notification_log`, `offer_state_transitions`, `contact_message_notes`, `personal_data_authorizations`, y no-DELETE en `publication_requests` + inmutabilidad de `reference_number` ([migración de triggers](../prisma/migrations/20260506031333_add_append_only_triggers/migration.sql)). Muy buen control de integridad.
- **Validación de entrada exhaustiva** con `class-validator` + `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
- **Validación de entorno al bootstrap** ([env.validator.ts](../src/shared-kernel/infrastructure/config/env.validator.ts)): la app no arranca con config inválida.
- **Sin secretos en el repo:** `.gitignore` cubre `.env*` y `.doppler.yaml`; solo `.env.example` con placeholders. Secretos vía Doppler.
- **Sentry con `sendDefaultPii: false`** ([instrument.ts:26](../src/instrument.ts#L26)) y **redacción de logs** de `authorization`, `cookie`, `password`, `token` ([pino-logger.config.ts:61-69](../src/shared-kernel/infrastructure/logger/pino-logger.config.ts#L61-L69)).
- **`X-Correlation-ID`** propagado extremo a extremo (Kong → backend → BetterStack).
- **Consentimiento Ley 1581** modelado con versión de aviso de privacidad, propósitos, evidencia técnica y revocación append-only.

---

## 5. Parte D — Plan de acción priorizado

### Ahora (antes de exponer a tráfico real)

1. **(H-01)** Confirmar en Render que el backend es **Private Service** sin dominio público. Si tiene URL pública, quitarla.
2. **(H-01)** Configurar Cloudflare → origen (Kong) con Authenticated Origin Pull o allowlist de IPs de Cloudflare.
3. **(H-04)** Turnstile fail-**closed** en producción + enviar `remoteip` + validar `hostname`/`action`.
4. **(H-05)** Deshabilitar Swagger en producción.
5. **(H-09)** Quitar el `sed` del `entrypoint.sh`, usar `${{ env "KONG_SECRET" }}` en `kong.yml`.

### Siguiente iteración (endurecimiento)

6. **(H-02/H-03)** Rate limiting de Kong: `limit_by: header` + `CF-Connecting-IP`, `KONG_TRUSTED_IPS`/`KONG_REAL_IP_HEADER`, y ruta dedicada con límite estricto para `POST /api/v1/publications`.
7. **(H-06)** `timingSafeEqual` en `KongGatewayGuard` + normalizar header a `string`.
8. **(H-07)** CORS: regex de preview de Vercel en lugar del wildcard; revisar `!origin` + `credentials`.
9. **(H-11)** `trust proxy` + leer `CF-Connecting-IP` para `consentIp`/`submittedFromIp`.
10. **(H-08)** Sanitizar `ownerFullName`, `proposedLocation` (y `ContactMessage`); quitar `escapeValue: false` global de i18next.
11. **(H-10)** Filtro catch-all + mensajes genéricos al cliente; quitar nombres de columnas de los errores `P2002`.
12. **(H-13)** Rate limiting a nivel de app con `@upstash/ratelimit` sobre endpoints públicos (defensa en profundidad).

### Backlog

13. **(H-12)** Helmet explícito + `KONG_HEADERS=off` + quitar `X-Powered-By`.
14. **(H-14)** Secuencia Postgres para `reference_number`; dedup-check + insert atómicos.
15. **(H-15)** `pnpm audit`/OSV en CI, Dependabot, pinear acción de Sonar, planificar `jose` v5+.
16. **(H-16)** Implementar el patrón outbox real para notificaciones, o documentar que se acepta la pérdida.
17. **(Kong)** Añadir `request-size-limiting`; documentar procedimiento de rotación de `KONG_SECRET`.
18. **(Kong)** Verificar que Kong escuche en el puerto que Render espera.

---

*Documento generado como parte de la revisión de arquitectura. Los puntos marcados **(verificar en infraestructura)** requieren acceso a los dashboards de Render / Cloudflare / Doppler para confirmarse.*
