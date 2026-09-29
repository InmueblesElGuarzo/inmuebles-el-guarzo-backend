/**
 * KongGatewayGuard — Verifica que el request llegó a través de Kong
 * comprobando el header secreto X-Kong-Secret.
 *
 * Si el header no está presente o no coincide con KONG_SECRET,
 * rechaza con 403 Forbidden. La comparación es en tiempo constante
 * y un header duplicado (string[]) se rechaza sin comparar.
 *
 * Esto previene que actores externos accedan al backend directamente
 * saltándose el API Gateway.
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

import { timingSafeEqual } from 'node:crypto';

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { EnvSchema } from '../../../infrastructure/config/env.schema';

@Injectable()
export class KongGatewayGuard implements CanActivate {
  private readonly kongSecret: string;

  public constructor(config: ConfigService<EnvSchema, true>) {
    this.kongSecret = config.get('KONG_SECRET', { infer: true });
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Permitir health check de Render sin verificación
    if (request.path === '/api/v1/health') {
      return true;
    }

    const secret = request.headers['x-kong-secret'];

    if (
      typeof secret !== 'string' ||
      secret.length === 0 ||
      !this.safeEqual(secret, this.kongSecret)
    ) {
      throw new ForbiddenException('Direct access to backend is not allowed.');
    }

    return true;
  }

  // timingSafeEqual lanza con buffers de distinto tamaño: se compara byteLength antes
  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    if (bufA.byteLength !== bufB.byteLength) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  }
}
