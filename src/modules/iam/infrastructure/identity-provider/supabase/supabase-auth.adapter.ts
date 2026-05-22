/**
 * SupabaseAuthAdapter — Implementacion de IdentityProviderPort que
 * verifica JWTs emitidos por Supabase Auth.
 *
 * Mecanica:
 *   1. Recibe un JWT crudo (sin "Bearer ", el guard ya lo despoja).
 *   2. Verifica firma usando JWKS publico de Supabase (claves
 *      asimetricas ECDSA P-256, algoritmo ES256). `jose` cachea las
 *      claves automaticamente y maneja rotacion sin que tengamos que
 *      preocuparnos.
 *   3. Verifica claims: exp (no expirado), iss (issuer correcto),
 *      aud ('authenticated'), sub (presente), email (presente).
 *   4. Construye un AuthenticatedUser con VOs (UniqueId, Email).
 *   5. Lanza InvalidAuthTokenException con razon descriptiva ante
 *      cualquier fallo. La razon queda en logs (Sentry, Better Stack)
 *      para diagnostico interno; el frontend solo ve el code
 *      'IAM.INVALID_AUTH_TOKEN'.
 *
 * Decision de seguridad: whitelisting explicito de algoritmo ES256.
 * Esto previene "algorithm confusion attacks" donde un atacante
 * intenta forzar la verificacion con otro algoritmo (por ejemplo
 * HS256 usando la clave publica como secreto). Si Supabase rotara
 * a otro algoritmo, lo actualizamos aqui en una linea.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';

import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { EnvSchema } from '../../../../../shared-kernel/infrastructure/config/env.schema';

import {
  AuthenticatedUser,
  IdentityProviderPort,
} from '../../../application/ports/output/identity-provider.port';
import { InvalidAuthTokenException } from '../../../domain/exceptions/invalid-auth-token.exception';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';

@Injectable()
export class SupabaseAuthAdapter implements IdentityProviderPort {
  private static readonly EXPECTED_AUDIENCE = 'authenticated';
  private static readonly EXPECTED_ALGORITHM = 'ES256';

  private readonly jwks: jose.JWTVerifyGetKey;
  private readonly issuer: string;

  public constructor(configService: ConfigService<EnvSchema, true>) {
    const jwksUrl = configService.get('SUPABASE_JWKS_URL', { infer: true });
    const supabaseUrl = configService.get('SUPABASE_URL', { infer: true });

    // jose cachea internamente las claves por su `kid` y refresca
    // automaticamente cuando ve un kid desconocido. No necesitamos
    // logica de cache propia.
    this.jwks = jose.createRemoteJWKSet(new URL(jwksUrl));

    // El issuer de Supabase es el SUPABASE_URL + "/auth/v1". El claim
    // `iss` del JWT debe coincidir EXACTAMENTE con este string.
    this.issuer = `${supabaseUrl}/auth/v1`;
  }

  public async verifyToken(rawJwt: string): Promise<AuthenticatedUser> {
    const payload = await this.verifyAndExtractPayload(rawJwt);
    const id = SupabaseAuthAdapter.extractSub(payload);
    const email = SupabaseAuthAdapter.extractEmail(payload);
    return { id, email };
  }

  private async verifyAndExtractPayload(rawJwt: string): Promise<jose.JWTPayload> {
    try {
      const { payload } = await jose.jwtVerify(rawJwt, this.jwks, {
        issuer: this.issuer,
        audience: SupabaseAuthAdapter.EXPECTED_AUDIENCE,
        algorithms: [SupabaseAuthAdapter.EXPECTED_ALGORITHM],
      });
      return payload;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      throw new InvalidAuthTokenException(reason);
    }
  }

  private static extractSub(payload: jose.JWTPayload): UniqueId {
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new InvalidAuthTokenException('missing or invalid sub claim');
    }
    try {
      return UniqueId.fromString(payload.sub);
    } catch {
      throw new InvalidAuthTokenException(`sub claim is not a valid UUID: "${payload.sub}"`);
    }
  }

  private static extractEmail(payload: jose.JWTPayload): Email {
    const rawEmail = payload['email'];
    if (typeof rawEmail !== 'string' || rawEmail.length === 0) {
      throw new InvalidAuthTokenException('missing or invalid email claim');
    }
    try {
      return Email.create(rawEmail);
    } catch {
      throw new InvalidAuthTokenException(`email claim has invalid format: "${rawEmail}"`);
    }
  }
}
