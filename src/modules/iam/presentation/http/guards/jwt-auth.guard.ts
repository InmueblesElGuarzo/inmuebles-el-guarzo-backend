/**
 * JwtAuthGuard — Guard global que valida el JWT de Supabase en cada
 * request entrante.
 *
 * Flujo:
 *   1. Si la ruta tiene @Public(), bypassa.
 *   2. Extrae el token del header Authorization: Bearer <token>.
 *   3. Lo verifica vía IdentityProviderPort (SupabaseAuthAdapter).
 *   4. Consulta UserProfileRepositoryPort para obtener el rol real de BD.
 *   5. Adjunta el AuthenticatedUser (con rol de BD) al request.
 *
 * Las fallas (token ausente, mal formado, invalido, expirado, perfil
 * inexistente) lanzan InvalidAuthTokenException → HTTP 401.
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../../../../../shared-kernel/presentation/decorators/public.decorator';
import {
  AuthenticatedUser,
  IDENTITY_PROVIDER,
  IdentityProviderPort,
} from '../../../application/ports/output/identity-provider.port';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepositoryPort,
} from '../../../application/ports/output/user-profile.repository.port';
import { InvalidAuthTokenException } from '../../../domain/exceptions/invalid-auth-token.exception';

interface AuthenticatedRequest extends Request {
  authenticatedUser?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProviderPort,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepositoryPort,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = JwtAuthGuard.extractBearerToken(request);

    if (token === undefined) {
      throw new InvalidAuthTokenException('missing or malformed Authorization header');
    }

    const jwtUser = await this.identityProvider.verifyToken(token);
    const profileMaybe = await this.userProfileRepository.findById(jwtUser.id);

    if (profileMaybe.isAbsent()) {
      throw new InvalidAuthTokenException('user profile not found');
    }

    request.authenticatedUser = {
      id: jwtUser.id,
      email: jwtUser.email,
      role: profileMaybe.value.role.value,
    };

    return true;
  }

  private static extractBearerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (header === undefined) {
      return undefined;
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
      return undefined;
    }
    return token;
  }
}
