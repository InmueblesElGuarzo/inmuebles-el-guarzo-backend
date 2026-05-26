/**
 * UnleashService — Servicio para consultar feature flags desde Unleash Cloud.
 *
 * Inicializa el cliente de Unleash al arrancar el módulo y expone
 * un método isEnabled para consultar el estado de cada flag.
 *
 * Los flags disponibles están tipados como constantes para evitar
 * strings mágicos en el código.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initialize, type Unleash } from 'unleash-client';

import { EnvSchema } from '../config/env.schema';

export const FEATURE_FLAGS = {
  SHOW_OWNER_CONTACT: 'admin.publications.show-owner-contact',
  SHOW_EXPECTED_PRICE: 'admin.publications.show-expected-price',
} as const;

@Injectable()
export class UnleashService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UnleashService.name);
  private client!: Unleash;

  public constructor(private readonly config: ConfigService<EnvSchema, true>) {}

  public async onModuleInit(): Promise<void> {
    this.client = initialize({
      url: `${this.config.get('UNLEASH_API_URL', { infer: true })}/api`,
      appName: 'inmuebles-el-guarzo-backend',
      customHeaders: {
        Authorization: this.config.get('UNLEASH_API_TOKEN', { infer: true }),
      },
    });

    await new Promise<void>((resolve) => {
      this.client.on('synchronized', () => {
        this.logger.log('Unleash client synchronized with feature flags');
        resolve();
      });
      this.client.on('error', (err: unknown) => {
        this.logger.error('Unleash client error', err);
        resolve();
      });
      setTimeout(resolve, 5000);
    });
  }

  public async onModuleDestroy(): Promise<void> {
    await this.client.destroy();
  }

  public isEnabled(flagName: string): boolean {
    return this.client.isEnabled(flagName);
  }
}
