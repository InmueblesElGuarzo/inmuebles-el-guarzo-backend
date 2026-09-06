/**
 * seed-first-admin.ts — Crea el primer admin del sistema.
 *
 * Bootstrap externo del primer usuario con rol ADMIN. Idempotente: si
 * el usuario ya existe en Supabase Auth y/o en la tabla user_profiles,
 * lo reusa sin duplicar.
 *
 * Validacion: los datos del admin pasan por los mismos VOs (Email,
 * FullName, UserRole) que la API usa. Si los datos son invalidos, el
 * seed aborta antes de tocar Supabase o la BD.
 *
 * Uso:
 *   1. Setear en .env (temporal, solo para el seed):
 *        SEED_ADMIN_EMAIL="tu@inmuebleselguarzo.com.co"
 *        SEED_ADMIN_FULL_NAME="Tu Nombre Completo"
 *        SEED_ADMIN_PHONE="3001234567"   (opcional)
 *   2. Ejecutar:  pnpm seed:admin
 *   3. Guardar el password aleatorio que se imprime UNA VEZ.
 *   4. Borrar las variables SEED_* del .env.
 */

import { randomBytes } from 'node:crypto';

import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

import { Email } from '../src/shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../src/shared-kernel/domain/value-objects/full-name.value-object';
import { UserRole } from '../src/modules/iam/domain/value-objects/user-role.value-object';

interface SeedConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  adminEmail: string;
  adminFullName: string;
  adminPhone: string | undefined;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${name}. Set it in .env.`);
  }
  return value;
}

function readConfig(): SeedConfig {
  return {
    supabaseUrl: getRequiredEnv('SUPABASE_URL'),
    supabaseServiceKey: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    adminEmail: getRequiredEnv('SEED_ADMIN_EMAIL'),
    adminFullName: getRequiredEnv('SEED_ADMIN_FULL_NAME'),
    adminPhone: process.env.SEED_ADMIN_PHONE,
  };
}

function generatePassword(): string {
  // 24 bytes aleatorios → 32 chars en base64url. 192 bits de entropia.
  // base64url evita caracteres problematicos como /, +, =.
  return randomBytes(24).toString('base64url');
}

async function findOrCreateSupabaseUser(
  supabase: SupabaseClient,
  email: string,
  fullName: string,
): Promise<{ userId: string; password: string | null }> {
  const { data, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  if (listError) {
    throw new Error(`Failed to list Supabase users: ${listError.message}`);
  }

  const existing = data.users.find((u) => u.email === email);
  if (existing) {
    return { userId: existing.id, password: null };
  }

  const password = generatePassword();
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    throw new Error(`Failed to create Supabase user: ${createError?.message ?? 'unknown error'}`);
  }

  return { userId: created.user.id, password };
}

async function upsertUserProfile(
  prisma: PrismaClient,
  userId: string,
  email: string,
  fullName: string,
  phone: string | undefined,
): Promise<void> {
  await prisma.userProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      fullName,
      phone: phone ?? null,
      role: 'ADMIN',
      isActive: true,
    },
    update: {
      // Idempotencia: re-correr garantiza ADMIN + activo, pero NO
      // sobrescribe fullName, phone ni email. Si esos cambian, se
      // hace via API cuando exista el endpoint correspondiente.
      role: 'ADMIN',
      isActive: true,
    },
  });
}

function printPasswordSummary(password: string | null): void {
  if (password === null) {
    console.log('Existing user found — password unchanged.');
    console.log('If you lost it, use Supabase password recovery flow.');
  } else {
    console.log('IMPORTANT — Initial password (will NOT be shown again):');
    console.log();
    console.log(`    ${password}`);
    console.log();
    console.log('Save this NOW in your password manager.');
    console.log('Use it for first login. Then change it via Supabase auth flow.');
  }
  console.log();
  console.log('REMINDER: Remove SEED_ADMIN_EMAIL, SEED_ADMIN_FULL_NAME and');
  console.log('SEED_ADMIN_PHONE from your .env file now that the seed is done.');
}

function logValidatedData(
  email: Email,
  fullName: FullName,
  role: UserRole,
  phone: string | undefined,
): void {
  console.log(`  Email: ${email.value}`);
  console.log(`  Name:  ${fullName.value}`);
  console.log(`  Role:  ${role.value}`);
  if (phone !== undefined) {
    console.log(`  Phone: ${phone}`);
  }
}

async function main(): Promise<void> {
  console.log('=== Seed: First Admin ===');
  console.log();

  const config = readConfig();

  console.log('Validating data through domain VOs...');
  const email = Email.create(config.adminEmail);
  const fullName = FullName.create(config.adminFullName);
  const role = UserRole.admin();
  logValidatedData(email, fullName, role, config.adminPhone);
  console.log();

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket }, // Evita warning de ws en consola, aunque no usemos realtime en este script
  });

  console.log('Provisioning Supabase auth user...');
  const { userId, password } = await findOrCreateSupabaseUser(
    supabase,
    email.value,
    fullName.value,
  );
  console.log(`  User ID: ${userId}`);
  console.log(`  Status:  ${password === null ? 'ALREADY EXISTED (skipped)' : 'CREATED'}`);
  console.log();

  console.log('Upserting UserProfile in Postgres...');
  const prisma = new PrismaClient();
  try {
    await upsertUserProfile(prisma, userId, email.value, fullName.value, config.adminPhone);
    console.log('  Done.');
    console.log();
  } finally {
    await prisma.$disconnect();
  }

  console.log('=== Seed completed successfully ===');
  console.log();
  printPasswordSummary(password);
}

main().catch((error: unknown) => {
  console.error();
  console.error('=== Seed FAILED ===');
  console.error(error);
  process.exit(1);
});
