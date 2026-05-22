/**
 * PublicationRequestSubmitted — Emitido cuando se registra una nueva
 * solicitud de publicación en el sistema.
 *
 * Suscriptores esperados:
 *   - audit: registra en audit_log para trazabilidad de la solicitud.
 *   - notifications (futuro): confirmación de recepción al propietario.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';

export class PublicationRequestSubmitted extends DomainEvent {
  public constructor(
    public readonly publicationRequestId: UniqueId,
    public readonly referenceNumber: string,
    public readonly ownerEmail: string,
    public readonly ownerFullName: string,
  ) {
    super();
  }

  public get eventName(): string {
    return 'PublicationRequestSubmitted';
  }
}
