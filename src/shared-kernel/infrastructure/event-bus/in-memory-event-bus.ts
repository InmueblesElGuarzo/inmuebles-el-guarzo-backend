/**
 * InMemoryEventBus — Implementación en memoria del EventBus.
 *
 * Mantiene un registro de handlers indexado por nombre de evento. Cuando
 * llega un publish(), busca todos los handlers suscritos al nombre del
 * evento y los ejecuta en serie, dentro de la transacción recibida.
 *
 * Decisión clave: los handlers se ejecutan en SERIE, no en paralelo.
 * Razón: si dos handlers escriben en la misma fila, ejecutarlos en
 * paralelo dentro de una transacción de Postgres puede causar deadlocks.
 * La ganancia de paralelismo no compensa el riesgo, sobre tod cuando
 * el típico caso son 1 a 3 handlers por evento.
 *
 * Si un handler falla, se propaga la excepción. La transacción que
 * llama a publish() se revierte automáticamente porque Prisma's
 * $transaction revierte ante cualquier throw.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { Injectable, Logger } from '@nestjs/common';

import { DomainEvent } from '../../domain/domain-event.base';

import { EventBus } from './event-bus.port';
import { EventHandler, TransactionContext } from './event-handler.port';

@Injectable()
export class InMemoryEventBus implements EventBus {
  private readonly logger = new Logger(InMemoryEventBus.name);
  private readonly handlersByEventName = new Map<string, EventHandler[]>();

  /**
   * Registra un handler para un nombre de evento concreto.
   * Lo llaman los módulos durante el bootstrap de NestJS (en el
   * onModuleInit del módulo correspondiente).
   *
   * Múltiples handlers pueden suscribirse al mismo evento. Se invocan
   * en el orden en que fueron registrados.
   */
  public register(eventName: string, handler: EventHandler): void {
    const existing = this.handlersByEventName.get(eventName) ?? [];
    existing.push(handler);
    this.handlersByEventName.set(eventName, existing);
    this.logger.debug(`Handler registrado para evento "${eventName}".`);
  }

  /**
   * Publica un array de eventos. Cada evento se despacha a todos los
   * handlers suscritos a su nombre. La ejecución es secuencial.
   *
   * Si cualquier handler lanza excepción, la propaga sin ejecutar los
   * handlers restantes ni los eventos posteriores. Esto garantiza que
   * la transacción que envuelve este publish() se revierta entera.
   */
  public async publish(events: readonly DomainEvent[], tx?: TransactionContext): Promise<void> {
    for (const event of events) {
      const handlers = this.handlersByEventName.get(event.eventName) ?? [];

      if (handlers.length === 0) {
        this.logger.debug(`Evento "${event.eventName}" sin handlers suscritos.`);
        continue;
      }

      if (tx === undefined) {
        this.logger.warn(
          `Evento "${event.eventName}" publicado sin transaccion; handlers omitidos.`,
        );
        continue;
      }

      for (const handler of handlers) {
        await handler.handle(event, tx);
      }
    }
  }
}
