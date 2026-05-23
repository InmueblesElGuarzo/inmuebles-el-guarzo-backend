import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { ProposedDescription } from '../../../domain/value-objects/proposed-description.value-object';
import { ProposedLocation } from '../../../domain/value-objects/proposed-location.value-object';
import { PublicationRequestOfferType } from '../../../domain/value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../../../domain/value-objects/publication-request-status.value-object';
import { ReferenceNumber } from '../../../domain/value-objects/reference-number.value-object';
import { PublicationRequestRepositoryPort } from '../../ports/output/publication-request.repository.port';
import { ListPublicationRequestsInteractor } from './list-publication-requests.interactor';

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

describe('ListPublicationRequestsInteractor.execute — lista vacía', () => {
  it('should return Result.ok with empty items and total zero', async () => {
    const repo = buildMockRepo();
    repo.findAll.mockResolvedValue([[], 0]);

    const interactor = new ListPublicationRequestsInteractor(repo);
    const result = await interactor.execute({});

    expect(result.isSuccess).toBe(true);
    expect(result.value.items).toHaveLength(0);
    expect(result.value.total).toBe(0);
  });
});

describe('ListPublicationRequestsInteractor.execute — lista con items', () => {
  it('should return mapped summaries with correct fields', async () => {
    const repo = buildMockRepo();
    const request = buildRequest();
    repo.findAll.mockResolvedValue([[request], 1]);

    const interactor = new ListPublicationRequestsInteractor(repo);
    const result = await interactor.execute({ page: 1, limit: 10 });

    expect(result.isSuccess).toBe(true);
    expect(result.value.items).toHaveLength(1);
    const item = result.value.items[0];
    expect(item.id).toBe(REQUEST_UUID);
    expect(item.ownerEmail).toBe('juan@example.com');
    expect(item.status).toBe(PublicationRequestStatusValue.PENDING_REVIEW);
  });

  it('should set assignedAdvisorId as undefined when absent', async () => {
    const repo = buildMockRepo();
    repo.findAll.mockResolvedValue([[buildRequest()], 1]);

    const interactor = new ListPublicationRequestsInteractor(repo);
    const result = await interactor.execute({});

    expect(result.value.items[0].assignedAdvisorId).toBeUndefined();
    expect(result.value.items[0].decidedAt).toBeUndefined();
  });
});

describe('ListPublicationRequestsInteractor.execute — defaults de paginación', () => {
  it('should use page=1 and limit=20 when not provided', async () => {
    const repo = buildMockRepo();
    repo.findAll.mockResolvedValue([[], 0]);

    const interactor = new ListPublicationRequestsInteractor(repo);
    const result = await interactor.execute({});

    expect(result.isSuccess).toBe(true);
    expect(result.value.page).toBe(1);
    expect(result.value.limit).toBe(20);
  });

  it('should pass provided page and limit to the repository', async () => {
    const repo = buildMockRepo();
    repo.findAll.mockResolvedValue([[], 0]);

    const interactor = new ListPublicationRequestsInteractor(repo);
    const result = await interactor.execute({ page: 3, limit: 5 });

    expect(result.value.page).toBe(3);
    expect(result.value.limit).toBe(5);
    expect(repo.findAll.mock.calls[0][0]).toMatchObject({ page: 3, limit: 5 });
  });
});
