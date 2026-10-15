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

// request.ip válido en todos los casos: nunca debe usarse
const REQUEST_IP = '10.0.0.1';

describe('ClientIp decorator', () => {
  const factory = getClientIpFactory();

  it('should return X-Original-Client-IP when it is a valid IP', () => {
    const ctx = buildContext({ 'x-original-client-ip': '1.2.3.4' }, REQUEST_IP);

    expect(factory(undefined, ctx)).toBe('1.2.3.4');
  });

  it('should return undefined when X-Original-Client-IP is missing', () => {
    const ctx = buildContext({}, REQUEST_IP);

    expect(factory(undefined, ctx)).toBeUndefined();
  });

  // Kong lo envía vacío cuando la petición no trae CF-Connecting-IP
  it('should return undefined when X-Original-Client-IP is empty', () => {
    const ctx = buildContext({ 'x-original-client-ip': '' }, REQUEST_IP);

    expect(factory(undefined, ctx)).toBeUndefined();
  });

  it('should return undefined when X-Original-Client-IP is invalid', () => {
    const ctx = buildContext({ 'x-original-client-ip': '1.2.3.4, 5.6.7.8' }, REQUEST_IP);

    expect(factory(undefined, ctx)).toBeUndefined();
  });

  it.each([
    ['CF-Connecting-IP', 'cf-connecting-ip'],
    ['X-Forwarded-For', 'x-forwarded-for'],
  ])('should ignore %s', (_label, header) => {
    const ctx = buildContext({ [header]: '9.9.9.9' }, REQUEST_IP);

    expect(factory(undefined, ctx)).toBeUndefined();
  });
});
