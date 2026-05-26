/**
 * I18nModule — Módulo global que provee el I18nService.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Global, Module } from '@nestjs/common';
import { I18nService } from './i18n.service';

@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
