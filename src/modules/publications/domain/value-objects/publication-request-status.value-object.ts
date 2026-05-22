/**
 * PublicationRequestStatus — Value Object que representa el estado
 * de una solicitud de publicación en su ciclo de vida.
 *
 * Estados válidos:
 *   PENDING_REVIEW  → recién enviada, esperando revisión del admin
 *   UNDER_REVIEW    → el admin la está revisando activamente
 *   APPROVED        → aprobada, se crea PropertyOwner
 *   REJECTED        → rechazada con motivo obligatorio
 *   WITHDRAWN       → retirada por el propietario (fuera del alcance v1)
 *
 * Transiciones permitidas:
 *   PENDING_REVIEW  → UNDER_REVIEW
 *   UNDER_REVIEW    → APPROVED | REJECTED
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { InvalidPublicationRequestStatusTransitionException } from '../exceptions/invalid-publication-request-status-transition.exception';

export enum PublicationRequestStatusValue {
  PENDING_REVIEW = 'PENDING_REVIEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

const ALLOWED_TRANSITIONS: Record<PublicationRequestStatusValue, PublicationRequestStatusValue[]> =
  {
    [PublicationRequestStatusValue.PENDING_REVIEW]: [PublicationRequestStatusValue.UNDER_REVIEW],
    [PublicationRequestStatusValue.UNDER_REVIEW]: [
      PublicationRequestStatusValue.APPROVED,
      PublicationRequestStatusValue.REJECTED,
    ],
    [PublicationRequestStatusValue.APPROVED]: [],
    [PublicationRequestStatusValue.REJECTED]: [],
    [PublicationRequestStatusValue.WITHDRAWN]: [],
  };

export class PublicationRequestStatus {
  private readonly _value: PublicationRequestStatusValue;

  private constructor(value: PublicationRequestStatusValue) {
    this._value = value;
  }

  public static create(value: PublicationRequestStatusValue): PublicationRequestStatus {
    return new PublicationRequestStatus(value);
  }

  public static pendingReview(): PublicationRequestStatus {
    return new PublicationRequestStatus(PublicationRequestStatusValue.PENDING_REVIEW);
  }

  public transitionTo(next: PublicationRequestStatusValue): PublicationRequestStatus {
    const allowed = ALLOWED_TRANSITIONS[this._value];
    if (!allowed.includes(next)) {
      throw new InvalidPublicationRequestStatusTransitionException(this._value, next);
    }
    return new PublicationRequestStatus(next);
  }

  public get value(): PublicationRequestStatusValue {
    return this._value;
  }

  public equals(other?: PublicationRequestStatus): boolean {
    if (other === undefined) return false;
    return this._value === other._value;
  }

  public isTerminal(): boolean {
    return (
      this._value === PublicationRequestStatusValue.APPROVED ||
      this._value === PublicationRequestStatusValue.REJECTED ||
      this._value === PublicationRequestStatusValue.WITHDRAWN
    );
  }
}
