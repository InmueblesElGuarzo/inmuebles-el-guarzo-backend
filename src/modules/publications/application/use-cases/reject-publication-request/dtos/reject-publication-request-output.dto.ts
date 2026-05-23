/**
 * RejectPublicationRequestOutput — Confirmacion del rechazo.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface RejectPublicationRequestOutput {
  id: string;
  referenceNumber: string;
  status: string;
  decisionAt: Date;
}
