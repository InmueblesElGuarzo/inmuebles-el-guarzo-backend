/**
 * TurnstileCaptchaVerifierAdapter — Implementación del CaptchaVerifierPort
 * usando Cloudflare Turnstile.
 *
 * Falla cerrado, sin bypass en ningún entorno:
 *  - Si TURNSTILE_SECRET_KEY falta, está vacía o solo tiene espacios, el
 *    constructor lanza un Error y la app no arranca (fail fast).
 *  - Si Cloudflare falla o responde error, loguea el error y retorna false.
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
  private readonly secretKey: string;

  public constructor(configService: ConfigService<EnvSchema, true>) {
    // Tipado como opcional a propósito: en runtime puede faltar aunque
    // EnvSchema la exija (cambio de esquema o error de configuración).
    const secretKey: string | undefined = configService.get('TURNSTILE_SECRET_KEY', {
      infer: true,
    });
    if (!secretKey?.trim()) {
      throw new Error(
        'TURNSTILE_SECRET_KEY no está configurada; la verificación CAPTCHA no puede operar.',
      );
    }
    this.secretKey = secretKey;
  }

  public async verify(token: string): Promise<boolean> {
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
