import { Global, Module } from '@nestjs/common';

import { EVENT_BUS } from './infrastructure/event-bus/event-bus.port';
import { InMemoryEventBus } from './infrastructure/event-bus/in-memory-event-bus';
import { I18nModule } from './infrastructure/i18n/i18n.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { UnleashModule } from './infrastructure/unleash/unleash.module';
import { FeatureFlagsController } from './presentation/http/controllers/feature-flags.controller';
import { HealthController } from './presentation/http/controllers/health.controller';

@Global()
@Module({
  imports: [I18nModule, UnleashModule],
  controllers: [HealthController, FeatureFlagsController],
  providers: [
    PrismaService,
    {
      provide: EVENT_BUS,
      useClass: InMemoryEventBus,
    },
  ],
  exports: [PrismaService, EVENT_BUS],
})
export class SharedKernelModule {}
