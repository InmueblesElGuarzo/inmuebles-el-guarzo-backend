import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { EnvSchema } from './shared-kernel/infrastructure/config/env.schema';
import { DomainExceptionFilter } from './shared-kernel/presentation/filters/domain-exception.filter';
import { PrismaExceptionFilter } from './shared-kernel/presentation/filters/prisma-exception.filter';
import { isOriginAllowed } from './shared-kernel/presentation/http/cors-origin';
import { setupSwagger } from './shared-kernel/presentation/http/swagger.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');
  app.use(helmet());

  const configService = app.get(ConfigService<EnvSchema, true>);
  const allowedOrigins = configService
    .get('CORS_ALLOWED_ORIGINS', { infer: true })
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter(), new PrismaExceptionFilter());

  setupSwagger(app, configService.get('NODE_ENV', { infer: true }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

void bootstrap();
