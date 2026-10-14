/**
 * @ClientIp() — Parameter decorator que inyecta la IP del visitante resuelta
 * por `resolveClientIp`: `CF-Connecting-IP` si es válida, si no `request.ip`.
 *
 * Uso:
 *   @Post()
 *   submit(@ClientIp() clientIp: string | undefined) { ... }
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { resolveClientIp } from '../client-ip';

export const ClientIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return resolveClientIp(request.headers['cf-connecting-ip'], request.ip);
  },
);
