/**
 * FeatureFlagsController — Expone el estado de los feature flags
 * para que el frontend pueda consultarlos.
 *
 * Endpoint público: GET /api/v1/feature-flags
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FEATURE_FLAGS, UnleashService } from '../../../infrastructure/unleash/unleash.service';
import { Public } from '../../../presentation/decorators/public.decorator';

export interface FeatureFlagsResponse {
  showOwnerContact: boolean;
  showExpectedPrice: boolean;
}

@ApiTags('Configuration')
@Controller('feature-flags')
export class FeatureFlagsController {
  public constructor(private readonly unleash: UnleashService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get current feature flags state' })
  @ApiOkResponse({ description: 'Feature flags state' })
  public getFlags(): FeatureFlagsResponse {
    return {
      showOwnerContact: this.unleash.isEnabled(FEATURE_FLAGS.SHOW_OWNER_CONTACT),
      showExpectedPrice: this.unleash.isEnabled(FEATURE_FLAGS.SHOW_EXPECTED_PRICE),
    };
  }
}
