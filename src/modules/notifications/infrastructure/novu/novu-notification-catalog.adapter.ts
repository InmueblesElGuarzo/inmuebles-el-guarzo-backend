/**
 * NovuNotificationCatalogAdapter — Implementación del NotificationCatalogPort
 * usando Novu como catálogo centralizado de notificaciones.
 *
 * Si NOVU_API_KEY no está configurada, loguea un warning y retorna sin enviar.
 * Si Novu falla, loguea el error pero NO lo propaga para no interrumpir
 * el flujo principal.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Novu } from '@novu/node';

import { EnvSchema } from '../../../../shared-kernel/infrastructure/config/env.schema';
import {
  NotificationCatalogPort,
  TriggerNotificationParams,
} from '../../application/ports/output/notification-catalog.port';

@Injectable()
export class NovuNotificationCatalogAdapter implements NotificationCatalogPort {
  private readonly logger = new Logger(NovuNotificationCatalogAdapter.name);
  private readonly novu: Novu | null;

  public constructor(configService: ConfigService<EnvSchema, true>) {
    const apiKey = configService.get('NOVU_API_KEY', { infer: true });
    if (!apiKey) {
      this.logger.warn('NOVU_API_KEY no configurada; notificaciones omitidas.');
      this.novu = null;
      return;
    }
    this.novu = new Novu(apiKey);
  }

  public async trigger(params: TriggerNotificationParams): Promise<void> {
    if (!this.novu) return;

    try {
      await this.novu.trigger(params.workflowId, {
        to: {
          subscriberId: params.subscriberId,
          email: params.subscriberId,
        },
        payload: params.payload,
      });
    } catch (err) {
      this.logger.error('Error al disparar notificación via Novu', err);
    }
  }
}
