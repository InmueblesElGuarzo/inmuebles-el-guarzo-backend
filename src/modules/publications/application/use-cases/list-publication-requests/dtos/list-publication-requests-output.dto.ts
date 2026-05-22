/**
 * ListPublicationRequestsOutput — Respuesta paginada de solicitudes.
 *
 * PublicationRequestSummary es el snapshot minimo para listas/tablas.
 * Tipo plano listo para JSON.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface PublicationRequestSummary {
  id: string;
  referenceNumber: string;
  ownerFullName: string;
  ownerEmail: string;
  status: string;
  assignedAdvisorId: string | undefined;
  createdAt: Date;
}

export interface ListPublicationRequestsOutput {
  items: PublicationRequestSummary[];
  total: number;
  page: number;
  limit: number;
}
