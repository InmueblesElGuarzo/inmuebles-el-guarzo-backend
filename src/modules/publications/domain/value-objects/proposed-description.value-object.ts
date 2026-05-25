/**
 * ProposedDescription — Value Object para la descripción propuesta
 * del inmueble en la solicitud de publicación.
 *
 * Reglas:
 * - No puede estar vacía
 * - Mínimo 20 caracteres para garantizar información útil
 * - Máximo 2000 caracteres para evitar textos excesivos
 * - Se normaliza con trim
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { sanitizeText } from '../../../../shared-kernel/domain/sanitize-html.util';
import { InvalidProposedDescriptionException } from '../exceptions/invalid-proposed-description.exception';

export class ProposedDescription {
  private static readonly MIN_LENGTH = 20;
  private static readonly MAX_LENGTH = 2000; // ← Nueva regla
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): ProposedDescription {
    const sanitized = sanitizeText(raw);
    const normalized = sanitized.trim();
    const length = normalized.length;

    if (length < ProposedDescription.MIN_LENGTH || length > ProposedDescription.MAX_LENGTH) {
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
