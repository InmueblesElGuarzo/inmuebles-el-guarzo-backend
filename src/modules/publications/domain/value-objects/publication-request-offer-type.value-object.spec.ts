import { InvalidOfferTypeException } from '../exceptions/invalid-offer-type.exception';
import {
  PublicationRequestOfferType,
  PublicationRequestOfferTypeValue,
} from './publication-request-offer-type.value-object';

describe('PublicationRequestOfferType.create — valores válidos', () => {
  it('should create SALE offer type', () => {
    expect(PublicationRequestOfferType.create('SALE').value).toBe(
      PublicationRequestOfferTypeValue.SALE,
    );
  });

  it('should create RENT offer type', () => {
    expect(PublicationRequestOfferType.create('RENT').value).toBe(
      PublicationRequestOfferTypeValue.RENT,
    );
  });

  it('should create BOTH offer type', () => {
    expect(PublicationRequestOfferType.create('BOTH').value).toBe(
      PublicationRequestOfferTypeValue.BOTH,
    );
  });

  it('should normalize lowercase input to uppercase', () => {
    expect(PublicationRequestOfferType.create('sale').value).toBe(
      PublicationRequestOfferTypeValue.SALE,
    );
  });

  it('should normalize mixed-case input to uppercase', () => {
    expect(PublicationRequestOfferType.create('Rent').value).toBe(
      PublicationRequestOfferTypeValue.RENT,
    );
  });
});

describe('PublicationRequestOfferType.create — valor inválido', () => {
  it('should throw InvalidOfferTypeException for unknown value', () => {
    expect(() => PublicationRequestOfferType.create('UNKNOWN')).toThrow(InvalidOfferTypeException);
  });

  it('should throw InvalidOfferTypeException for empty string', () => {
    expect(() => PublicationRequestOfferType.create('')).toThrow(InvalidOfferTypeException);
  });
});

describe('PublicationRequestOfferType.equals', () => {
  it('should return true for two equal offer types', () => {
    const a = PublicationRequestOfferType.create('SALE');
    const b = PublicationRequestOfferType.create('SALE');
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for different offer types', () => {
    const a = PublicationRequestOfferType.create('SALE');
    const b = PublicationRequestOfferType.create('RENT');
    expect(a.equals(b)).toBe(false);
  });

  it('should return false when other is undefined', () => {
    expect(PublicationRequestOfferType.create('SALE').equals(undefined)).toBe(false);
  });
});
