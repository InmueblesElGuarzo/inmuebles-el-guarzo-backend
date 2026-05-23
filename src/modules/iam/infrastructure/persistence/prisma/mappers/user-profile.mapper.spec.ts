import { Maybe } from '../../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../../shared-kernel/domain/unique-id.value-object';
import { UserProfile } from '../../../../domain/aggregates/user-profile.aggregate';
import { Email } from '../../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { UserRole } from '../../../../domain/value-objects/user-role.value-object';
import { UserProfileMapper } from './user-profile.mapper';

const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';
const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-02-01T00:00:00.000Z');
const LOGIN_AT = new Date('2026-03-01T00:00:00.000Z');

type PrismaUserProfileModel = Parameters<typeof UserProfileMapper.toDomain>[0];

const buildPrismaModel = (
  overrides?: Partial<Pick<PrismaUserProfileModel, 'phone' | 'lastLoginAt'>>,
): PrismaUserProfileModel => ({
  id: TEST_UUID,
  email: 'admin@guarzo.com',
  fullName: 'Samuel Giraldo',
  role: 'ADMIN',
  phone: null,
  isActive: true,
  lastLoginAt: null,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  ...overrides,
});

describe('UserProfileMapper.toDomain — present optionals', () => {
  it('should map id, email, fullName, role and isActive correctly', () => {
    const profile = UserProfileMapper.toDomain(
      buildPrismaModel({ phone: '+573001234567', lastLoginAt: LOGIN_AT }),
    );

    expect(profile.id.value).toBe(TEST_UUID);
    expect(profile.email.value).toBe('admin@guarzo.com');
    expect(profile.fullName.value).toBe('Samuel Giraldo');
    expect(profile.role.value).toBe('ADMIN');
    expect(profile.isActive).toBe(true);
  });

  it('should map phone and lastLoginAt as present Maybe values', () => {
    const profile = UserProfileMapper.toDomain(
      buildPrismaModel({ phone: '+573001234567', lastLoginAt: LOGIN_AT }),
    );

    expect(profile.phone.isPresent()).toBe(true);
    expect(profile.phone.value).toBe('+573001234567');
    expect(profile.lastLoginAt.isPresent()).toBe(true);
    expect(profile.lastLoginAt.value).toBe(LOGIN_AT);
  });
});

describe('UserProfileMapper.toDomain — null optionals', () => {
  it('should map null phone and lastLoginAt as absent Maybe', () => {
    const profile = UserProfileMapper.toDomain(buildPrismaModel());

    expect(profile.phone.isAbsent()).toBe(true);
    expect(profile.lastLoginAt.isAbsent()).toBe(true);
  });
});

describe('UserProfileMapper.toPersistence — present optionals', () => {
  it('should serialize all fields to a plain persistence object', () => {
    const aggregate = UserProfile.fromPersistence({
      id: UniqueId.fromString(TEST_UUID),
      email: Email.create('admin@guarzo.com'),
      fullName: FullName.create('Samuel Giraldo'),
      role: UserRole.admin(),
      phone: Maybe.some('+573001234567'),
      isActive: true,
      lastLoginAt: Maybe.some(LOGIN_AT),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    const result = UserProfileMapper.toPersistence(aggregate);

    expect(result.id).toBe(TEST_UUID);
    expect(result.email).toBe('admin@guarzo.com');
    expect(result.fullName).toBe('Samuel Giraldo');
    expect(result.role).toBe('ADMIN');
    expect(result.phone).toBe('+573001234567');
    expect(result.lastLoginAt).toBe(LOGIN_AT);
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toBe(CREATED_AT);
    expect(result.updatedAt).toBe(UPDATED_AT);
  });
});

describe('UserProfileMapper.toPersistence — null optionals', () => {
  it('should serialize absent Maybe fields as null', () => {
    const aggregate = UserProfile.fromPersistence({
      id: UniqueId.fromString(TEST_UUID),
      email: Email.create('admin@guarzo.com'),
      fullName: FullName.create('Samuel Giraldo'),
      role: UserRole.admin(),
      phone: Maybe.none(),
      isActive: true,
      lastLoginAt: Maybe.none(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    const result = UserProfileMapper.toPersistence(aggregate);

    expect(result.phone).toBeNull();
    expect(result.lastLoginAt).toBeNull();
  });
});
