import { Controller, Get, INestApplication, LoggerService } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import helmet from 'helmet';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';

import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { PrismaExceptionFilter } from '../filters/prisma-exception.filter';

import {
  createCorsOptions,
  createCorsRejectionLogger,
  MAX_LOGGED_ORIGIN_LENGTH,
} from './cors-options';

// La misma instancia de @sentry/core que usa SentryGlobalFilter (con pnpm no
// es dependencia directa, así que se resuelve desde @sentry/nestjs).
type SentryCore = { captureException: (exception: unknown) => string };
const sentryCore = jest.requireActual<SentryCore>(
  require.resolve('@sentry/core', { paths: [require.resolve('@sentry/nestjs/setup')] }),
);

const ALLOWED_ORIGIN = 'https://www.inmuebleselguarzo.com.co';
const REJECTED_ORIGIN = 'https://evil.example.com';
const FORBIDDEN_BODY = { message: 'Origin not allowed', error: 'Forbidden', statusCode: 403 };

const controllerHandler = jest.fn(() => ({ ok: true }));
const onReject = jest.fn();

@Controller('ping')
class PingController {
  @Get()
  public ping(): { ok: boolean } {
    return controllerHandler();
  }
}

// Misma cadena que main.ts: prefijo, helmet, CORS y filtros globales.
async function createApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    controllers: [PingController],
    providers: [{ provide: APP_FILTER, useClass: SentryGlobalFilter }],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors(createCorsOptions([ALLOWED_ORIGIN], onReject));
  app.useGlobalFilters(new DomainExceptionFilter(), new PrismaExceptionFilter());
  await app.init();
  return app;
}

function send(
  app: INestApplication<App>,
  method: 'GET' | 'OPTIONS',
  origin?: string,
): Promise<Response> {
  const server = app.getHttpServer();
  const req =
    method === 'GET'
      ? request(server).get('/api/v1/ping')
      : request(server).options('/api/v1/ping').set('Access-Control-Request-Method', 'GET');
  return origin ? req.set('Origin', origin) : req;
}

function corsHeaders(res: Response): string[] {
  return Object.keys(res.headers).filter((name) => name.startsWith('access-control-'));
}

describe('createCorsOptions', () => {
  let app: INestApplication<App>;
  let captureException: jest.SpyInstance;

  beforeAll(async () => {
    app = await createApp();
    captureException = jest.spyOn(sentryCore, 'captureException');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    captureException.mockRestore();
    await app.close();
  });

  it('should allow a listed origin with its CORS headers', async () => {
    const res = await send(app, 'GET', ALLOWED_ORIGIN);

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(controllerHandler).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
  });

  it('should answer the preflight of a listed origin', async () => {
    const res = await send(app, 'OPTIONS', ALLOWED_ORIGIN);

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(onReject).not.toHaveBeenCalled();
  });

  // Decisión de H-07: sin Origin se permite.
  it('should allow requests without Origin header', async () => {
    const res = await send(app, 'GET');

    expect(res.status).toBe(200);
    expect(controllerHandler).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
  });

  it.each(['GET', 'OPTIONS'] as const)(
    'should reject a %s from a non-allowed origin with a clean 403',
    async (method) => {
      const res = await send(app, method, REJECTED_ORIGIN);

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN_BODY);
      expect(corsHeaders(res)).toEqual([]);
      expect(controllerHandler).not.toHaveBeenCalled();
      expect(captureException).not.toHaveBeenCalled();
      expect(onReject).toHaveBeenCalledWith(REJECTED_ORIGIN);
    },
  );
});

describe('createCorsRejectionLogger', () => {
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn<void, [{ msg: string; origin: string }, string]>(),
  } satisfies LoggerService;
  const logRejection = createCorsRejectionLogger(logger);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log the rejected origin as a structured warning', () => {
    logRejection(REJECTED_ORIGIN);

    expect(logger.warn).toHaveBeenCalledWith(
      { msg: 'Origen rechazado por CORS', origin: REJECTED_ORIGIN },
      'CORS',
    );
  });

  it(`should truncate the origin to ${MAX_LOGGED_ORIGIN_LENGTH} characters`, () => {
    const longOrigin = `https://${'a'.repeat(500)}.example.com`;

    logRejection(longOrigin);

    const loggedOrigin = logger.warn.mock.calls[0][0].origin;
    expect(loggedOrigin).toHaveLength(MAX_LOGGED_ORIGIN_LENGTH);
    expect(longOrigin.startsWith(loggedOrigin)).toBe(true);
  });
});
