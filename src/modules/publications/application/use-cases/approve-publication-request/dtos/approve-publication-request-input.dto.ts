/**
 * ApprovePublicationRequestInput — Datos necesarios para aprobar una solicitud.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface ApprovePublicationRequestInput {
  publicationRequestId: string;
  decidedByAdminId: string;
}
