/**
 * EnvSchema — Esquema de las variables de entorno que la aplicación
 * necesita para arrancar.
 *
 * La validación se ejecuta al bootstrap (antes de que NestJS levante
 * controllers o providers). Si una variable falta o es invalida, el
 * proceso falla con un mensaje claro y NO arranca. Esto previene la
 * categoria de bugs donde la app levanta y crashea en runtime al
 * primer request.
 *
 * Como agregar una nueva variable:
 *  1. Anadir un campo aqui con su decorador de class-validator.
 *  2. Anadirla al .env local y al .env.example.
 *  3. En produccion, anadirla a Doppler (cuando lo configuremos).
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class EnvSchema {
  // Entorno de ejecucion. NestJS y muchas librerias cambian
  // comportamiento segun este valor (logs verbose en dev, optimizaciones
  // en prod, mocks en test).
  @IsIn(['development', 'test', 'production'])
  NODE_ENV!: 'development' | 'test' | 'production';

  // Origenes permitidos por CORS, separados por coma. main.ts la parsea a
  // un array. Determina que frontends pueden llamar a la API con
  // credenciales, por eso vive aqui y no hardcodeada.
  @IsString()
  @IsNotEmpty()
  CORS_ALLOWED_ORIGINS!: string;

  // Conexion a Postgres (Neon en este proyecto). Prisma la consume
  // automaticamente via `env("DATABASE_URL")` en el schema.
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  // URL base del proyecto de Supabase. La usaremos si en el futuro el
  // backend necesita hacer admin operations contra la API de Supabase
  // (no en este hito).
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  SUPABASE_URL!: string;

  // Anon key publica de Supabase. Identifica al proyecto en llamadas
  // al backend de Supabase. NO es secreta en sentido criptografico —
  // esta disenada para exponerse al frontend.
  @IsString()
  @IsNotEmpty()
  SUPABASE_ANON_KEY!: string;

  @IsString()
  @IsNotEmpty()
  TURNSTILE_SECRET_KEY!: string;

  // Service role key. ESTA SI es secreta y otorga privilegios totales
  // sobre el proyecto de Supabase. NUNCA debe llegar al frontend ni a
  // logs. En este hito el backend no la usa, pero la dejamos validada
  // para estar listos cuando construyamos creacion administrativa de
  // asesores (HU-05).
  @IsString()
  @IsNotEmpty()
  SUPABASE_SERVICE_ROLE_KEY!: string;

  // Endpoint JWKS publico de Supabase con las claves publicas para
  // verificar firmas de JWTs. Lo consume `jose.createRemoteJWKSet`,
  // que cachea las claves y maneja rotacion automaticamente.
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  SUPABASE_JWKS_URL!: string;

  // Sentry DSN para captura de errores en producción.
  // Opcional: si no está presente, Sentry se deshabilita automáticamente.
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  SENTRY_DSN?: string;

  // Token de BetterStack para envío de logs estructurados.
  // Opcional: si no está presente, los logs solo van a stdout.
  @IsOptional()
  @IsString()
  BETTERSTACK_SOURCE_TOKEN?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY?: string;

  // Direccion "From" con la que Resend envia los correos transaccionales.
  // Debe ser un dominio verificado en Resend. Requerida: sin remitente
  // valido no se puede enviar correo, y no queremos un fallback silencioso
  // a un dominio equivocado.
  @IsString()
  @IsNotEmpty()
  RESEND_FROM_ADDRESS!: string;

  @IsString()
  @IsNotEmpty()
  UPSTASH_REDIS_REST_URL!: string;

  @IsString()
  @IsNotEmpty()
  UPSTASH_REDIS_REST_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  NOVU_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  NOVU_APP_ID!: string;

  @IsString()
  @IsNotEmpty()
  KONG_SECRET!: string;
}
