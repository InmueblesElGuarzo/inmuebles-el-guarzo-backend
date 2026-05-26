/**
 * I18nService — Servicio de internacionalización para el backend.
 *
 * Carga los archivos de traducción desde el sistema de archivos y
 * provee interpolación de variables en los mensajes.
 * Idioma por defecto: español (es).
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import i18next from 'i18next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class I18nService implements OnModuleInit {
  private readonly logger = new Logger(I18nService.name);

  public async onModuleInit(): Promise<void> {
    const emailsPath = join(
      process.cwd(),
      'dist',
      'shared-kernel',
      'infrastructure',
      'i18n',
      'locales',
      'es',
      'emails.json',
    );

    const esEmails = JSON.parse(readFileSync(emailsPath, 'utf-8')) as Record<string, unknown>;

    await i18next.init({
      lng: 'es',
      fallbackLng: 'es',
      resources: {
        es: {
          emails: esEmails,
        },
      },
      interpolation: {
        escapeValue: false,
      },
    });

    this.logger.log('i18n initialized with es locale');
  }
  public t(namespace: string, key: string, variables?: Record<string, string>): string {
    return i18next.t(`${namespace}:${key}`, variables ?? {});
  }
}
