/**
 * resolveClientIp — IP del visitante para la evidencia de consentimiento
 * (Ley 1581): `submittedFromIp` y `consentIp`.
 *
 * Usa `X-Original-Client-IP`, que Kong rellena con `CF-Connecting-IP` tras
 * borrar el que mande el cliente. No se lee `CF-Connecting-IP` directamente:
 * entre Kong y el backend hay un borde de Cloudflare que lo reescribe. Tampoco
 * se usa `X-Forwarded-For` (vía `trust proxy`): es una lista que el cliente
 * puede falsificar (H-11 de docs/auditoria-seguridad-2026-09.md).
 *
 * El valor solo se acepta si es un único string que, recortado, es una IPv4 o
 * IPv6 según `net.isIP`, sin zone ID (`%`) y de 45 caracteres como máximo (el
 * tamaño de las columnas). En cualquier otro caso devuelve `undefined` y se
 * guarda `null`: sin fallback a `req.ip`, que sería la IP de un proxy.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { isIP } from 'node:net';

const MAX_IP_LENGTH = 45;

export function resolveClientIp(
  originalClientIp: string | string[] | undefined,
): string | undefined {
  if (typeof originalClientIp !== 'string') {
    return undefined;
  }

  const trimmed = originalClientIp.trim();
  if (trimmed.length > MAX_IP_LENGTH || trimmed.includes('%') || isIP(trimmed) === 0) {
    return undefined;
  }

  return trimmed;
}
