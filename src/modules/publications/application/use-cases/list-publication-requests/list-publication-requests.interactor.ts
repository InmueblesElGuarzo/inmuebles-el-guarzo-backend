/**
 * ListPublicationRequestsInteractor — Implementacion del caso de uso ListPublicationRequests.
 *
 * QUERY PURA: no muta estado, no emite eventos, no abre transacciones.
 * Aplica filtros y paginacion opcionales. Valores por defecto: pagina 1,
 * limite de 20 elementos.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../../../shared-kernel/domain/exceptions/domain.exception';
import { Result } from '../../../../../shared-kernel/domain/result';

import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { PublicationRequestStatusValue } from '../../../domain/value-objects/publication-request-status.value-object';
import {
  ListPublicationRequestsFilters,
  PUBLICATION_REQUEST_REPOSITORY,
  PublicationRequestRepositoryPort,
} from '../../ports/output/publication-request.repository.port';

import { ListPublicationRequestsInput } from './dtos/list-publication-requests-input.dto';
import {
  ListPublicationRequestsOutput,
  PublicationRequestSummary,
} from './dtos/list-publication-requests-output.dto';
import { ListPublicationRequestsInputPort } from './dtos/list-publication-requests.input-port';

@Injectable()
export class ListPublicationRequestsInteractor implements ListPublicationRequestsInputPort {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;

  public constructor(
    @Inject(PUBLICATION_REQUEST_REPOSITORY)
    private readonly repo: PublicationRequestRepositoryPort,
  ) {}

  public async execute(
    input: ListPublicationRequestsInput,
  ): Promise<Result<ListPublicationRequestsOutput, DomainException>> {
    const page = input.page ?? ListPublicationRequestsInteractor.DEFAULT_PAGE;
    const limit = input.limit ?? ListPublicationRequestsInteractor.DEFAULT_LIMIT;
    const filters: ListPublicationRequestsFilters = {
      status: input.status as PublicationRequestStatusValue | undefined,
      assignedAdvisorId: input.assignedAdvisorId,
      page,
      limit,
    };
    const [requests, total] = await this.repo.findAll(filters);
    const items = requests.map((r) => ListPublicationRequestsInteractor.toSummary(r));
    return Result.ok({ items, total, page, limit });
  }

  private static toSummary(request: PublicationRequest): PublicationRequestSummary {
    return {
      id: request.id.value,
      referenceNumber: request.referenceNumber.value,
      ownerFullName: request.ownerFullName.value,
      ownerEmail: request.ownerEmail.value,
      ownerPhonePrimary: request.ownerPhonePrimary.value,
      proposedOfferType: request.proposedOfferType.value,
      proposedLocation: request.proposedLocation.value,
      status: request.status.value,
      assignedAdvisorId: request.assignedAdvisorId.isPresent()
        ? request.assignedAdvisorId.value.value
        : undefined,
      createdAt: request.createdAt,
      decidedAt: request.decisionAt.isPresent() ? request.decisionAt.value : undefined,
    };
  }
}
