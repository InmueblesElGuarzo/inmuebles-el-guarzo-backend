import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { ClientIp } from './client-ip.decorator';

type ParamFactory = (data: unknown, ctx: ExecutionContext) => unknown;

// Nest guarda la factory del decorator en la metadata del handler
function getClientIpFactory(): ParamFactory {
  class TestController {
    public handler(@ClientIp() _clientIp: string | undefined): void {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'handler') as Record<
    string,
    { factory: ParamFactory }
  >;
  return Object.values(args)[0].factory;
}

function buildContext(headers: Record<string, string | string[]>, ip?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers, ip }),
    }),
  } as unknown as ExecutionContext;
}

describe('ClientIp decorator', () => {
  const factory = getClientIpFactory();

  it('should return CF-Connecting-IP when it is a valid IP', () => {
    const ctx = buildContext({ 'cf-connecting-ip': '1.2.3.4' }, '10.0.0.1');

    expect(factory(undefined, ctx)).toBe('1.2.3.4');
  });

  it('should fall back to request.ip when CF-Connecting-IP is missing', () => {
    const ctx = buildContext({}, '10.0.0.1');

    expect(factory(undefined, ctx)).toBe('10.0.0.1');
  });

  it('should fall back to request.ip when CF-Connecting-IP is invalid', () => {
    const ctx = buildContext({ 'cf-connecting-ip': '1.2.3.4, 5.6.7.8' }, '10.0.0.1');

    expect(factory(undefined, ctx)).toBe('10.0.0.1');
  });

  it('should ignore X-Forwarded-For', () => {
    const ctx = buildContext({ 'x-forwarded-for': '9.9.9.9' }, '10.0.0.1');

    expect(factory(undefined, ctx)).toBe('10.0.0.1');
  });

  it('should return undefined when neither the header nor request.ip are valid', () => {
    const ctx = buildContext({});

    expect(factory(undefined, ctx)).toBeUndefined();
  });
});
