/**
 * AggregateRoot — Clase base para todos los aggregate roots del dominio.
 *
 * Un Aggregate Root es la entidad principal de un grupo cohesivo de
 * objetos del dominio que cambian juntos. Es el ÚNICO punto de entrada
 * al agregado: el repositorio carga y guarda Aggregate Roots, no las
 * entidades internas.
 *
 * Aggregate Roots acumulan eventos de dominio que se publican cuando
 * la transacción que los modificó completa exitosamente.
 *
 * Ejemplos en Inmuebles El Guarzo:
 *   - Property (con sus imágenes y atributos)
 *   - Offer (con su historial de transiciones de estado)
 *   - PublicationRequest
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { DomainEvent } from './domain-event.base';
import { Entity } from './entity.base';
import { UniqueId } from './unique-id.value-object';

export abstract class AggregateRoot<TId extends UniqueId = UniqueId> extends Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * Registra un evento de dominio que será publicado cuando la transacción
   * que modificó este aggregate complete exitosamente.
   *
   * Los eventos NO se publican aquí; se acumulan. La publicación efectiva
   * la hace el use case interactor después de persistir los cambios.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Devuelve los eventos acumulados y los limpia internamente.
   * Llamado por el use case interactor después de persistir el aggregate.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  /**
   * Útil para testing: permite inspeccionar eventos sin consumirlos.
   */
  public peekDomainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }
}
