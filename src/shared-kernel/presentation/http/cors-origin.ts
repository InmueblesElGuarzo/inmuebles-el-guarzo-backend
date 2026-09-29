/**
 * isOriginAllowed — Decide si un origen puede llamar a la API vía CORS.
 *
 * Se permite:
 *  - Peticiones sin header `Origin` (curl, server-to-server). Comportamiento
 *    heredado, pendiente de decisión (H-07 de docs/auditoria-seguridad-2026-09.md).
 *  - Orígenes listados en `CORS_ALLOWED_ORIGINS`.
 *  - Previews de Vercel del frontend, solo del team del negocio.
 *
 * El patrón de previews está anclado con `^`/`$` y exige el slug del team al
 * final: el nombre de proyecto en Vercel es único por team, no global, así que
 * sin el sufijo cualquiera podría crear un proyecto con el mismo nombre en su
 * propio team y sus previews pasarían la validación.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

// <proyecto>-<hash-o-git-rama>-<team>.vercel.app
const VERCEL_PREVIEW_ORIGIN =
  /^https:\/\/inmuebles-el-guarzo-frontend-[a-z0-9-]+-inmuebles-el-guarzo\.vercel\.app$/;

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: readonly string[],
): boolean {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin) || VERCEL_PREVIEW_ORIGIN.test(origin);
}
