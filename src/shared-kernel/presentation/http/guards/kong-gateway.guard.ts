/**
 * KongGatewayGuard — Verifica que el request llegó a través de Kong
 * comprobando el header secreto X-Kong-Secret.
 *
 * Si el header no está presente o no coincide con KONG_SECRET,
 * rechaza con 403 Forbidden.
 *
 * Esto previene que actores externos accedan al backend directamente
 * saltándose el API Gateway.
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

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
    const secret = request.headers['x-kong-secret'];

    if (!secret || secret !== this.kongSecret) {
      throw new ForbiddenException('Direct access to backend is not allowed.');
    }

    return true;
  }
}
