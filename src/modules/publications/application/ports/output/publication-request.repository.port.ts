/**
 * PublicationRequestRepositoryPort — Puerto de salida del modulo Publications
 * hacia la persistencia de PublicationRequests.
 *
 * Define el contrato que el dominio necesita para cargar y guardar
 * PublicationRequests, sin saber nada de Prisma ni de infraestructura.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { TransactionContext } from '../../../../../shared-kernel/infrastructure/event-bus/event-handler.port';

import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { PublicationRequestStatusValue } from '../../../domain/value-objects/publication-request-status.value-object';

export interface ListPublicationRequestsFilters {
  status?: PublicationRequestStatusValue;
  assignedAdvisorId?: string;
  page: number;
  limit: number;
}

export interface PublicationRequestRepositoryPort {
  /**
   * Busca por id. Retorna Maybe.none() si no existe.
   * Solo lanza ante fallos de infraestructura.
   */
  findById(id: UniqueId, tx?: TransactionContext): Promise<Maybe<PublicationRequest>>;

  /**
   * Busca por hash de deduplicacion. Retorna Maybe.none() si no existe.
   * Usado para prevenir envios duplicados.
   */
  findByDedupHash(hash: string, tx?: TransactionContext): Promise<Maybe<PublicationRequest>>;

  /**
   * Persiste un PublicationRequest (upsert por id).
   */
  save(request: PublicationRequest, tx?: TransactionContext): Promise<void>;

  /**
   * Lista solicitudes con filtros opcionales y paginacion.
   * Retorna tupla [items, total].
   */
  findAll(
    filters: ListPublicationRequestsFilters,
    tx?: TransactionContext,
  ): Promise<[PublicationRequest[], number]>;

  /**
   * Genera el siguiente numero de referencia correlativo para el año dado.
   * Debe ser atomico (se ejecuta dentro de una transaccion o con un lock).
   */
  nextReferenceNumber(year: number, tx?: TransactionContext): Promise<number>;
}

export const PUBLICATION_REQUEST_REPOSITORY = Symbol('PublicationRequestRepository');
