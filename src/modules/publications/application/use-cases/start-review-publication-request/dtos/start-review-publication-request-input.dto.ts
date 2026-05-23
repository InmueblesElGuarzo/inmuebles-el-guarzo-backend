/**
 * StartReviewPublicationRequestInput — Datos para iniciar revisión.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface StartReviewPublicationRequestInput {
  publicationRequestId: string;
  startedByAdminId: string;
}
