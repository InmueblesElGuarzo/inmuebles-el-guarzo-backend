import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared-kernel/presentation/filters/domain-exception.filter';
import { PrismaExceptionFilter } from './shared-kernel/presentation/filters/prisma-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');
  app.use(helmet());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://inmuebles-el-guarzo-frontend.vercel.app',
      'https://www.inmuebleselguarzo.com',
    ],
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Inmuebles El Guarzo API')
    .setDescription('API del backend de Inmuebles El Guarzo v2.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

void bootstrap();
