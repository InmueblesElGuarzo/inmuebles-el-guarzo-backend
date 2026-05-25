/**
 * CacheInfrastructureModule — Configura el caché distribuido con
 * Upstash Redis usando el cliente REST oficial.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

import { EnvSchema } from '../config/env.schema';

export const UPSTASH_REDIS = Symbol('UpstashRedis');

@Global()
@Module({
  providers: [
    {
      provide: UPSTASH_REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema, true>): Redis =>
        new Redis({
          url: config.get('UPSTASH_REDIS_REST_URL', { infer: true }),
          token: config.get('UPSTASH_REDIS_REST_TOKEN', { infer: true }),
        }),
    },
  ],
  exports: [UPSTASH_REDIS],
})
export class CacheInfrastructureModule {}
