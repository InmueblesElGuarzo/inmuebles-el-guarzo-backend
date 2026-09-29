import { timingSafeEqual } from 'node:crypto';

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvSchema } from '../../../infrastructure/config/env.schema';
import { KongGatewayGuard } from './kong-gateway.guard';

jest.mock('node:crypto', () => {
  const actual = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return { ...actual, timingSafeEqual: jest.fn(actual.timingSafeEqual) };
});

const KONG_SECRET = 'test-kong-secret';
const PROTECTED_PATH = '/api/v1/publications';
const HEALTH_PATH = '/api/v1/health';

const timingSafeEqualMock = timingSafeEqual as jest.MockedFunction<typeof timingSafeEqual>;

const buildConfigService = (secret: string): ConfigService<EnvSchema, true> =>
  ({ get: jest.fn().mockReturnValue(secret) }) as unknown as ConfigService<EnvSchema, true>;

const buildContext = (path: string, kongSecret?: string | string[]): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        path,
        headers: kongSecret === undefined ? {} : { 'x-kong-secret': kongSecret },
      }),
    }),
  }) as unknown as ExecutionContext;

describe('KongGatewayGuard', () => {
  let guard: KongGatewayGuard;

  beforeEach(() => {
    timingSafeEqualMock.mockClear();
    guard = new KongGatewayGuard(buildConfigService(KONG_SECRET));
  });

  it('should return true when X-Kong-Secret matches KONG_SECRET', () => {
    expect(guard.canActivate(buildContext(PROTECTED_PATH, KONG_SECRET))).toBe(true);
    expect(timingSafeEqualMock).toHaveBeenCalledTimes(1);
  });

  it('should throw ForbiddenException when the secret differs with the same length', () => {
    const wrongSecret = 'x'.repeat(KONG_SECRET.length);

    expect(() => guard.canActivate(buildContext(PROTECTED_PATH, wrongSecret))).toThrow(
      ForbiddenException,
    );
    expect(timingSafeEqualMock).toHaveBeenCalledTimes(1);
  });

  it('should throw ForbiddenException without calling timingSafeEqual when the length differs', () => {
    expect(() => guard.canActivate(buildContext(PROTECTED_PATH, `${KONG_SECRET}-extra`))).toThrow(
      ForbiddenException,
    );
    expect(timingSafeEqualMock).not.toHaveBeenCalled();
  });

  it.each([
    ['ausente', undefined],
    ['vacío', ''],
    ['duplicado (string[])', [KONG_SECRET, KONG_SECRET]],
  ])('should throw ForbiddenException when X-Kong-Secret is %s', (_label, header) => {
    expect(() => guard.canActivate(buildContext(PROTECTED_PATH, header))).toThrow(
      ForbiddenException,
    );
    expect(timingSafeEqualMock).not.toHaveBeenCalled();
  });

  it('should allow /api/v1/health without comparing the secret', () => {
    expect(guard.canActivate(buildContext(HEALTH_PATH))).toBe(true);
    expect(timingSafeEqualMock).not.toHaveBeenCalled();
  });
});
