/**
 * RejectPublicationRequestInteractor — Implementacion del caso de uso
 * RejectPublicationRequest.
 *
 * Flujo:
 *   1. Cargar la solicitud por id.
 *   2. Verificar que no haya sido decidida ya (estado terminal).
 *   3. Verificar que el motivo no sea vacio.
 *   4. Llamar a aggregate.reject(), persistir y publicar eventos.
 *
 * Errores de dominio que retorna en Result.fail:
 *   - PublicationRequestNotFoundException: no existe la solicitud.
 *   - PublicationRequestAlreadyDecidedException: ya fue decidida.
 *   - DecisionMotiveRequiredException: motivo de rechazo vacio.
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
import { DecisionMotiveRequiredException } from '../../../domain/exceptions/decision-motive-required.exception';
import { PublicationRequestAlreadyDecidedException } from '../../../domain/exceptions/publication-request-already-decided.exception';
import { PublicationRequestNotFoundException } from '../../../domain/exceptions/publication-request-not-found.exception';
import {
  PUBLICATION_REQUEST_REPOSITORY,
  PublicationRequestRepositoryPort,
} from '../../ports/output/publication-request.repository.port';

import { sanitizeText } from '../../../../../shared-kernel/domain/sanitize-html.util';
import { RejectPublicationRequestInput } from './dtos/reject-publication-request-input.dto';
import { RejectPublicationRequestOutput } from './dtos/reject-publication-request-output.dto';
import { RejectPublicationRequestInputPort } from './dtos/reject-publication-request.input-port';

@Injectable()
export class RejectPublicationRequestInteractor implements RejectPublicationRequestInputPort {
  public constructor(
    @Inject(PUBLICATION_REQUEST_REPOSITORY)
    private readonly repo: PublicationRequestRepositoryPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {}

  public async execute(
    input: RejectPublicationRequestInput,
  ): Promise<Result<RejectPublicationRequestOutput, DomainException>> {
    const id = UniqueId.fromString(input.publicationRequestId);
    const maybe = await this.repo.findById(id);
    if (maybe.isAbsent()) {
      return Result.fail(new PublicationRequestNotFoundException(input.publicationRequestId));
    }
    const request = maybe.value;
    if (request.status.isTerminal()) {
      return Result.fail(new PublicationRequestAlreadyDecidedException(input.publicationRequestId));
    }
    const sanitizedMotive = sanitizeText(input.decisionMotive);
    if (sanitizedMotive.trim().length === 0) {
      return Result.fail(new DecisionMotiveRequiredException());
    }
    request.reject(UniqueId.fromString(input.decidedByAdminId), sanitizedMotive);
    await this.repo.save(request);
    const events = request.pullDomainEvents();
    await this.eventBus.publish(events);
    return Result.ok(RejectPublicationRequestInteractor.toOutput(request));
  }

  private static toOutput(request: PublicationRequest): RejectPublicationRequestOutput {
    return {
      id: request.id.value,
      referenceNumber: request.referenceNumber.value,
      status: request.status.value,
      decisionAt: request.decisionAt.value,
    };
  }
}
