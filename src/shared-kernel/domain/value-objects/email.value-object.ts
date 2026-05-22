/**
 * Email — Value Object que representa una direccion de correo electronico
 * valida en el sistema.
 *
 * Reglas de validacion:
 *   - Formato HTML5 spec (estandar de facto en aplicaciones web).
 *   - Longitud maxima 180 caracteres (alineado con schema.prisma)
 *   - Normalizado a minusculas (los emails son case-insensitive en la
 *     practica de todos los proveedores principales).
 *   - Trim de espacios al inicio y fin.
 *
 * Inmutable: una vez creado, no se puede modificar. Para cambiar el email
 * de un UserProfile, se reemplaza el VO entero.
 *
 * Construccion:
 *   const email = Email.create('Alice@Example.COM ');
 *   email.value;  // 'alice@example.com'
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { InvalidEmailFormatException } from '../exceptions/invalid-email-format.exception';

export class Email {
  // Regex HTML5 oficial (whatwg.org/html). Cubre el 99.9% de emails reales
  // sin la complejidad cromosomica de RFC 5322 completo.
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  private static readonly MAX_LENGTH = 180;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(rawValue: string): Email {
    const normalized = rawValue.trim().toLowerCase();

    if (normalized.length === 0 || normalized.length > Email.MAX_LENGTH) {
      throw new InvalidEmailFormatException(rawValue);
    }
    if (!Email.EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailFormatException(rawValue);
    }

    return new Email(normalized);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: Email): boolean {
    if (other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._value === other._value;
  }
}
