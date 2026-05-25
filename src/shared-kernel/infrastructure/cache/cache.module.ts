/**
 * CacheInfrastructureModule — Configura el caché distribuido con
 * Upstash Redis usando @nestjs/cache-manager.
 *
 * TTL por defecto: 60 segundos.
 * El módulo es global para que cualquier módulo pueda inyectar
 * CacheManager sin importarlo explícitamente.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

import { EnvSchema } from '../config/env.schema';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema, true>) => ({
        store: (): Promise<{
          get: (key: string) => Promise<unknown>;
          set: (key: string, value: unknown, ttl?: number) => Promise<unknown>;
          del: (key: string) => Promise<number>;
          reset: () => Promise<string>;
        }> => {
          const redis = new Redis({
            url: config.get('UPSTASH_REDIS_REST_URL', { infer: true }),
            token: config.get('UPSTASH_REDIS_REST_TOKEN', { infer: true }),
          });
          return Promise.resolve({
            get: (key: string): Promise<unknown> => redis.get(key),
            set: (key: string, value: unknown, ttl?: number): Promise<unknown> =>
              redis.set(key, value, ttl ? { ex: ttl } : undefined),
            del: (key: string): Promise<number> => redis.del(key),
            reset: (): Promise<string> => redis.flushdb(),
          });
        },
        ttl: 60,
      }),
    }),
  ],
})
export class CacheInfrastructureModule {}
