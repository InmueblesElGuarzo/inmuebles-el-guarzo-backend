/**
 * EmailSenderPort — Puerto de salida para envío de correos electrónicos.
 *
 * Desacopla la lógica de aplicación del proveedor concreto de email
 * (Resend, SendGrid, etc.). Los handlers de eventos dependen de esta
 * interfaz, no de la implementación.
 *
 * → CAPA: Application (Uncle Bob).
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailSenderPort {
  send(params: SendEmailParams): Promise<void>;
}

/**
 * Symbol token para inyección por NestJS.
 *
 *   { provide: EMAIL_SENDER, useClass: ResendEmailSenderAdapter }
 *
 *   constructor(@Inject(EMAIL_SENDER) private readonly emailSender: EmailSenderPort) {}
 */
export const EMAIL_SENDER = Symbol('EmailSender');
