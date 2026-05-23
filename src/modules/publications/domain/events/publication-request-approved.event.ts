/**
 * PublicationRequestApproved — Emitido cuando un administrador aprueba
 * una solicitud de publicación.
 *
 * Suscriptores esperados:
 *   - notifications: envía correo de aprobación al propietario.
 *   - handler futuro: crea el PropertyOwner y la Property correspondiente
 *     con los datos del propietario incluidos en este evento.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';

interface PublicationRequestApprovedProps {
  publicationRequestId: UniqueId;
  referenceNumber: string;
  ownerEmail: string;
  ownerFullName: string;
  ownerPhonePrimary: string;
  ownerPhoneSecondary: string | undefined;
  ownerDocumentType: string | undefined;
  ownerDocumentNumber: string | undefined;
  decidedByAdminId: string;
}

export class PublicationRequestApproved extends DomainEvent {
  public readonly publicationRequestId: UniqueId;
  public readonly referenceNumber: string;
  public readonly ownerEmail: string;
  public readonly ownerFullName: string;
  public readonly ownerPhonePrimary: string;
  public readonly ownerPhoneSecondary: string | undefined;
  public readonly ownerDocumentType: string | undefined;
  public readonly ownerDocumentNumber: string | undefined;
  public readonly decidedByAdminId: string;

  public constructor(props: PublicationRequestApprovedProps) {
    super();
    this.publicationRequestId = props.publicationRequestId;
    this.referenceNumber = props.referenceNumber;
    this.ownerEmail = props.ownerEmail;
    this.ownerFullName = props.ownerFullName;
    this.ownerPhonePrimary = props.ownerPhonePrimary;
    this.ownerPhoneSecondary = props.ownerPhoneSecondary;
    this.ownerDocumentType = props.ownerDocumentType;
    this.ownerDocumentNumber = props.ownerDocumentNumber;
    this.decidedByAdminId = props.decidedByAdminId;
  }

  public get eventName(): string {
    return 'PublicationRequestApproved';
  }
}
