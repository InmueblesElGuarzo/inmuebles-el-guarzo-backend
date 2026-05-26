import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';

import { KongGatewayGuard } from '@shared/presentation/http/guards/kong-gateway.guard';
import { IamModule } from './modules/iam/iam.module';
import { JwtAuthGuard } from './modules/iam/presentation/http/guards/jwt-auth.guard';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { CacheInfrastructureModule } from './shared-kernel/infrastructure/cache/cache.module';
import { validateEnv } from './shared-kernel/infrastructure/config/env.validator';
import { pinoLoggerConfig } from './shared-kernel/infrastructure/logger/pino-logger.config';
import { SharedKernelModule } from './shared-kernel/shared-kernel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    SentryModule.forRoot(),
    LoggerModule.forRoot(pinoLoggerConfig),
    SharedKernelModule,
    CacheInfrastructureModule,
    IamModule,
    PublicationsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: KongGatewayGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
