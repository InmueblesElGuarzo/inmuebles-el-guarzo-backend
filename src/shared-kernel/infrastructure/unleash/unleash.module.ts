/**
 * UnleashModule — Módulo global que provee el UnleashService.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Global, Module } from '@nestjs/common';
import { UnleashService } from './unleash.service';

@Global()
@Module({
  providers: [UnleashService],
  exports: [UnleashService],
})
export class UnleashModule {}
