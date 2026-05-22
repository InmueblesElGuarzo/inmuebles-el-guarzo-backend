/**
 * PublicationRequest — Aggregate Root del bounded context Publications.
 *
 * Ciclo de vida:
 *   submit()          → crea la solicitud en PENDING_REVIEW.
 *   approve()         → transiciona a APPROVED (requiere UNDER_REVIEW).
 *   reject()          → transiciona a REJECTED con motivo obligatorio.
 *   fromPersistence() → reconstrucción desde BD, sin emitir eventos.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root.base';
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
import { ProposedDescription } from '../value-objects/proposed-description.value-object';
import { ProposedLocation } from '../value-objects/proposed-location.value-object';
import { PublicationRequestOfferType } from '../value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../value-objects/publication-request-status.value-object';
import { ReferenceNumber } from '../value-objects/reference-number.value-object';

interface PublicationRequestProps {
  id: UniqueId;
  referenceNumber: ReferenceNumber;
  ownerFullName: FullName;
  ownerEmail: Email;
  ownerPhonePrimary: PhoneNumber;
  ownerPhoneSecondary: Maybe<PhoneNumber>;
  ownerDocumentType: Maybe<string>;
  ownerDocumentNumber: Maybe<string>;
  proposedPropertyTypeId: Maybe<UniqueId>;
  proposedOfferType: PublicationRequestOfferType;
  proposedLocation: ProposedLocation;
  proposedAreaM2: Maybe<number>;
  proposedDescription: ProposedDescription;
  proposedExpectedPrice: Maybe<number>;
  status: PublicationRequestStatus;
  assignedAdvisorId: Maybe<UniqueId>;
  decisionAt: Maybe<Date>;
  decisionByAdminId: Maybe<UniqueId>;
  decisionMotive: Maybe<string>;
  captchaValidated: boolean;
  submittedFromIp: Maybe<string>;
  submittedFromUserAgent: Maybe<string>;
  dedupHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePublicationRequestInput {
  id: UniqueId;
  referenceNumber: ReferenceNumber;
  ownerFullName: FullName;
  ownerEmail: Email;
  ownerPhonePrimary: PhoneNumber;
  ownerPhoneSecondary: Maybe<PhoneNumber>;
  ownerDocumentType: Maybe<string>;
  ownerDocumentNumber: Maybe<string>;
  proposedPropertyTypeId: Maybe<UniqueId>;
  proposedOfferType: PublicationRequestOfferType;
  proposedLocation: ProposedLocation;
  proposedAreaM2: Maybe<number>;
  proposedDescription: ProposedDescription;
  proposedExpectedPrice: Maybe<number>;
  captchaValidated: boolean;
  submittedFromIp: Maybe<string>;
  submittedFromUserAgent: Maybe<string>;
  dedupHash: string;
}

export class PublicationRequest extends AggregateRoot {
  private readonly _props: PublicationRequestProps;

  private constructor(props: PublicationRequestProps) {
    super(props.id);
    this._props = props;
  }

  public static submit(input: CreatePublicationRequestInput): PublicationRequest {
    const now = new Date();
    const request = new PublicationRequest({
      ...input,
      status: PublicationRequestStatus.pendingReview(),
      assignedAdvisorId: Maybe.none<UniqueId>(),
      decisionAt: Maybe.none<Date>(),
      decisionByAdminId: Maybe.none<UniqueId>(),
      decisionMotive: Maybe.none<string>(),
      createdAt: now,
      updatedAt: now,
    });
    request.addDomainEvent(
      new PublicationRequestSubmitted(
        request._props.id,
        request._props.referenceNumber.value,
        request._props.ownerEmail.value,
        request._props.ownerFullName.value,
      ),
    );
    return request;
  }

  public static fromPersistence(props: PublicationRequestProps): PublicationRequest {
    return new PublicationRequest(props);
  }

  public approve(decidedByAdminId: UniqueId): void {
    if (this._props.status.isTerminal()) {
      throw new PublicationRequestAlreadyDecidedException(this._props.id.value);
    }
    const now = new Date();
    this._props.status = this._props.status.transitionTo(PublicationRequestStatusValue.APPROVED);
    this._props.decisionAt = Maybe.some(now);
    this._props.decisionByAdminId = Maybe.some(decidedByAdminId);
    this._props.updatedAt = now;
    this.addDomainEvent(
      new PublicationRequestApproved({
        publicationRequestId: this._props.id,
        referenceNumber: this._props.referenceNumber.value,
        ownerEmail: this._props.ownerEmail.value,
        ownerFullName: this._props.ownerFullName.value,
        ownerPhonePrimary: this._props.ownerPhonePrimary.value,
        ownerPhoneSecondary: PublicationRequest.phoneToOptional(this._props.ownerPhoneSecondary),
        ownerDocumentType: PublicationRequest.maybeToOptional(this._props.ownerDocumentType),
        ownerDocumentNumber: PublicationRequest.maybeToOptional(this._props.ownerDocumentNumber),
        decidedByAdminId: decidedByAdminId.value,
      }),
    );
  }

  public reject(decidedByAdminId: UniqueId, motive: string): void {
    if (this._props.status.isTerminal()) {
      throw new PublicationRequestAlreadyDecidedException(this._props.id.value);
    }
    if (motive.trim().length === 0) {
      throw new DecisionMotiveRequiredException();
    }
    const now = new Date();
    this._props.status = this._props.status.transitionTo(PublicationRequestStatusValue.REJECTED);
    this._props.decisionAt = Maybe.some(now);
    this._props.decisionByAdminId = Maybe.some(decidedByAdminId);
    this._props.decisionMotive = Maybe.some(motive);
    this._props.updatedAt = now;
    this.addDomainEvent(
      new PublicationRequestRejected({
        publicationRequestId: this._props.id,
        referenceNumber: this._props.referenceNumber.value,
        ownerEmail: this._props.ownerEmail.value,
        ownerFullName: this._props.ownerFullName.value,
        decisionMotive: motive,
        decidedByAdminId: decidedByAdminId.value,
      }),
    );
  }

  private static maybeToOptional<T>(maybe: Maybe<T>): T | undefined {
    return maybe.isPresent() ? maybe.value : undefined;
  }

  private static phoneToOptional(phone: Maybe<PhoneNumber>): string | undefined {
    return phone.isPresent() ? phone.value.value : undefined;
  }

  public get referenceNumber(): ReferenceNumber {
    return this._props.referenceNumber;
  }

  public get ownerFullName(): FullName {
    return this._props.ownerFullName;
  }

  public get ownerEmail(): Email {
    return this._props.ownerEmail;
  }

  public get ownerPhonePrimary(): PhoneNumber {
    return this._props.ownerPhonePrimary;
  }

  public get ownerPhoneSecondary(): Maybe<PhoneNumber> {
    return this._props.ownerPhoneSecondary;
  }

  public get ownerDocumentType(): Maybe<string> {
    return this._props.ownerDocumentType;
  }

  public get ownerDocumentNumber(): Maybe<string> {
    return this._props.ownerDocumentNumber;
  }

  public get proposedPropertyTypeId(): Maybe<UniqueId> {
    return this._props.proposedPropertyTypeId;
  }

  public get proposedOfferType(): PublicationRequestOfferType {
    return this._props.proposedOfferType;
  }

  public get proposedLocation(): ProposedLocation {
    return this._props.proposedLocation;
  }

  public get proposedAreaM2(): Maybe<number> {
    return this._props.proposedAreaM2;
  }

  public get proposedDescription(): ProposedDescription {
    return this._props.proposedDescription;
  }

  public get proposedExpectedPrice(): Maybe<number> {
    return this._props.proposedExpectedPrice;
  }

  public get status(): PublicationRequestStatus {
    return this._props.status;
  }

  public get assignedAdvisorId(): Maybe<UniqueId> {
    return this._props.assignedAdvisorId;
  }

  public get decisionAt(): Maybe<Date> {
    return this._props.decisionAt;
  }

  public get decisionByAdminId(): Maybe<UniqueId> {
    return this._props.decisionByAdminId;
  }

  public get decisionMotive(): Maybe<string> {
    return this._props.decisionMotive;
  }

  public get captchaValidated(): boolean {
    return this._props.captchaValidated;
  }

  public get submittedFromIp(): Maybe<string> {
    return this._props.submittedFromIp;
  }

  public get submittedFromUserAgent(): Maybe<string> {
    return this._props.submittedFromUserAgent;
  }

  public get dedupHash(): string {
    return this._props.dedupHash;
  }

  public get createdAt(): Date {
    return this._props.createdAt;
  }

  public get updatedAt(): Date {
    return this._props.updatedAt;
  }
}
