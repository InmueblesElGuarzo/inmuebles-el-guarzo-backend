import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
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
import { GetPublicationRequestDetailInteractor } from './get-publication-request-detail.interactor';

const REQUEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

const buildMockRepo = (): jest.Mocked<PublicationRequestRepositoryPort> => ({
  findById: jest.fn(),
  findByDedupHash: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  nextReferenceNumber: jest.fn(),
});

const buildRequest = (): PublicationRequest =>
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
    dedupHash: 'test-dedup-hash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('GetPublicationRequestDetailInteractor.execute — solicitud encontrada', () => {
  it('should return Result.ok with complete detail snapshot', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.some(buildRequest()));

    const interactor = new GetPublicationRequestDetailInteractor(repo);
    const result = await interactor.execute({ publicationRequestId: REQUEST_UUID });

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(REQUEST_UUID);
    expect(result.value.ownerEmail).toBe('juan@example.com');
    expect(result.value.referenceNumber).toBe('PUB-2026-00001');
    expect(result.value.status).toBe(PublicationRequestStatusValue.PENDING_REVIEW);
    expect(result.value.captchaValidated).toBe(true);
  });

  it('should map optional Maybe fields to undefined when absent', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.some(buildRequest()));

    const interactor = new GetPublicationRequestDetailInteractor(repo);
    const result = await interactor.execute({ publicationRequestId: REQUEST_UUID });

    expect(result.value.ownerPhoneSecondary).toBeUndefined();
    expect(result.value.ownerDocumentType).toBeUndefined();
    expect(result.value.proposedPropertyTypeId).toBeUndefined();
    expect(result.value.assignedAdvisorId).toBeUndefined();
    expect(result.value.decisionAt).toBeUndefined();
    expect(result.value.decisionMotive).toBeUndefined();
  });
});

describe('GetPublicationRequestDetailInteractor.execute — solicitud no encontrada', () => {
  it('should return Result.fail with PublicationRequestNotFoundException', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.none());

    const interactor = new GetPublicationRequestDetailInteractor(repo);
    const result = await interactor.execute({ publicationRequestId: REQUEST_UUID });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PublicationRequestNotFoundException);
  });

  it('should include the requestId in the exception message', async () => {
    const repo = buildMockRepo();
    repo.findById.mockResolvedValue(Maybe.none());

    const interactor = new GetPublicationRequestDetailInteractor(repo);
    const result = await interactor.execute({ publicationRequestId: REQUEST_UUID });

    expect(result.error.message).toContain(REQUEST_UUID);
  });
});
