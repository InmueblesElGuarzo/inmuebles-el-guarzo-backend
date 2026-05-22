/**
 * EventBus — Puerto para publicar eventos de dominio.
 *
 * Cualquier interactor que necesite publicar eventos depende de esta
 * interfaz, no de la implementación concreta. NestJS resuelve la
 * inyección hacia InMemoryEventBus mediante un Symbol token.
 *
 * Contrato:
 *   - publish() recibe un array de eventos y los despacha a todos los
 *     handlers registrados.
 *   - Es síncrono respecto a la transacción: los handlers se ejecutan
 *     ANTES de que la transacción haga commit.
 *   - Si cualquier handler falla, lanza excepción y la transacción
 *     completa se revierte.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { DomainEvent } from '../../domain/domain-event.base';

import { TransactionContext } from './event-handler.port';

export interface EventBus {
  publish(events: readonly DomainEvent[], tx?: TransactionContext): Promise<void>;
}

/**
 * Symbol token para inyección por NestJS. Se usa así en los providers:
 *
 *   { provide: EVENT_BUS, useClass: InMemoryEventBus }
 *
 * Y así en los consumidores:
 *
 *   constructor(@Inject(EVENT_BUS) private readonly eventBus: EventBus) {}
 */
export const EVENT_BUS = Symbol('EventBus');
