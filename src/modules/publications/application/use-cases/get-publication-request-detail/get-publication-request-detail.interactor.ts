/**
 * GetPublicationRequestDetailInteractor — Implementacion del caso de uso
 * GetPublicationRequestDetail.
 *
 * QUERY PURA: carga el agregado completo y mapea todos sus campos a un
 * snapshot serializable. No muta estado ni emite eventos.
 *
 * Errores de dominio que retorna en Result.fail:
 *   - PublicationRequestNotFoundException: no existe registro con ese id.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../../../shared-kernel/domain/exceptions/domain.exception';
import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { Result } from '../../../../../shared-kernel/domain/result';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';

import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { PublicationRequestNotFoundException } from '../../../domain/exceptions/publication-request-not-found.exception';
import {
  PUBLICATION_REQUEST_REPOSITORY,
  PublicationRequestRepositoryPort,
} from '../../ports/output/publication-request.repository.port';

import { GetPublicationRequestDetailInput } from './dtos/get-publication-request-detail-input.dto';
import { GetPublicationRequestDetailOutput } from './dtos/get-publication-request-detail-output.dto';
import { GetPublicationRequestDetailInputPort } from './dtos/get-publication-request-detail.input-port';

@Injectable()
export class GetPublicationRequestDetailInteractor implements GetPublicationRequestDetailInputPort {
  public constructor(
    @Inject(PUBLICATION_REQUEST_REPOSITORY)
    private readonly repo: PublicationRequestRepositoryPort,
  ) {}

  public async execute(
    input: GetPublicationRequestDetailInput,
  ): Promise<Result<GetPublicationRequestDetailOutput, DomainException>> {
    const id = UniqueId.fromString(input.publicationRequestId);
    const maybe = await this.repo.findById(id);
    if (maybe.isAbsent()) {
      return Result.fail(new PublicationRequestNotFoundException(input.publicationRequestId));
    }
    return Result.ok(GetPublicationRequestDetailInteractor.toOutput(maybe.value));
  }

  private static toOptional<T>(maybe: Maybe<T>): T | undefined {
    return maybe.isPresent() ? maybe.value : undefined;
  }

  private static toOutput(r: PublicationRequest): GetPublicationRequestDetailOutput {
    const opt = <T>(m: Maybe<T>): T | undefined =>
      GetPublicationRequestDetailInteractor.toOptional(m);
    return {
      id: r.id.value,
      referenceNumber: r.referenceNumber.value,
      ownerFullName: r.ownerFullName.value,
      ownerEmail: r.ownerEmail.value,
      ownerPhonePrimary: r.ownerPhonePrimary.value,
      ownerPhoneSecondary: opt(r.ownerPhoneSecondary.map((p) => p.value)),
      ownerDocumentType: opt(r.ownerDocumentType),
      ownerDocumentNumber: opt(r.ownerDocumentNumber),
      proposedPropertyTypeId: opt(r.proposedPropertyTypeId.map((id) => id.value)),
      proposedOfferType: r.proposedOfferType.value,
      proposedLocation: r.proposedLocation.value,
      proposedAreaM2: opt(r.proposedAreaM2),
      proposedDescription: r.proposedDescription.value,
      proposedExpectedPrice: opt(r.proposedExpectedPrice),
      status: r.status.value,
      assignedAdvisorId: opt(r.assignedAdvisorId.map((id) => id.value)),
      decisionAt: opt(r.decisionAt),
      decisionByAdminId: opt(r.decisionByAdminId.map((id) => id.value)),
      decisionMotive: opt(r.decisionMotive),
      captchaValidated: r.captchaValidated,
      submittedFromIp: opt(r.submittedFromIp),
      submittedFromUserAgent: opt(r.submittedFromUserAgent),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
