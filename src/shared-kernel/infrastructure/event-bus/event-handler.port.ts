/**
 * EventHandler — Contrato que todos los handler de eventos de dominio cumple.
 *
 * Un EventHandler reacciona a un tipo concreto de DomainEvent ejecutando
 * efectos: registrar auditoria, emitir notificaciones, actualizar
 * proyecciones, etc.
 *
 * Vive en el módulo que REACCIONA al evento, no en el que lo emite.
 * Por ejemplo: PublicationRequestApprovedAuditHandler vive en el módulo
 * `audit`, no en `publications`. Esto invierte la dependencia y mantiene
 * los bounded contexts desacoplados.
 *
 * Decisión: handle() es síncrono respecto a la transacción que disparó
 * el evento. Recibe la transacción activa y ejecuta sus efectos dentro
 * de ella. Si lanza excepción, toda la operación se revierte.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob), porque el tipo de la
 *   transaccion (Prisma.TransactionClient) es de infraestructura.
 *   Sin embargo, los handlers concretos viven en `application/` de
 *   cada módulo y reciben este tipo como parametro opaco.
 */

import { Prisma } from '@prisma/client';

import { DomainEvent } from '../../domain/domain-event.base';

/**
 * Tipo de la transacción activa de Prisma.
 * Es el cliente que se obtiene dentro de un `prisma.$transaction(...)`.
 * Se expone aquí para que los handlers puedan tipar correctamente sus
 * operaciones de persistencia sin importar Prisma directamente.
 */
export type TransactionContext = Prisma.TransactionClient;

export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  handle(event: TEvent, tx?: TransactionContext): Promise<void>;
}
