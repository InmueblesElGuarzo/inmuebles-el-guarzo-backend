import { InvalidReferenceNumberException } from '../exceptions/invalid-reference-number.exception';

export class ReferenceNumber {
  private static readonly FORMAT_REGEX = /^PUB-\d{4}-\d{5}$/;
  private static readonly SEQUENCE_PAD = 5;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static generate(year: number, sequence: number): ReferenceNumber {
    const padded = String(sequence).padStart(ReferenceNumber.SEQUENCE_PAD, '0');
    return new ReferenceNumber(`PUB-${year}-${padded}`);
  }

  public static create(raw: string): ReferenceNumber {
    if (!ReferenceNumber.FORMAT_REGEX.test(raw)) {
      throw new InvalidReferenceNumberException(raw);
    }
    return new ReferenceNumber(raw);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: ReferenceNumber): boolean {
    if (other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._value === other._value;
  }
}
