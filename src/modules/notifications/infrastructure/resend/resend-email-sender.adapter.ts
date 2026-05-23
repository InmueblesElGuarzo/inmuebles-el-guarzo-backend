/**
 * ResendEmailSenderAdapter — Implementación del EmailSenderPort usando Resend.
 *
 * Si RESEND_API_KEY no está configurada, loguea un warning y retorna sin
 * enviar. Si Resend falla (error de API o excepción), loguea el error pero
 * NO lo propaga para no interrumpir el flujo principal.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { EnvSchema } from '../../../../shared-kernel/infrastructure/config/env.schema';
import { EmailSenderPort, SendEmailParams } from '../../application/ports/output/email-sender.port';

const FROM_ADDRESS = 'Inmuebles El Guarzo <noreply@inmuebleselguarzo.com>';

@Injectable()
export class ResendEmailSenderAdapter implements EmailSenderPort {
  private readonly logger = new Logger(ResendEmailSenderAdapter.name);
  private readonly resend: Resend;
  private readonly apiKey: string | undefined;

  public constructor(configService: ConfigService<EnvSchema, true>) {
    this.apiKey = configService.get('RESEND_API_KEY', { infer: true });
    this.resend = new Resend(this.apiKey);
  }

  public async send(params: SendEmailParams): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada; email omitido.');
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: FROM_ADDRESS,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        this.logger.error('Resend devolvió un error al enviar email', error);
      }
    } catch (err) {
      this.logger.error('Excepción inesperada al enviar email via Resend', err);
    }
  }
}
