/**
 * ApprovePublicationRequestOutput — Confirmacion de la aprobacion.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface ApprovePublicationRequestOutput {
  id: string;
  referenceNumber: string;
  status: string;
  decisionAt: Date;
}
