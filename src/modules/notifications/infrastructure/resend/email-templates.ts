/**
 * EmailTemplates — Construye el HTML de correos usando i18next
 * como catálogo de mensajes centralizado.
 *
 * → CAPA: Infrastructure (Uncle Bob).
 */

import i18next from 'i18next';

export class EmailTemplates {
  public static buildApprovalEmail(ownerFullName: string, referenceNumber: string): string {
    const greeting = i18next.t('emails:approval.greeting', { ownerFullName });
    const body = i18next.t('emails:approval.body', { referenceNumber });
    const nextSteps = i18next.t('emails:approval.nextSteps');
    const footer = i18next.t('emails:approval.footer');

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${i18next.t('emails:approval.subject')}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;">
    <tr><td>
      <h1 style="color:#1a7a4a;font-size:22px;margin-bottom:8px;">${greeting}</h1>
      <p style="color:#333;font-size:15px;line-height:1.6;">${body}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;">${nextSteps}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#666;font-size:13px;white-space:pre-line;">${footer}</p>
    </td></tr>
  </table>
</body>
</html>`;
  }

  public static buildRejectionEmail(
    ownerFullName: string,
    referenceNumber: string,
    motive: string,
  ): string {
    const greeting = i18next.t('emails:rejection.greeting', { ownerFullName });
    const body = i18next.t('emails:rejection.body', { referenceNumber });
    const motiveText = i18next.t('emails:rejection.motive', { motive });
    const encouragement = i18next.t('emails:rejection.encouragement');
    const footer = i18next.t('emails:rejection.footer');

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${i18next.t('emails:rejection.subject')}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;">
    <tr><td>
      <h1 style="color:#c0392b;font-size:22px;margin-bottom:8px;">${greeting}</h1>
      <p style="color:#333;font-size:15px;line-height:1.6;">${body}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;">${motiveText}</p>
      <p style="color:#333;font-size:15px;line-height:1.6;">${encouragement}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#666;font-size:13px;white-space:pre-line;">${footer}</p>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
