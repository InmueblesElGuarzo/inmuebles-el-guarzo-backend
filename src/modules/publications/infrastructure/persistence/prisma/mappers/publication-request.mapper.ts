/**
 * PublicationRequestMapper — Traduce entre el modelo Prisma y el aggregate PublicationRequest.
 *
 * toDomain:       PrismaPublicationRequestModel → PublicationRequest (para lecturas del repo)
 * toPersistence:  PublicationRequest → Prisma.PublicationRequestUncheckedCreateInput (para writes)
 *
 * Convierte entre las tres representaciones de opcionalidad del proyecto:
 *   T | null  (Prisma)  ↔  Maybe<T>  (dominio)  vía fromNullable / toNullable
 *
 * Los campos Decimal de Prisma (proposedAreaM2, proposedExpectedPrice) se convierten
 * a number en el dominio vía .toNumber() y de vuelta con new Prisma.Decimal(value).
 *
 * Los enums de dominio (PublicationRequestStatusValue, PublicationRequestOfferTypeValue)
 * son TypeScript enums y no son directamente compatibles con los string-literal-unions
 * que genera Prisma. Los casts via unknown son necesarios en la frontera.
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

import type { PublicationRequest as PrismaPublicationRequestModel } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { Maybe } from '../../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../../shared-kernel/domain/value-objects/phone-number.value-object';

import { PublicationRequest } from '../../../../domain/aggregates/publication-request.aggregate';
import { ProposedDescription } from '../../../../domain/value-objects/proposed-description.value-object';
import { ProposedLocation } from '../../../../domain/value-objects/proposed-location.value-object';
import { PublicationRequestOfferType } from '../../../../domain/value-objects/publication-request-offer-type.value-object';
import {
  PublicationRequestStatus,
  PublicationRequestStatusValue,
} from '../../../../domain/value-objects/publication-request-status.value-object';
import { ReferenceNumber } from '../../../../domain/value-objects/reference-number.value-object';

export class PublicationRequestMapper {
  public static toDomain(model: PrismaPublicationRequestModel): PublicationRequest {
    return PublicationRequest.fromPersistence({
      id: UniqueId.fromString(model.id),
      referenceNumber: ReferenceNumber.create(model.referenceNumber),
      ownerFullName: FullName.create(model.ownerFullName),
      ownerEmail: Email.create(model.ownerEmail),
      ownerPhonePrimary: PhoneNumber.create(model.ownerPhonePrimary),
      ownerPhoneSecondary: Maybe.fromNullable(model.ownerPhoneSecondary).map((v) =>
        PhoneNumber.create(v),
      ),
      ownerDocumentType: Maybe.fromNullable(model.ownerDocumentType),
      ownerDocumentNumber: Maybe.fromNullable(model.ownerDocumentNumber),
      proposedPropertyTypeId: Maybe.fromNullable(model.proposedPropertyTypeId).map((v) =>
        UniqueId.fromString(v),
      ),
      proposedOfferType: PublicationRequestOfferType.create(model.proposedOfferType),
      proposedLocation: ProposedLocation.create(model.proposedLocation),
      proposedAreaM2: Maybe.fromNullable(model.proposedAreaM2).map((v) => v.toNumber()),
      proposedDescription: ProposedDescription.create(model.proposedDescription),
      proposedExpectedPrice: Maybe.fromNullable(model.proposedExpectedPrice).map((v) =>
        v.toNumber(),
      ),
      status: PublicationRequestStatus.create(model.status as PublicationRequestStatusValue),
      assignedAdvisorId: Maybe.fromNullable(model.assignedAdvisorId).map((v) =>
        UniqueId.fromString(v),
      ),
      decisionAt: Maybe.fromNullable(model.decisionAt),
      decisionByAdminId: Maybe.fromNullable(model.decisionByAdminId).map((v) =>
        UniqueId.fromString(v),
      ),
      decisionMotive: Maybe.fromNullable(model.decisionMotive),
      captchaValidated: model.captchaValidated,
      submittedFromIp: Maybe.fromNullable(model.submittedFromIp),
      submittedFromUserAgent: Maybe.fromNullable(model.submittedFromUserAgent),
      dedupHash: model.dedupHash,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  public static toPersistence(
    aggregate: PublicationRequest,
  ): Prisma.PublicationRequestUncheckedCreateInput {
    return {
      id: aggregate.id.value,
      referenceNumber: aggregate.referenceNumber.value,
      ownerFullName: aggregate.ownerFullName.value,
      ownerEmail: aggregate.ownerEmail.value,
      ownerPhonePrimary: aggregate.ownerPhonePrimary.value,
      ownerPhoneSecondary: aggregate.ownerPhoneSecondary.map((p) => p.value).toNullable(),
      ownerDocumentType: aggregate.ownerDocumentType.toNullable(),
      ownerDocumentNumber: aggregate.ownerDocumentNumber.toNullable(),
      proposedPropertyTypeId: aggregate.proposedPropertyTypeId.map((id) => id.value).toNullable(),
      proposedOfferType: aggregate.proposedOfferType.value,
      proposedLocation: aggregate.proposedLocation.value,
      proposedAreaM2: aggregate.proposedAreaM2.map((v) => new Prisma.Decimal(v)).toNullable(),
      proposedDescription: aggregate.proposedDescription.value,
      proposedExpectedPrice: aggregate.proposedExpectedPrice
        .map((v) => new Prisma.Decimal(v))
        .toNullable(),
      status: aggregate.status.value,
      assignedAdvisorId: aggregate.assignedAdvisorId.map((id) => id.value).toNullable(),
      decisionAt: aggregate.decisionAt.toNullable(),
      decisionByAdminId: aggregate.decisionByAdminId.map((id) => id.value).toNullable(),
      decisionMotive: aggregate.decisionMotive.toNullable(),
      captchaValidated: aggregate.captchaValidated,
      submittedFromIp: aggregate.submittedFromIp.toNullable(),
      submittedFromUserAgent: aggregate.submittedFromUserAgent.toNullable(),
      dedupHash: aggregate.dedupHash,
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt,
    };
  }
}
