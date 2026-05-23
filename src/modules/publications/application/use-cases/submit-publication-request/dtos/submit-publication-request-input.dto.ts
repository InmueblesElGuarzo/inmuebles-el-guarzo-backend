/**
 * SubmitPublicationRequestInput — Datos que el caso de uso necesita para
 * crear una nueva solicitud de publicacion.
 *
 * Todos los campos son primitivos: la conversion a VOs la hace el interactor.
 * Los campos opcionales usan undefined (no null) segun la convencion de DTOs.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface SubmitPublicationRequestInput {
  ownerFullName: string;
  ownerEmail: string;
  ownerPhonePrimary: string;
  ownerPhoneSecondary?: string;
  ownerDocumentType?: string;
  ownerDocumentNumber?: string;
  proposedPropertyTypeId?: string;
  proposedOfferType: string;
  proposedLocation: string;
  proposedAreaM2?: number;
  proposedDescription: string;
  proposedExpectedPrice?: number;
  captchaToken: string;
  submittedFromIp?: string;
  submittedFromUserAgent?: string;
}
