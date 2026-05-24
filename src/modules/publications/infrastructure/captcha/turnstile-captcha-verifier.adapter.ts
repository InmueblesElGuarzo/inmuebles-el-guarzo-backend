/**
 * TurnstileCaptchaVerifierAdapter — Implementación del CaptchaVerifierPort
 * usando Cloudflare Turnstile.
 *
 * Si TURNSTILE_SECRET_KEY no está configurada, loguea un warning y retorna
 * true para no bloquear el flujo en desarrollo.
 * Si Cloudflare falla, loguea el error y retorna false.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvSchema } from '../../../../shared-kernel/infrastructure/config/env.schema';
import { CaptchaVerifierPort } from '../../application/ports/output/captcha-verifier.port';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

@Injectable()
export class TurnstileCaptchaVerifierAdapter implements CaptchaVerifierPort {
  private readonly logger = new Logger(TurnstileCaptchaVerifierAdapter.name);
  private readonly secretKey: string | undefined;

  public constructor(configService: ConfigService<EnvSchema, true>) {
    this.secretKey = configService.get('TURNSTILE_SECRET_KEY', { infer: true });
  }

  public async verify(token: string): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.warn('TURNSTILE_SECRET_KEY no configurada; verificación omitida.');
      return true;
    }

    try {
      const body = new URLSearchParams({
        secret: this.secretKey,
        response: token,
      });

      const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        body,
      });

      const data = (await response.json()) as { success: boolean };
      return data.success;
    } catch (err) {
      this.logger.error('Error al verificar token Turnstile', err);
      return false;
    }
  }
}
