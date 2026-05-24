/**
 * CaptchaVerifierPort — Puerto de salida para verificación de tokens CAPTCHA.
 *
 * Desacopla la lógica de aplicación del proveedor concreto de CAPTCHA
 * (Cloudflare Turnstile, Google reCAPTCHA, etc.).
 *
 * → CAPA: Application (Uncle Bob).
 */

export interface CaptchaVerifierPort {
  verify(token: string): Promise<boolean>;
}

export const CAPTCHA_VERIFIER = Symbol('CaptchaVerifier');
