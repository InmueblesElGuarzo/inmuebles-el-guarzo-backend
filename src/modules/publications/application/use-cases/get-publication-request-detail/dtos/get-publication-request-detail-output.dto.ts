/**
 * GetPublicationRequestDetailOutput — Snapshot completo de una solicitud.
 *
 * Expone todos los campos del agregado como primitivos. Los campos Maybe<T>
 * del dominio se traducen a T | undefined. Tipo plano listo para JSON.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface GetPublicationRequestDetailOutput {
  id: string;
  referenceNumber: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhonePrimary: string;
  ownerPhoneSecondary: string | undefined;
  ownerDocumentType: string | undefined;
  ownerDocumentNumber: string | undefined;
  proposedPropertyTypeId: string | undefined;
  proposedOfferType: string;
  proposedLocation: string;
  proposedAreaM2: number | undefined;
  proposedDescription: string;
  proposedExpectedPrice: number | undefined;
  status: string;
  assignedAdvisorId: string | undefined;
  decisionAt: Date | undefined;
  decisionByAdminId: string | undefined;
  decisionMotive: string | undefined;
  captchaValidated: boolean;
  submittedFromIp: string | undefined;
  submittedFromUserAgent: string | undefined;
  dedupHash: string;
  createdAt: Date;
  updatedAt: Date;
}
