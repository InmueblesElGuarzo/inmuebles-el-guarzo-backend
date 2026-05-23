import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { EventBus } from '../../../../../shared-kernel/infrastructure/event-bus/event-bus.port';
import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { DuplicatePublicationRequestException } from '../../../domain/exceptions/duplicate-publication-request.exception';
import { PublicationRequestOfferType } from '../../../domain/value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../../../domain/value-objects/publication-request-status.value-object';
import { ProposedDescription } from '../../../domain/value-objects/proposed-description.value-object';
import { ProposedLocation } from '../../../domain/value-objects/proposed-location.value-object';
import { ReferenceNumber } from '../../../domain/value-objects/reference-number.value-object';
import { PublicationRequestRepositoryPort } from '../../ports/output/publication-request.repository.port';
import { SubmitPublicationRequestInteractor } from './submit-publication-request.interactor';

const REQUEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

const buildMockRepo = (): jest.Mocked<PublicationRequestRepositoryPort> => ({
  findById: jest.fn(),
  findByDedupHash: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  nextReferenceNumber: jest.fn(),
});

const buildMockEventBus = (): jest.Mocked<EventBus> => ({
  publish: jest.fn(),
  register: jest.fn(),
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

describe('SubmitPublicationRequestInteractor.execute — submit exitoso', () => {
  it('should return Result.ok with PENDING_REVIEW status and valid referenceNumber', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findByDedupHash.mockResolvedValue(Maybe.none());
    repo.nextReferenceNumber.mockResolvedValue(1);
    repo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    const interactor = new SubmitPublicationRequestInteractor(repo, eventBus);
    const result = await interactor.execute(VALID_INPUT);

    expect(result.isSuccess).toBe(true);
    expect(result.value.referenceNumber).toMatch(/^PUB-\d{4}-\d{5}$/);
    expect(result.value.status).toBe(PublicationRequestStatusValue.PENDING_REVIEW);
  });

  it('should persist the request and publish domain events', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findByDedupHash.mockResolvedValue(Maybe.none());
    repo.nextReferenceNumber.mockResolvedValue(2);
    repo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    const interactor = new SubmitPublicationRequestInteractor(repo, eventBus);
    await interactor.execute(VALID_INPUT);

    expect(repo.save.mock.calls).toHaveLength(1);
    expect(eventBus.publish.mock.calls).toHaveLength(1);
  });
});

describe('SubmitPublicationRequestInteractor.execute — dedupHash duplicado', () => {
  it('should return Result.fail with DuplicatePublicationRequestException', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findByDedupHash.mockResolvedValue(Maybe.some(buildExistingRequest()));

    const interactor = new SubmitPublicationRequestInteractor(repo, eventBus);
    const result = await interactor.execute(VALID_INPUT);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DuplicatePublicationRequestException);
  });

  it('should not persist nor publish events when duplicate is found', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findByDedupHash.mockResolvedValue(Maybe.some(buildExistingRequest()));

    const interactor = new SubmitPublicationRequestInteractor(repo, eventBus);
    await interactor.execute(VALID_INPUT);

    expect(repo.save.mock.calls).toHaveLength(0);
    expect(eventBus.publish.mock.calls).toHaveLength(0);
  });
});

describe('SubmitPublicationRequestInteractor.execute — VOs construidos desde strings', () => {
  it('should normalize lowercase offerType and succeed', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findByDedupHash.mockResolvedValue(Maybe.none());
    repo.nextReferenceNumber.mockResolvedValue(3);
    repo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    const interactor = new SubmitPublicationRequestInteractor(repo, eventBus);
    const result = await interactor.execute({ ...VALID_INPUT, proposedOfferType: 'sale' });

    expect(result.isSuccess).toBe(true);
    expect(repo.save.mock.calls).toHaveLength(1);
  });
});
