/**
 * resolveClientIp — IP del visitante para la evidencia de consentimiento
 * (Ley 1581): `submittedFromIp` y `consentIp`.
 *
 * Usa `CF-Connecting-IP`, un valor único que pone Cloudflare. No se usa
 * `X-Forwarded-For` (vía `trust proxy`): es una lista que el cliente puede
 * falsificar (H-11 de docs/auditoria-seguridad-2026-09.md).
 *
 * Un valor solo se acepta si, recortado, es una IPv4 o IPv6 según `net.isIP`,
 * sin zone ID (`%`) y de 45 caracteres como máximo (el tamaño de las columnas).
 * Si el header no es válido se usa `fallbackIp` con la misma validación; si
 * tampoco lo es, devuelve `undefined`.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { isIP } from 'node:net';

const MAX_IP_LENGTH = 45;

function toValidIp(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length > MAX_IP_LENGTH || trimmed.includes('%') || isIP(trimmed) === 0) {
    return undefined;
  }

  return trimmed;
}

export function resolveClientIp(
  cfConnectingIp: string | string[] | undefined,
  fallbackIp: string | undefined,
): string | undefined {
  const fromHeader = typeof cfConnectingIp === 'string' ? toValidIp(cfConnectingIp) : undefined;

  return fromHeader ?? toValidIp(fallbackIp);
}
