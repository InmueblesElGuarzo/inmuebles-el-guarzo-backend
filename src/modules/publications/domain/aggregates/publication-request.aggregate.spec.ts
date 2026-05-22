import { Maybe } from '../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { PublicationRequestApproved } from '../events/publication-request-approved.event';
import { PublicationRequestRejected } from '../events/publication-request-rejected.event';
import { PublicationRequestSubmitted } from '../events/publication-request-submitted.event';
import { DecisionMotiveRequiredException } from '../exceptions/decision-motive-required.exception';
import { PublicationRequestAlreadyDecidedException } from '../exceptions/publication-request-already-decided.exception';
import {
  PublicationRequestOfferType,
  PublicationRequestOfferTypeValue,
} from '../value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../value-objects/publication-request-status.value-object';
import { ProposedDescription } from '../value-objects/proposed-description.value-object';
import { ProposedLocation } from '../value-objects/proposed-location.value-object';
import { ReferenceNumber } from '../value-objects/reference-number.value-object';
import { CreatePublicationRequestInput, PublicationRequest } from './publication-request.aggregate';

const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';
const ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440001';

const buildInput = (): CreatePublicationRequestInput => ({
  id: UniqueId.fromString(TEST_UUID),
  referenceNumber: ReferenceNumber.generate(2026, 1),
  ownerFullName: FullName.create('Juan Perez'),
  ownerEmail: Email.create('juan@example.com'),
  ownerPhonePrimary: PhoneNumber.create('3001234567'),
  ownerPhoneSecondary: Maybe.none(),
  ownerDocumentType: Maybe.none(),
  ownerDocumentNumber: Maybe.none(),
  proposedPropertyTypeId: Maybe.none(),
  proposedOfferType: PublicationRequestOfferType.create(PublicationRequestOfferTypeValue.SALE),
  proposedLocation: ProposedLocation.create('Medellín, Antioquia, Colombia'),
  proposedAreaM2: Maybe.none(),
  proposedDescription: ProposedDescription.create(
    'Hermosa casa en el norte de Medellín con amplio jardín.',
  ),
  proposedExpectedPrice: Maybe.none(),
  captchaValidated: true,
  submittedFromIp: Maybe.none(),
  submittedFromUserAgent: Maybe.none(),
  dedupHash: 'abc123hash',
});

type Props = Parameters<typeof PublicationRequest.fromPersistence>[0];

const buildUnderReviewProps = (): Props => ({
  ...buildInput(),
  status: PublicationRequestStatus.create(PublicationRequestStatusValue.UNDER_REVIEW),
  assignedAdvisorId: Maybe.none(),
  decisionAt: Maybe.none(),
  decisionByAdminId: Maybe.none(),
  decisionMotive: Maybe.none(),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

const buildDecidedProps = (status: PublicationRequestStatusValue): Props => ({
  ...buildUnderReviewProps(),
  status: PublicationRequestStatus.create(status),
  decisionAt: Maybe.some(new Date('2026-01-02T00:00:00.000Z')),
  decisionByAdminId: Maybe.some(UniqueId.fromString(ADMIN_UUID)),
  decisionMotive:
    status === PublicationRequestStatusValue.REJECTED
      ? Maybe.some('No cumple requisitos')
      : Maybe.none(),
});

describe('PublicationRequest.submit — estado inicial y evento', () => {
  it('should create the request with PENDING_REVIEW status', () => {
    const request = PublicationRequest.submit(buildInput());
    expect(request.status.value).toBe(PublicationRequestStatusValue.PENDING_REVIEW);
  });

  it('should emit exactly one PublicationRequestSubmitted event', () => {
    const request = PublicationRequest.submit(buildInput());
    const events = request.peekDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PublicationRequestSubmitted);
  });

  it('should include email and referenceNumber in the submitted event', () => {
    const request = PublicationRequest.submit(buildInput());
    const event = request.peekDomainEvents()[0] as PublicationRequestSubmitted;
    expect(event.ownerEmail).toBe('juan@example.com');
    expect(event.referenceNumber).toBe('PUB-2026-00001');
  });
});

describe('PublicationRequest.approve — flujo feliz', () => {
  it('should transition status to APPROVED', () => {
    const request = PublicationRequest.fromPersistence(buildUnderReviewProps());
    request.approve(UniqueId.fromString(ADMIN_UUID));
    expect(request.status.value).toBe(PublicationRequestStatusValue.APPROVED);
  });

  it('should emit exactly one PublicationRequestApproved event', () => {
    const request = PublicationRequest.fromPersistence(buildUnderReviewProps());
    request.approve(UniqueId.fromString(ADMIN_UUID));
    const events = request.peekDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PublicationRequestApproved);
  });
});

describe('PublicationRequest.reject — flujo feliz', () => {
  it('should transition status to REJECTED', () => {
    const request = PublicationRequest.fromPersistence(buildUnderReviewProps());
    request.reject(UniqueId.fromString(ADMIN_UUID), 'No cumple los requisitos mínimos.');
    expect(request.status.value).toBe(PublicationRequestStatusValue.REJECTED);
  });

  it('should emit exactly one PublicationRequestRejected event with motive', () => {
    const request = PublicationRequest.fromPersistence(buildUnderReviewProps());
    request.reject(UniqueId.fromString(ADMIN_UUID), 'No cumple los requisitos mínimos.');
    const events = request.peekDomainEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as PublicationRequestRejected;
    expect(event).toBeInstanceOf(PublicationRequestRejected);
    expect(event.decisionMotive).toBe('No cumple los requisitos mínimos.');
  });
});

describe('PublicationRequest.reject — motive vacío', () => {
  it('should throw DecisionMotiveRequiredException when motive is empty', () => {
    const request = PublicationRequest.fromPersistence(buildUnderReviewProps());
    expect(() => request.reject(UniqueId.fromString(ADMIN_UUID), '')).toThrow(
      DecisionMotiveRequiredException,
    );
  });
});

describe('PublicationRequest.approve — solicitud ya decidida', () => {
  it('should throw PublicationRequestAlreadyDecidedException when already approved', () => {
    const request = PublicationRequest.fromPersistence(
      buildDecidedProps(PublicationRequestStatusValue.APPROVED),
    );
    expect(() => request.approve(UniqueId.fromString(ADMIN_UUID))).toThrow(
      PublicationRequestAlreadyDecidedException,
    );
  });
});

describe('PublicationRequest.reject — solicitud ya decidida', () => {
  it('should throw PublicationRequestAlreadyDecidedException when already rejected', () => {
    const request = PublicationRequest.fromPersistence(
      buildDecidedProps(PublicationRequestStatusValue.REJECTED),
    );
    expect(() => request.reject(UniqueId.fromString(ADMIN_UUID), 'Nuevo motivo')).toThrow(
      PublicationRequestAlreadyDecidedException,
    );
  });
});
