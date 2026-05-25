import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { EventBus } from '../../../../../shared-kernel/infrastructure/event-bus/event-bus.port';
import { PrismaService } from '../../../../../shared-kernel/infrastructure/prisma/prisma.service';
import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { DuplicatePublicationRequestException } from '../../../domain/exceptions/duplicate-publication-request.exception';
import { InvalidCaptchaException } from '../../../domain/exceptions/invalid-captcha.exception';
import { ProposedDescription } from '../../../domain/value-objects/proposed-description.value-object';
import { ProposedLocation } from '../../../domain/value-objects/proposed-location.value-object';
import { PublicationRequestOfferType } from '../../../domain/value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../../../domain/value-objects/publication-request-status.value-object';
import { ReferenceNumber } from '../../../domain/value-objects/reference-number.value-object';
import { CaptchaVerifierPort } from '../../ports/output/captcha-verifier.port';
import { PersonalDataAuthorizationRepositoryPort } from '../../ports/output/personal-data-authorization.repository.port';
import { PublicationRequestRepositoryPort } from '../../ports/output/publication-request.repository.port';
import { SubmitPublicationRequestInteractor } from './submit-publication-request.interactor';

type PrismaMock = { $transaction: jest.Mock };

const REQUEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

const buildMockRepo = (): jest.Mocked<PublicationRequestRepositoryPort> => ({
  findById: jest.fn(),
  findByDedupHash: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  nextReferenceNumber: jest.fn(),
});

const buildMockPersonalDataRepo = (): jest.Mocked<PersonalDataAuthorizationRepositoryPort> => ({
  save: jest.fn(),
});

const buildMockEventBus = (): jest.Mocked<EventBus> => ({
  publish: jest.fn(),
  register: jest.fn(),
});

const buildMockCaptchaVerifier = (): jest.Mocked<CaptchaVerifierPort> => ({
  verify: jest.fn(),
});

const buildMockPrisma = (): PrismaMock => ({
  $transaction: jest.fn(),
});

const buildExistingRequest = (): PublicationRequest =>
  PublicationRequest.fromPersistence({
    id: UniqueId.fromString(REQUEST_UUID),
    referenceNumber: ReferenceNumber.generate(2026, 1),
    ownerFullName: FullName.create('Juan Perez'),
    ownerEmail: Email.create('juan@example.com'),
    ownerPhonePrimary: PhoneNumber.create('3001234567'),
    ownerPhoneSecondary: Maybe.none(),
    ownerDocumentType: Maybe.none(),
    ownerDocumentNumber: Maybe.none(),
    proposedPropertyTypeId: Maybe.none(),
    proposedOfferType: PublicationRequestOfferType.create('SALE'),
    proposedLocation: ProposedLocation.create('Medellín, Antioquia, Colombia'),
    proposedAreaM2: Maybe.none(),
    proposedDescription: ProposedDescription.create(
      'Hermosa casa en el norte de Medellín con amplio jardín.',
    ),
    proposedExpectedPrice: Maybe.none(),
    status: PublicationRequestStatus.create(PublicationRequestStatusValue.PENDING_REVIEW),
    assignedAdvisorId: Maybe.none(),
    decisionAt: Maybe.none(),
    decisionByAdminId: Maybe.none(),
    decisionMotive: Maybe.none(),
    captchaValidated: true,
    submittedFromIp: Maybe.none(),
    submittedFromUserAgent: Maybe.none(),
    dedupHash: 'existing-hash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const VALID_INPUT = {
  ownerFullName: 'Juan Perez',
  ownerEmail: 'juan@example.com',
  ownerPhonePrimary: '3001234567',
  proposedOfferType: 'SALE',
  proposedLocation: 'Medellín, Antioquia, Colombia',
  proposedDescription: 'Hermosa casa en el norte de Medellín con amplio jardín.',
  captchaToken: 'valid-captcha-token',
};

const buildInteractor = (
  repo: jest.Mocked<PublicationRequestRepositoryPort>,
  personalDataRepo: jest.Mocked<PersonalDataAuthorizationRepositoryPort>,
  eventBus: jest.Mocked<EventBus>,
  captchaVerifier: jest.Mocked<CaptchaVerifierPort>,
  prisma: PrismaMock,
): SubmitPublicationRequestInteractor =>
  new SubmitPublicationRequestInteractor(
    repo,
    personalDataRepo,
    eventBus,
    captchaVerifier,
    prisma as unknown as PrismaService,
  );

describe('SubmitPublicationRequestInteractor.execute — CAPTCHA inválido', () => {
  it('should return Result.fail with InvalidCaptchaException when captcha is rejected', async () => {
    const repo = buildMockRepo();
    const personalDataRepo = buildMockPersonalDataRepo();
    const eventBus = buildMockEventBus();
    const captchaVerifier = buildMockCaptchaVerifier();
    const prisma = buildMockPrisma();
    captchaVerifier.verify.mockResolvedValue(false);

    const interactor = buildInteractor(repo, personalDataRepo, eventBus, captchaVerifier, prisma);
    const result = await interactor.execute(VALID_INPUT);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCaptchaException);
  });

  it('should not persist nor publish events when captcha is invalid', async () => {
    const repo = buildMockRepo();
    const personalDataRepo = buildMockPersonalDataRepo();
    const eventBus = buildMockEventBus();
    const captchaVerifier = buildMockCaptchaVerifier();
    const prisma = buildMockPrisma();
    captchaVerifier.verify.mockResolvedValue(false);

    const interactor = buildInteractor(repo, personalDataRepo, eventBus, captchaVerifier, prisma);
    await interactor.execute(VALID_INPUT);

    expect(repo.save.mock.calls).toHaveLength(0);
    expect(personalDataRepo.save.mock.calls).toHaveLength(0);
    expect(eventBus.publish.mock.calls).toHaveLength(0);
  });
});

