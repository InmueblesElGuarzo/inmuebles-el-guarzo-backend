/**
 * SubmitPublicationRequestOutput — Snapshot minimo de la solicitud recien creada.
 *
 * Solo expone los campos que el cliente necesita para confirmar la recepcion
 * y hacer un follow-up. Tipo plano listo para JSON.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface SubmitPublicationRequestOutput {
  id: string;
  referenceNumber: string;
  status: string;
  createdAt: Date;
}
