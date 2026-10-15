/**
 * createCorsOptions — Configuración de CORS que `main.ts` pasa a `enableCors`.
 *
 * Un origen no permitido se rechaza pasando una `ForbiddenException` al
 * callback de `origin`: el middleware de `cors` la entrega a `next(err)`,
 * Express salta las rutas (el controlador no se ejecuta) y el manejador de
 * errores que Nest registra en `app.init()` la pasa por los filtros globales,
 * que responden 403 en JSON. Aplica igual a peticiones normales y a preflight
 * `OPTIONS`, porque `cors` valida el origen antes de distinguirlas.
 *
 * Como es una `HttpException`, `SentryGlobalFilter` la trata como error
 * esperado y no la envía a Sentry. Un `Error` genérico aquí respondía 500 y
 * llegaba a Sentry (issue #94); `callback(null, false)` omitía los headers
 * CORS pero dejaba pasar la petición al controlador.
 *
 * Las peticiones sin `Origin` se permiten (ver `isOriginAllowed`).
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { ForbiddenException, LoggerService } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { isOriginAllowed } from './cors-origin';

export const MAX_LOGGED_ORIGIN_LENGTH = 200;

export type CorsRejectionHandler = (origin: string) => void;

export function createCorsOptions(
  allowedOrigins: readonly string[],
  onReject?: CorsRejectionHandler,
): CorsOptions {
  return {
    origin: (origin, callback): void => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      if (origin) {
        onReject?.(origin);
      }
      callback(new ForbiddenException('Origin not allowed'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
}

/**
 * Registra cada origen rechazado como `warn` estructurado. El `Origin` lo
 * controla el cliente, así que se trunca para acotar el tamaño de la línea.
 */
export function createCorsRejectionLogger(logger: LoggerService): CorsRejectionHandler {
  return (origin) => {
    logger.warn(
      {
        msg: 'Origen rechazado por CORS',
        origin: origin.slice(0, MAX_LOGGED_ORIGIN_LENGTH),
      },
      'CORS',
    );
  };
}
