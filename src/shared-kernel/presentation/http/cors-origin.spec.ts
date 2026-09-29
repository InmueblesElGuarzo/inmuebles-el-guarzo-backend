import { isOriginAllowed } from './cors-origin';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://inmuebles-el-guarzo-frontend.vercel.app',
  'https://www.inmuebleselguarzo.com.co',
];

describe('isOriginAllowed', () => {
  it('should allow an origin listed in CORS_ALLOWED_ORIGINS', () => {
    expect(isOriginAllowed('https://www.inmuebleselguarzo.com.co', ALLOWED_ORIGINS)).toBe(true);
  });

  // Comportamiento heredado, pendiente de decisión (H-07).
  it('should allow requests without Origin header', () => {
    expect(isOriginAllowed(undefined, ALLOWED_ORIGINS)).toBe(true);
  });

  it.each([
    ['deployment', 'https://inmuebles-el-guarzo-frontend-abc123-inmuebles-el-guarzo.vercel.app'],
    ['rama', 'https://inmuebles-el-guarzo-frontend-git-feature-x-inmuebles-el-guarzo.vercel.app'],
  ])('should allow a Vercel preview (%s) of the business team', (_label, origin) => {
    expect(isOriginAllowed(origin, ALLOWED_ORIGINS)).toBe(true);
  });

  it.each([
    ['vercel.app de otro proyecto', 'https://atacante.vercel.app'],
    ['origen fuera de toda lista', 'https://evil.example.com'],
    [
      'mismo proyecto en otro team',
      'https://inmuebles-el-guarzo-frontend-abc123-atacante.vercel.app',
    ],
    [
      'sufijo añadido',
      'https://inmuebles-el-guarzo-frontend-abc123-inmuebles-el-guarzo.vercel.app.evil.com',
    ],
    ['esquema http', 'http://inmuebles-el-guarzo-frontend-abc123-inmuebles-el-guarzo.vercel.app'],
    [
      'prefijo añadido',
      'https://evil-inmuebles-el-guarzo-frontend-abc123-inmuebles-el-guarzo.vercel.app',
    ],
  ])('should reject %s', (_label, origin) => {
    expect(isOriginAllowed(origin, ALLOWED_ORIGINS)).toBe(false);
  });
});
