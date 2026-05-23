/**
 * ProposedDescription — Value Object para la descripción propuesta
 * del inmueble en la solicitud de publicación.
 *
 * Reglas:
 *   - No puede estar vacía
 *   - Mínimo 20 caracteres para garantizar información útil
 *   - Sin límite explícito de longitud (texto largo es válido)
 *   - Se normaliza con trim
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { InvalidProposedDescriptionException } from '../exceptions/invalid-proposed-description.exception';

export class ProposedDescription {
  private static readonly MIN_LENGTH = 20;
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): ProposedDescription {
    const normalized = raw.trim();
    if (normalized.length < ProposedDescription.MIN_LENGTH) {
      throw new InvalidProposedDescriptionException(raw);
    }
    return new ProposedDescription(normalized);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: ProposedDescription): boolean {
    if (other === undefined) return false;
    return this._value === other._value;
  }
}
