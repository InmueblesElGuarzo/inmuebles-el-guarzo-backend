/**
 * PublicationRequestRejected — Emitido cuando un administrador rechaza
 * una solicitud de publicación.
 *
 * Suscriptores esperados:
 *   - notifications: envía correo de rechazo al propietario con el
 *     motivo de la decisión incluido en el evento.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';

interface PublicationRequestRejectedProps {
  publicationRequestId: UniqueId;
  referenceNumber: string;
  ownerEmail: string;
  ownerFullName: string;
  decisionMotive: string;
  decidedByAdminId: string;
}

export class PublicationRequestRejected extends DomainEvent {
  public readonly publicationRequestId: UniqueId;
  public readonly referenceNumber: string;
  public readonly ownerEmail: string;
  public readonly ownerFullName: string;
  public readonly decisionMotive: string;
  public readonly decidedByAdminId: string;

  public constructor(props: PublicationRequestRejectedProps) {
    super();
    this.publicationRequestId = props.publicationRequestId;
    this.referenceNumber = props.referenceNumber;
    this.ownerEmail = props.ownerEmail;
    this.ownerFullName = props.ownerFullName;
    this.decisionMotive = props.decisionMotive;
    this.decidedByAdminId = props.decidedByAdminId;
  }

  public get eventName(): string {
    return 'PublicationRequestRejected';
  }
}
