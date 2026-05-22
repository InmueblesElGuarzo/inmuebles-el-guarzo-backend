/**
 * FullName — Value Object que representa el nombre completo de una
 * persona en el sistema.
 *
 * Reglas:
 *   - Trim de espacios al inicio y fin.
 *   - Multiples espacios consecutivos se colapsan a uno solo.
 *   - Longitud (despues de normalizar) entre 2 y 150 caracteres,
 *     alineado con schema.prisma (full_name VarChar(150)).
 *   - Sin caracteres de control.
 *   - Al menos un espacio interno (regla del negocio: nombre y
 *     apellido obligatorios sin falta).
 *
 * Normalizacion de capitalizacion (Proper Case espanol):
 *   - Primera letra de cada palabra en mayuscula.
 *   - Particulas comunes (de, del, la, las, etc.) se mantienen en
 *     minuscula cuando NO son la primera palabra.
 *   - Ejemplo: "juan DE la vega" → "Juan de la Vega".
 *
 * Limitacion conocida (deuda tecnica aceptada):
 *   - Nombres con capitalizacion interna (McDonald, O'Brien) se
 *     normalizan a "Mcdonald", "O'brien". Si el negocio reporta
 *     casos reales, se refactoriza con parser mas sofisticado.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { InvalidFullNameException } from '../exceptions/invalid-full-name.exception';

export class FullName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 150;
  // eslint-disable-next-line no-control-regex
  private static readonly CONTROL_CHARS_REGEX = /[\x00-\x1F\x7F]/;
  private static readonly MULTIPLE_WHITESPACE_REGEX = /\s+/g;

  // Particulas que no se capitalizan cuando aparecen DESPUES de la
  // primera palabra. Lista basada en convenciones de espanol y
  // apellidos comunes en Colombia (incluye origenes italianos,
  // alemanes y holandeses presentes en el pais).
  private static readonly LOWERCASE_PARTICLES: ReadonlySet<string> = new Set([
    'de',
    'del',
    'la',
    'las',
    'el',
    'los',
    'y',
    'da',
    'das',
    'do',
    'dos',
    'di',
    'van',
    'von',
    'der',
    'den',
  ]);

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(rawValue: string): FullName {
    const trimmed = rawValue.trim().replace(FullName.MULTIPLE_WHITESPACE_REGEX, ' ');

    if (trimmed.length < FullName.MIN_LENGTH || trimmed.length > FullName.MAX_LENGTH) {
      throw new InvalidFullNameException(rawValue);
    }
    if (FullName.CONTROL_CHARS_REGEX.test(trimmed)) {
      throw new InvalidFullNameException(rawValue);
    }
    if (!trimmed.includes(' ')) {
      throw new InvalidFullNameException(rawValue);
    }

    const normalized = FullName.toProperCase(trimmed);
    return new FullName(normalized);
  }

  private static toProperCase(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map((word, index) => FullName.capitalizeWord(word, index))
      .join(' ');
  }

  private static capitalizeWord(word: string, index: number): string {
    if (word.length === 0) {
      return word;
    }
    if (index > 0 && FullName.LOWERCASE_PARTICLES.has(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: FullName): boolean {
    if (other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._value === other._value;
  }
}
