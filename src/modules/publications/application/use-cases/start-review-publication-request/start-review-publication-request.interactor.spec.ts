import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { EventBus } from '../../../../../shared-kernel/infrastructure/event-bus/event-bus.port';
import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { PublicationRequestAlreadyDecidedException } from '../../../domain/exceptions/publication-request-already-decided.exception';
import { PublicationRequestNotFoundException } from '../../../domain/exceptions/publication-request-not-found.exception';
import { PublicationRequestOfferType } from '../../../domain/value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../../../domain/value-objects/publication-request-status.value-object';
import { ProposedDescription } from '../../../domain/value-objects/proposed-description.value-object';
import { ProposedLocation } from '../../../domain/value-objects/proposed-location.value-object';
import { ReferenceNumber } from '../../../domain/value-objects/reference-number.value-object';
import { PublicationRequestRepositoryPort } from '../../ports/output/publication-request.repository.port';
import { StartReviewPublicationRequestInteractor } from './start-review-publication-request.interactor';

const REQUEST_UUID = '550e8400-e29b-41d4-a716-446655440000';
const ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440001';

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

const buildRequest = (status: PublicationRequestStatusValue): PublicationRequest =>
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
    status: PublicationRequestStatus.create(status),
    assignedAdvisorId: Maybe.none(),
    decisionAt: Maybe.none(),
    decisionByAdminId: Maybe.none(),
    decisionMotive: Maybe.none(),
    captchaValidated: true,
    submittedFromIp: Maybe.none(),
    submittedFromUserAgent: Maybe.none(),
    dedupHash: 'test-dedup-hash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

const START_REVIEW_INPUT = {
  publicationRequestId: REQUEST_UUID,
  startedByAdminId: ADMIN_UUID,
};

describe('StartReviewPublicationRequestInteractor.execute — start-review exitoso', () => {
  it('should return Result.ok with UNDER_REVIEW status', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findById.mockResolvedValue(
      Maybe.some(buildRequest(PublicationRequestStatusValue.PENDING_REVIEW)),
    );
    repo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    const interactor = new StartReviewPublicationRequestInteractor(repo, eventBus);
    const result = await interactor.execute(START_REVIEW_INPUT);

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(PublicationRequestStatusValue.UNDER_REVIEW);
  });

  it('should persist the request and publish events', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findById.mockResolvedValue(
      Maybe.some(buildRequest(PublicationRequestStatusValue.PENDING_REVIEW)),
    );
    repo.save.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    const interactor = new StartReviewPublicationRequestInteractor(repo, eventBus);
    await interactor.execute(START_REVIEW_INPUT);

    expect(repo.save.mock.calls).toHaveLength(1);
    expect(eventBus.publish.mock.calls).toHaveLength(1);
  });
});

describe('StartReviewPublicationRequestInteractor.execute — solicitud no encontrada', () => {
  it('should return Result.fail with PublicationRequestNotFoundException', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findById.mockResolvedValue(Maybe.none());

    const interactor = new StartReviewPublicationRequestInteractor(repo, eventBus);
    const result = await interactor.execute(START_REVIEW_INPUT);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PublicationRequestNotFoundException);
  });
});

describe('StartReviewPublicationRequestInteractor.execute — solicitud ya decidida', () => {
  it('should return Result.fail with PublicationRequestAlreadyDecidedException', async () => {
    const repo = buildMockRepo();
    const eventBus = buildMockEventBus();
    repo.findById.mockResolvedValue(
      Maybe.some(buildRequest(PublicationRequestStatusValue.APPROVED)),
    );

    const interactor = new StartReviewPublicationRequestInteractor(repo, eventBus);
    const result = await interactor.execute(START_REVIEW_INPUT);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PublicationRequestAlreadyDecidedException);
  });
});
