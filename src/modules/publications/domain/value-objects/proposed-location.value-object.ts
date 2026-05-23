/**
 * ProposedLocation — Value Object para la ubicación propuesta del inmueble.
 *
 * Reglas:
 *   - No puede estar vacía
 *   - Máximo 300 caracteres (alineado con schema.prisma)
 *   - Se normaliza con trim
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { InvalidProposedLocationException } from '../exceptions/invalid-proposed-location.exception';

export class ProposedLocation {
  private static readonly MAX_LENGTH = 300;
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): ProposedLocation {
    const normalized = raw.trim();
    if (normalized.length === 0 || normalized.length > ProposedLocation.MAX_LENGTH) {
      throw new InvalidProposedLocationException(raw);
    }
    return new ProposedLocation(normalized);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: ProposedLocation): boolean {
    if (other === undefined) return false;
    return this._value === other._value;
  }
}
