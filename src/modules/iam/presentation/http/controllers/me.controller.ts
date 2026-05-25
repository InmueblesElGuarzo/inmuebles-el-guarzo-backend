/**
 * MeController — Endpoint GET /me.
 *
 * Devuelve el perfil completo del usuario autenticado actual. El
 * JwtAuthGuard global ya valido el JWT y poblo el request; este controller
 * solo extrae el userId y delega al interactor.
 *
 * Si el JWT es valido pero el UserProfile no existe en BD (caso raro:
 * usuario creado en Supabase fuera del flujo de la app), el interactor
 * lanza UserProfileNotProvisionedException → 404.
 */

import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthenticatedUser } from '../../../application/ports/output/identity-provider.port';
import {
  GET_CURRENT_USER_INPUT_PORT,
  GetCurrentUserInputPort,
} from '../../../application/use-cases/get-current-user/dtos/get-current-user.input-port';

import { CurrentUser } from '../decorators/current-user.decorator';
import { MeHttpResponse, MePresenter } from '../presenters/me.presenter';

@ApiTags('IAM')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(
    @Inject(GET_CURRENT_USER_INPUT_PORT)
    private readonly getCurrentUser: GetCurrentUserInputPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiOkResponse({ type: MeHttpResponse })
  public async getMe(@CurrentUser() user: AuthenticatedUser): Promise<MeHttpResponse> {
    const result = await this.getCurrentUser.execute({ userId: user.id });

    if (result.isFailure) {
      throw result.error;
    }

    return MePresenter.toHttp(result.value);
  }
}
