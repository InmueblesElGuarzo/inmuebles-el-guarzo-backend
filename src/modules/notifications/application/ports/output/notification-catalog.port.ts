/**
 * NotificationCatalogPort — Puerto de salida para envío de notificaciones
 * a través del catálogo centralizado de Novu.
 *
 * Desacopla los handlers de eventos del proveedor concreto de notificaciones.
 *
 * → CAPA: Application (Uncle Bob)
 */

export interface TriggerNotificationParams {
  workflowId: string;
  subscriberId: string;
  payload: Record<string, string>;
}

export interface NotificationCatalogPort {
  trigger(params: TriggerNotificationParams): Promise<void>;
}

export const NOTIFICATION_CATALOG = Symbol('NotificationCatalog');

export const NOTIFICATION_WORKFLOWS = {
  PUBLICATION_APPROVED: 'publication-approved',
  PUBLICATION_REJECTED: 'publication-rejected',
} as const;
