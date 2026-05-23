import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { UserProfileRepositoryPort } from '../../../application/ports/output/user-profile.repository.port';
import { UserProfile } from '../../../domain/aggregates/user-profile.aggregate';
import { UserProfileNotProvisionedException } from '../../../domain/exceptions/user-profile-not-provisioned.exception';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { UserRole } from '../../../domain/value-objects/user-role.value-object';
import { GetCurrentUserInteractor } from './get-current-user.interactor';

const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';
const MISSING_UUID = '550e8400-e29b-41d4-a716-446655440001';

const buildProfile = (): UserProfile =>
  UserProfile.fromPersistence({
    id: UniqueId.fromString(TEST_UUID),
    email: Email.create('admin@guarzo.com'),
    fullName: FullName.create('Samuel Giraldo'),
    phone: Maybe.none(),
    role: UserRole.admin(),
    isActive: true,
    lastLoginAt: Maybe.none(),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const buildMockRepo = (): jest.Mocked<UserProfileRepositoryPort> => ({
  findById: jest.fn(),
  save: jest.fn(),
});

describe('GetCurrentUserInteractor.execute — profile found', () => {
  it('should return success result with mapped output when profile exists', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.some(buildProfile()));

    const interactor = new GetCurrentUserInteractor(repo);
    const result = await interactor.execute({ userId: UniqueId.fromString(TEST_UUID) });

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(TEST_UUID);
    expect(result.value.email).toBe('admin@guarzo.com');
    expect(result.value.role).toBe('ADMIN');
    expect(result.value.isActive).toBe(true);
  });

  it('should map phone as undefined when profile has no phone', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.some(buildProfile()));

    const interactor = new GetCurrentUserInteractor(repo);
    const result = await interactor.execute({ userId: UniqueId.fromString(TEST_UUID) });

    expect(result.isSuccess).toBe(true);
    expect(result.value.phone).toBeUndefined();
  });

  it('should map lastLoginAt as undefined when profile has no lastLoginAt', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.some(buildProfile()));

    const interactor = new GetCurrentUserInteractor(repo);
    const result = await interactor.execute({ userId: UniqueId.fromString(TEST_UUID) });

    expect(result.isSuccess).toBe(true);
    expect(result.value.lastLoginAt).toBeUndefined();
  });
});

describe('GetCurrentUserInteractor.execute — profile not found', () => {
  it('should return failure result with UserProfileNotProvisionedException', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.none());

    const interactor = new GetCurrentUserInteractor(repo);
    const result = await interactor.execute({ userId: UniqueId.fromString(MISSING_UUID) });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UserProfileNotProvisionedException);
  });

  it('should include the userId in the exception message', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.none());

    const interactor = new GetCurrentUserInteractor(repo);
    const result = await interactor.execute({ userId: UniqueId.fromString(MISSING_UUID) });

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain(MISSING_UUID);
  });
});