describe('SubmitPublicationRequestInteractor.execute — submit exitoso', () => {
  let repo: jest.Mocked<PublicationRequestRepositoryPort>;
  let personalDataRepo: jest.Mocked<PersonalDataAuthorizationRepositoryPort>;
  let eventBus: jest.Mocked<EventBus>;
  let prisma: PrismaMock;
  let interactor: SubmitPublicationRequestInteractor;

  beforeEach(() => {
    repo = buildMockRepo();
    personalDataRepo = buildMockPersonalDataRepo();
    eventBus = buildMockEventBus();
    const captchaVerifier = buildMockCaptchaVerifier();
    prisma = buildMockPrisma();
    captchaVerifier.verify.mockResolvedValue(true);
    repo.findByDedupHash.mockResolvedValue(Maybe.none());
    repo.save.mockResolvedValue(undefined);
    personalDataRepo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);
    prisma.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => cb({}));
    interactor = buildInteractor(repo, personalDataRepo, eventBus, captchaVerifier, prisma);
  });

  it('should return Result.ok with PENDING_REVIEW status and valid referenceNumber', async () => {
    repo.nextReferenceNumber.mockResolvedValue(1);
    const result = await interactor.execute(VALID_INPUT);
    expect(result.isSuccess).toBe(true);
    expect(result.value.referenceNumber).toMatch(/^PUB-\d{4}-\d{5}$/);
    expect(result.value.status).toBe(PublicationRequestStatusValue.PENDING_REVIEW);
  });

  it('should persist both entities in a transaction and publish domain events', async () => {
    repo.nextReferenceNumber.mockResolvedValue(2);
    await interactor.execute(VALID_INPUT);
    expect(prisma.$transaction.mock.calls).toHaveLength(1);
    expect(repo.save.mock.calls).toHaveLength(1);
    expect(personalDataRepo.save.mock.calls).toHaveLength(1);
    expect(eventBus.publish.mock.calls).toHaveLength(1);
  });
});

describe('SubmitPublicationRequestInteractor.execute — dedupHash duplicado', () => {
  it('should return Result.fail with DuplicatePublicationRequestException', async () => {
    const repo = buildMockRepo();
    const personalDataRepo = buildMockPersonalDataRepo();
    const eventBus = buildMockEventBus();
    const captchaVerifier = buildMockCaptchaVerifier();
    const prisma = buildMockPrisma();
    captchaVerifier.verify.mockResolvedValue(true);
    repo.findByDedupHash.mockResolvedValue(Maybe.some(buildExistingRequest()));

    const interactor = buildInteractor(repo, personalDataRepo, eventBus, captchaVerifier, prisma);
    const result = await interactor.execute(VALID_INPUT);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DuplicatePublicationRequestException);
  });

  it('should not persist nor publish events when duplicate is found', async () => {
    const repo = buildMockRepo();
    const personalDataRepo = buildMockPersonalDataRepo();
    const eventBus = buildMockEventBus();
    const captchaVerifier = buildMockCaptchaVerifier();
    const prisma = buildMockPrisma();
    captchaVerifier.verify.mockResolvedValue(true);
    repo.findByDedupHash.mockResolvedValue(Maybe.some(buildExistingRequest()));

    const interactor = buildInteractor(repo, personalDataRepo, eventBus, captchaVerifier, prisma);
    await interactor.execute(VALID_INPUT);

    expect(repo.save.mock.calls).toHaveLength(0);
    expect(personalDataRepo.save.mock.calls).toHaveLength(0);
    expect(eventBus.publish.mock.calls).toHaveLength(0);
  });
});

describe('SubmitPublicationRequestInteractor.execute — VOs construidos desde strings', () => {
  it('should normalize lowercase offerType and succeed', async () => {
    const repo = buildMockRepo();
    const personalDataRepo = buildMockPersonalDataRepo();
    const eventBus = buildMockEventBus();
    const captchaVerifier = buildMockCaptchaVerifier();
    const prisma = buildMockPrisma();
    captchaVerifier.verify.mockResolvedValue(true);
    repo.findByDedupHash.mockResolvedValue(Maybe.none());
    repo.nextReferenceNumber.mockResolvedValue(3);
    repo.save.mockResolvedValue(undefined);
    personalDataRepo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);
    prisma.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => cb({}));

    const interactor = buildInteractor(repo, personalDataRepo, eventBus, captchaVerifier, prisma);
    const result = await interactor.execute({ ...VALID_INPUT, proposedOfferType: 'sale' });

    expect(result.isSuccess).toBe(true);
    expect(repo.save.mock.calls).toHaveLength(1);
  });
});
