/**
 * ListPublicationRequestsInput — Filtros y paginacion para listar solicitudes.
 *
 * Todos los campos son opcionales: sin filtros devuelve todas las solicitudes
 * con paginacion por defecto que aplica el interactor.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

export interface ListPublicationRequestsInput {
  status?: string;
  assignedAdvisorId?: string;
  page?: number;
  limit?: number;
}
