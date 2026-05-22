/**
 * IdentityProviderPort — Puerto de salida del modulo IAM hacia el
 * Identity Provider externo.
 *
 * En este proyecto el IdP concreto es Supabase Auth, pero este puerto
 * NO lo sabe. Si manana migramos a Auth0, Cognito, Keycloak o auth
 * casero: escribimos un nuevo adapter, cambiamos el binding del modulo,
 * y to do lo demas sigue igual. Cero cambios al dominio, a los
 * interactors o a los controllers.
 *
 * Responsabilidad unica: dado un JWT crudo (el Bearer token que viene
 * en el header Authorization), validar firma y claims, y retornar la
 * identidad autenticada — o lanzar InvalidAuthTokenException si algo
 * falla.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';

import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';

/**
 * Datos minimos que el IdP retorna sobre un usuario autenticado.
 *
 * Solo incluye lo que IAM necesita para hacer su trabajo (provisioning
 * y resolucion del UserProfile local). NO incluye claims especificos
 * del proveedor (aud, iss, role tecnico del JWT) porque eso es detalle
 * de implementacion del adapter y no debe filtrarse al dominio.
 */
export interface AuthenticatedUser {
  id: UniqueId;
  email: Email;
}

export interface IdentityProviderPort {
  /**
   * Verifica un JWT y retorna la identidad autenticada si es valido.
   *
   * Lanza InvalidAuthTokenException (type=UNAUTHORIZED → HTTP 401) si:
   *   - La firma no verifica contra las claves publicas del IdP (JWKS).
   *   - El token expiro (claim `exp` en el pasado).
   *   - El issuer (claim `iss`) no coincide con el esperado.
   *   - El audience (claim `aud`) no es el esperado.
   *   - Falta algun claim requerido (sub, email).
   *
   * El parametro `rawJwt` es el token tal cual aparece despues de
   * "Bearer " en el header Authorization. El adapter NO se encarga
   * de extraerlo del header; eso es responsabilidad del JwtAuthGuard.
   */
  verifyToken(rawJwt: string): Promise<AuthenticatedUser>;
}

/**
 * Symbol token para inyeccion de dependencias.
 */
export const IDENTITY_PROVIDER = Symbol('IdentityProvider');
