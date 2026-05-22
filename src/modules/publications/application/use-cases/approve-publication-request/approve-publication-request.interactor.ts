/**
 * ApprovePublicationRequestInteractor — Implementacion del caso de uso
 * ApprovePublicationRequest.
 *
 * Flujo:
 *   1. Cargar la solicitud por id.
 *   2. Verificar que no haya sido decidida ya (estado terminal).
 *   3. Llamar a aggregate.approve(), persistir y publicar eventos.
 *
 * Errores de dominio que retorna en Result.fail:
 *   - PublicationRequestNotFoundException: no existe la solicitud.
 *   - PublicationRequestAlreadyDecidedException: ya fue aprobada o rechazada.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../../../shared-kernel/domain/exceptions/domain.exception';
import { Result } from '../../../../../shared-kernel/domain/result';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import {
  EVENT_BUS,
  EventBus,
} from '../../../../../shared-kernel/infrastructure/event-bus/event-bus.port';

import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { PublicationRequestAlreadyDecidedException } from '../../../domain/exceptions/publication-request-already-decided.exception';
import { PublicationRequestNotFoundException } from '../../../domain/exceptions/publication-request-not-found.exception';
import {
  PUBLICATION_REQUEST_REPOSITORY,
  PublicationRequestRepositoryPort,
} from '../../ports/output/publication-request.repository.port';

import { ApprovePublicationRequestInput } from './dtos/approve-publication-request-input.dto';
import { ApprovePublicationRequestOutput } from './dtos/approve-publication-request-output.dto';
import { ApprovePublicationRequestInputPort } from './dtos/approve-publication-request.input-port';

@Injectable()
export class ApprovePublicationRequestInteractor implements ApprovePublicationRequestInputPort {
  public constructor(
    @Inject(PUBLICATION_REQUEST_REPOSITORY)
    private readonly repo: PublicationRequestRepositoryPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {}

  public async execute(
    input: ApprovePublicationRequestInput,
  ): Promise<Result<ApprovePublicationRequestOutput, DomainException>> {
    const id = UniqueId.fromString(input.publicationRequestId);
    const maybe = await this.repo.findById(id);
    if (maybe.isAbsent()) {
      return Result.fail(new PublicationRequestNotFoundException(input.publicationRequestId));
    }
    const request = maybe.value;
    if (request.status.isTerminal()) {
      return Result.fail(new PublicationRequestAlreadyDecidedException(input.publicationRequestId));
    }
    request.approve(UniqueId.fromString(input.decidedByAdminId));
    await this.repo.save(request);
    const events = request.pullDomainEvents();
    await this.eventBus.publish(events);
    return Result.ok(ApprovePublicationRequestInteractor.toOutput(request));
  }

  private static toOutput(request: PublicationRequest): ApprovePublicationRequestOutput {
    return {
      id: request.id.value,
      referenceNumber: request.referenceNumber.value,
      status: request.status.value,
      decisionAt: request.decisionAt.value,
    };
  }
}
