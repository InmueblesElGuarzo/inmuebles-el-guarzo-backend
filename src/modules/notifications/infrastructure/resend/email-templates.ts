/**
 * EmailTemplates — Plantillas HTML para correos transaccionales.
 *
 * → CAPA: Infrastructure (Uncle Bob).
 */

export class EmailTemplates {
  public static buildApprovalEmail(ownerFullName: string, referenceNumber: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Solicitud aprobada</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;">
    <tr><td>
      <h1 style="color:#1a7a4a;font-size:22px;margin-bottom:8px;">
        ¡Buenas noticias, ${ownerFullName}!
      </h1>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        Tu solicitud de captación con número de referencia
        <strong>${referenceNumber}</strong> ha sido
        <strong style="color:#1a7a4a;">aprobada</strong>.
      </p>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        Pronto uno de nuestros asesores se pondrá en contacto contigo
        para coordinar los próximos pasos.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#666;font-size:13px;">
        <strong>Inmuebles El Guarzo</strong><br>
        Email: contacto@inmuebleselguarzo.com<br>
        Teléfono: +57 300 000 0000
      </p>
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
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Solicitud no aprobada</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;">
    <tr><td>
      <h1 style="color:#c0392b;font-size:22px;margin-bottom:8px;">
        Hola, ${ownerFullName}
      </h1>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        Lamentamos informarte que tu solicitud con número de referencia
        <strong>${referenceNumber}</strong> no fue aprobada en esta ocasión.
      </p>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        <strong>Motivo:</strong> ${motive}
      </p>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        Si lo deseas, puedes enviar una nueva solicitud en el futuro.
        Estaremos encantados de revisarla.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#666;font-size:13px;">
        <strong>Inmuebles El Guarzo</strong><br>
        Email: contacto@inmuebleselguarzo.com<br>
        Teléfono: +57 300 000 0000
      </p>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
