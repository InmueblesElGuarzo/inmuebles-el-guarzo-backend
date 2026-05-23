import { InvalidPhoneNumberException } from '../exceptions/invalid-phone-number.exception';

export class PhoneNumber {
  private static readonly MAX_LENGTH = 50;
  private static readonly ALLOWED_CHARS_REGEX = /^[\d\s+\-()]+$/;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): PhoneNumber {
    const normalized = raw.trim();

    if (normalized.length === 0) {
      throw new InvalidPhoneNumberException(raw);
    }
    if (normalized.length > PhoneNumber.MAX_LENGTH) {
      throw new InvalidPhoneNumberException(raw);
    }
    if (!PhoneNumber.ALLOWED_CHARS_REGEX.test(normalized)) {
      throw new InvalidPhoneNumberException(raw);
    }

    return new PhoneNumber(normalized);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: PhoneNumber): boolean {
    if (other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._value === other._value;
  }
}
