/**
 * RejectPublicationRequestInput — Datos necesarios para rechazar una solicitud.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface RejectPublicationRequestInput {
  publicationRequestId: string;
  decidedByAdminId: string;
  decisionMotive: string;
}
