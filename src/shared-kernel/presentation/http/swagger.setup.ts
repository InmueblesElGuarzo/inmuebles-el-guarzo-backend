/**
 * setupSwagger — Registra la documentación OpenAPI (`/api/docs` y
 * `/api/docs-json`) solo fuera de producción.
 *
 * `SwaggerModule.setup` monta middleware de Express: esas rutas no pasan
 * por `KongGatewayGuard` ni `JwtAuthGuard`, así que en producción
 * expondrían el esquema completo de la API sin autenticación (H-05 de
 * docs/auditoria-seguridad-2026-09.md).
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { EnvSchema } from '../../infrastructure/config/env.schema';

export function setupSwagger(app: INestApplication, nodeEnv: EnvSchema['NODE_ENV']): void {
  if (nodeEnv === 'production') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Inmuebles El Guarzo API')
    .setDescription('API del backend de Inmuebles El Guarzo v2.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
