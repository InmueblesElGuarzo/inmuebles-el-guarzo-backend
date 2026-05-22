import { Maybe } from '../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';
import { UserLoggedIn } from '../events/user-logged-in.event';
import { UserProfileCreated } from '../events/user-profile-created.event';
import { InactiveUserCannotLoginException } from '../exceptions/inactive-user-cannot-login.exception';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { UserRole } from '../value-objects/user-role.value-object';
import { UserProfile } from './user-profile.aggregate';

const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

type CreateInput = Parameters<typeof UserProfile.create>[0];
type PersistenceProps = Parameters<typeof UserProfile.fromPersistence>[0];

const buildCreateInput = (): CreateInput => ({
  id: UniqueId.fromString(TEST_UUID),
  email: Email.create('admin@guarzo.com'),
  fullName: FullName.create('Samuel Giraldo'),
  phone: Maybe.none<string>(),
  role: UserRole.admin(),
});

const buildPersistenceProps = (overrides?: { isActive?: boolean }): PersistenceProps => ({
  id: UniqueId.fromString(TEST_UUID),
  email: Email.create('admin@guarzo.com'),
  fullName: FullName.create('Samuel Giraldo'),
  phone: Maybe.none<string>(),
  role: UserRole.admin(),
  isActive: overrides?.isActive ?? true,
  lastLoginAt: Maybe.none<Date>(),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('UserProfile.create — domain events', () => {
  it('should emit exactly one UserProfileCreated event', () => {
    const profile = UserProfile.create(buildCreateInput());
    const events = profile.peekDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserProfileCreated);
  });

  it('should include the correct email and role in UserProfileCreated', () => {
    const profile = UserProfile.create(buildCreateInput());
    const event = profile.peekDomainEvents()[0] as UserProfileCreated;

    expect(event.email).toBe('admin@guarzo.com');
    expect(event.role).toBe('ADMIN');
  });

  it('should initialize the profile as active with no lastLoginAt', () => {
    const profile = UserProfile.create(buildCreateInput());

    expect(profile.isActive).toBe(true);
    expect(profile.lastLoginAt.isAbsent()).toBe(true);
  });
});

describe('UserProfile.fromPersistence — no domain events', () => {
  it('should not emit any domain events on reconstruction', () => {
    const profile = UserProfile.fromPersistence(buildPersistenceProps());

    expect(profile.peekDomainEvents()).toHaveLength(0);
  });

  it('should restore id, email, role and isActive from props', () => {
    const profile = UserProfile.fromPersistence(buildPersistenceProps());

    expect(profile.id.value).toBe(TEST_UUID);
    expect(profile.email.value).toBe('admin@guarzo.com');
    expect(profile.role.value).toBe('ADMIN');
    expect(profile.isActive).toBe(true);
  });
});

describe('UserProfile.recordLogin — active user', () => {
  it('should emit exactly one UserLoggedIn event', () => {
    const profile = UserProfile.fromPersistence(buildPersistenceProps());
    profile.recordLogin();
    const events = profile.peekDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserLoggedIn);
  });

  it('should set lastLoginAt to a present value close to now', () => {
    const before = new Date();
    const profile = UserProfile.fromPersistence(buildPersistenceProps());
    profile.recordLogin();
    const after = new Date();

    expect(profile.lastLoginAt.isPresent()).toBe(true);
    expect(profile.lastLoginAt.value.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(profile.lastLoginAt.value.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('UserProfile.recordLogin — inactive user', () => {
  it('should throw InactiveUserCannotLoginException', () => {
    const profile = UserProfile.fromPersistence(buildPersistenceProps({ isActive: false }));

    expect(() => profile.recordLogin()).toThrow(InactiveUserCannotLoginException);
  });

  it('should include the userId in the exception message', () => {
    const profile = UserProfile.fromPersistence(buildPersistenceProps({ isActive: false }));

    expect(() => profile.recordLogin()).toThrow(TEST_UUID);
  });
});
