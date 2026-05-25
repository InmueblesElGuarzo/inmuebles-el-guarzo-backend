/**
 * sanitizeText — Elimina etiquetas HTML y scripts maliciosos de un
 * string de texto libre usando sanitize-html (alternativa OWASP para Node.js).
 *
 * Configuración: no permite ninguna etiqueta HTML. To do markup es eliminado
 * y solo se preserva el texto plano. Esto previene ataques XSS en campos
 * de texto libre como descripciones y motivos de decisión.
 *
 * → CAPA: Domain (Uncle Bob)
 */

import sanitizeHtml from 'sanitize-html';

export function sanitizeText(raw: string): string {
  return sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
