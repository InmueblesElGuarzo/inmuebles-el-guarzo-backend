/**
 * StartReviewPublicationRequestOutput — Confirmación de inicio de revisión.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface StartReviewPublicationRequestOutput {
  id: string;
  referenceNumber: string;
  status: string;
  updatedAt: Date;
}
