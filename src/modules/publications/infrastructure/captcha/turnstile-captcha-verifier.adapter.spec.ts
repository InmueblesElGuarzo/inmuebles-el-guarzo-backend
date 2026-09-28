import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvSchema } from '../../../../shared-kernel/infrastructure/config/env.schema';
import { TurnstileCaptchaVerifierAdapter } from './turnstile-captcha-verifier.adapter';

const SECRET_KEY = 'test-turnstile-secret';
const TOKEN = 'test-captcha-token';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const buildConfigService = (secretKey: string | undefined): ConfigService<EnvSchema, true> =>
  ({ get: jest.fn().mockReturnValue(secretKey) }) as unknown as ConfigService<EnvSchema, true>;

const mockFetchResponse = (payload: unknown): jest.SpyInstance =>
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve(payload),
  } as Response);

describe('TurnstileCaptchaVerifierAdapter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it.each([
      ['ausente', undefined],
      ['vacía', ''],
      ['solo espacios', '   '],
    ])('should throw when TURNSTILE_SECRET_KEY is %s', (_label, secretKey) => {
      expect(() => new TurnstileCaptchaVerifierAdapter(buildConfigService(secretKey))).toThrow(
        'TURNSTILE_SECRET_KEY no está configurada',
      );
    });
  });

  describe('verify', () => {
    let adapter: TurnstileCaptchaVerifierAdapter;

    beforeEach(() => {
      adapter = new TurnstileCaptchaVerifierAdapter(buildConfigService(SECRET_KEY));
    });

    it('should return true and send secret and response when Cloudflare accepts the token', async () => {
      const fetchSpy = mockFetchResponse({ success: true });

      const result = await adapter.verify(TOKEN);

      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(TURNSTILE_VERIFY_URL);
      expect(init.method).toBe('POST');
      const body = init.body as URLSearchParams;
      expect(body.get('secret')).toBe(SECRET_KEY);
      expect(body.get('response')).toBe(TOKEN);
    });

    it('should return false when Cloudflare responds success=false', async () => {
      mockFetchResponse({ success: false, 'error-codes': ['invalid-input-response'] });

      const result = await adapter.verify(TOKEN);

      expect(result).toBe(false);
    });

    it('should return false and log the error when fetch throws', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

      const result = await adapter.verify(TOKEN);

      expect(result).toBe(false);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
