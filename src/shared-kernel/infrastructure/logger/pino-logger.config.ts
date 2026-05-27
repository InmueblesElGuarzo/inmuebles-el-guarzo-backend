/**
 * pinoLoggerConfig — Configuración de Pino según el entorno.
 *
 * En desarrollo: logs formateados con pino-pretty (legibles en consola).
 * En producción: logs enviados a BetterStack via @logtail/pino transport.
 *
 * El X-Correlation-ID generado por Kong se propaga como correlationId
 * en cada log para permitir trazabilidad distribuida entre Kong,
 * el backend y BetterStack.
 *
 * → CAPA: Infrastructure (Uncle Bob)
 */

import { Params } from 'nestjs-pino';
import { IncomingMessage } from 'node:http';

const isDevelopment = process.env.NODE_ENV !== 'production';

const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    singleLine: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
} as const;

const prodTransport = {
  target: '@logtail/pino',
  options: {
    sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN ?? '',
  },
} as const;

const resolveTransport = (): { target: string; options: Record<string, unknown> } | undefined => {
  if (isDevelopment) return devTransport;
  if (process.env.BETTERSTACK_SOURCE_TOKEN) return prodTransport;
  return undefined;
};

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: isDevelopment ? 'debug' : 'info',
    autoLogging: {
      ignore: (req: IncomingMessage): boolean => req.url === '/api/v1/health',
    },
    transport: resolveTransport(),
    genReqId: (req: IncomingMessage): string => {
      const correlationId = req.headers['x-correlation-id'];
      if (typeof correlationId === 'string' && correlationId.length > 0) {
        return correlationId;
      }
      return `local-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    },
    customProps: (req: IncomingMessage) => ({
      environment: process.env.NODE_ENV ?? 'development',
      correlationId: req.headers['x-correlation-id'] ?? 'no-correlation-id',
      kongRequestId: req.headers['x-kong-request-id'] ?? 'no-kong-request-id',
    }),
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
      ],
      remove: true,
    },
    serializers: {
      req: (req: { method: string; url: string; id: string }) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res: { statusCode: number }) => ({
        statusCode: res.statusCode,
      }),
    },
  },
};
