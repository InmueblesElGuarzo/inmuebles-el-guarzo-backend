/**
 * PublicationRequestOfferType — Value Object que representa el tipo
 * de oferta propuesto por el propietario en la solicitud.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { InvalidOfferTypeException } from '../exceptions/invalid-offer-type.exception';

export enum PublicationRequestOfferTypeValue {
  SALE = 'SALE',
  RENT = 'RENT',
  BOTH = 'BOTH',
}

export class PublicationRequestOfferType {
  private readonly _value: PublicationRequestOfferTypeValue;

  private constructor(value: PublicationRequestOfferTypeValue) {
    this._value = value;
  }

  public static create(raw: string): PublicationRequestOfferType {
    const upper = raw.trim().toUpperCase();
    if (
      !Object.values(PublicationRequestOfferTypeValue).includes(
        upper as PublicationRequestOfferTypeValue,
      )
    ) {
      throw new InvalidOfferTypeException(raw);
    }
    return new PublicationRequestOfferType(upper as PublicationRequestOfferTypeValue);
  }

  public get value(): PublicationRequestOfferTypeValue {
    return this._value;
  }

  public equals(other?: PublicationRequestOfferType): boolean {
    if (other === undefined) return false;
    return this._value === other._value;
  }
}
