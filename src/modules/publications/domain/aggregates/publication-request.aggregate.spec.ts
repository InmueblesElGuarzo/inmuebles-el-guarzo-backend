import { Maybe } from '../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import { PublicationRequestApproved } from '../events/publication-request-approved.event';
import { PublicationRequestRejected } from '../events/publication-request-rejected.event';
import { PublicationRequestSubmitted } from '../events/publication-request-submitted.event';
import { PublicationRequestUnderReview } from '../events/publication-request-under-review.event';
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
const ADVISOR_UUID = '550e8400-e29b-41d4-a716-446655440002';

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

const buildFullProps = (): Props => ({
  ...buildInput(),
  ownerPhoneSecondary: Maybe.some(PhoneNumber.create('3007654321')),
  ownerDocumentType: Maybe.some('CC'),
  ownerDocumentNumber: Maybe.some('12345678'),
  proposedPropertyTypeId: Maybe.some(UniqueId.fromString(ADVISOR_UUID)),
  proposedAreaM2: Maybe.some(85),
  proposedExpectedPrice: Maybe.some(350000000),
  status: PublicationRequestStatus.create(PublicationRequestStatusValue.PENDING_REVIEW),
  assignedAdvisorId: Maybe.some(UniqueId.fromString(ADVISOR_UUID)),
  decisionAt: Maybe.some(new Date('2026-01-02T00:00:00.000Z')),
  decisionByAdminId: Maybe.some(UniqueId.fromString(ADMIN_UUID)),
  decisionMotive: Maybe.some('Motivo de prueba'),
  submittedFromIp: Maybe.some('test-submitted-ip'),
  submittedFromUserAgent: Maybe.some('Mozilla/5.0'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('PublicationRequest — getters opcionales presentes', () => {
  it('should expose ownerPhoneSecondary when present', () => {
    const req = PublicationRequest.fromPersistence(buildFullProps());
    expect(req.ownerPhoneSecondary.isPresent()).toBe(true);
    expect(req.ownerPhoneSecondary.value.value).toBe('3007654321');
  });

  it('should expose ownerDocumentType and ownerDocumentNumber when present', () => {
    const req = PublicationRequest.fromPersistence(buildFullProps());
    expect(req.ownerDocumentType.isPresent()).toBe(true);
    expect(req.ownerDocumentType.value).toBe('CC');
    expect(req.ownerDocumentNumber.isPresent()).toBe(true);
    expect(req.ownerDocumentNumber.value).toBe('12345678');
  });

  it('should expose proposedPropertyTypeId, proposedAreaM2 and proposedExpectedPrice when present', () => {
    const req = PublicationRequest.fromPersistence(buildFullProps());
    expect(req.proposedPropertyTypeId.isPresent()).toBe(true);
    expect(req.proposedPropertyTypeId.value.value).toBe(ADVISOR_UUID);
    expect(req.proposedAreaM2.isPresent()).toBe(true);
    expect(req.proposedAreaM2.value).toBe(85);
    expect(req.proposedExpectedPrice.isPresent()).toBe(true);
    expect(req.proposedExpectedPrice.value).toBe(350000000);
  });

  it('should expose assignedAdvisorId, decisionAt, decisionByAdminId and decisionMotive when present', () => {
    const req = PublicationRequest.fromPersistence(buildFullProps());
    expect(req.assignedAdvisorId.isPresent()).toBe(true);
    expect(req.assignedAdvisorId.value.value).toBe(ADVISOR_UUID);
    expect(req.decisionAt.isPresent()).toBe(true);
    expect(req.decisionAt.value).toBeInstanceOf(Date);
    expect(req.decisionByAdminId.isPresent()).toBe(true);
    expect(req.decisionByAdminId.value.value).toBe(ADMIN_UUID);
    expect(req.decisionMotive.isPresent()).toBe(true);
    expect(req.decisionMotive.value).toBe('Motivo de prueba');
  });

  it('should expose submittedFromIp and submittedFromUserAgent when present', () => {
    const req = PublicationRequest.fromPersistence(buildFullProps());
    expect(req.submittedFromIp.isPresent()).toBe(true);
    expect(req.submittedFromIp.value).toBe('test-submitted-ip');
    expect(req.submittedFromUserAgent.isPresent()).toBe(true);
    expect(req.submittedFromUserAgent.value).toBe('Mozilla/5.0');
  });
});

describe('PublicationRequest — getters escalares', () => {
  it('should expose captchaValidated as true and correct dedupHash', () => {
    const req = PublicationRequest.submit(buildInput());
    expect(req.captchaValidated).toBe(true);
    expect(req.dedupHash).toBe('abc123hash');
  });
});

describe('PublicationRequest.startReview — flujo feliz', () => {
  it('should transition status to UNDER_REVIEW', () => {
    const req = PublicationRequest.fromPersistence({
      ...buildUnderReviewProps(),
      status: PublicationRequestStatus.create(PublicationRequestStatusValue.PENDING_REVIEW),
    });
    req.startReview(UniqueId.fromString(ADMIN_UUID));
    expect(req.status.value).toBe(PublicationRequestStatusValue.UNDER_REVIEW);
  });

  it('should emit exactly one PublicationRequestUnderReview event', () => {
    const req = PublicationRequest.fromPersistence({
      ...buildUnderReviewProps(),
      status: PublicationRequestStatus.create(PublicationRequestStatusValue.PENDING_REVIEW),
    });
    req.startReview(UniqueId.fromString(ADMIN_UUID));
    const events = req.peekDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PublicationRequestUnderReview);
  });
});

describe('PublicationRequest.startReview — solicitud en estado terminal', () => {
  it('should throw PublicationRequestAlreadyDecidedException when already decided', () => {
    const req = PublicationRequest.fromPersistence(
      buildDecidedProps(PublicationRequestStatusValue.APPROVED),
    );
    expect(() => req.startReview(UniqueId.fromString(ADMIN_UUID))).toThrow(
      PublicationRequestAlreadyDecidedException,
    );
  });
});
