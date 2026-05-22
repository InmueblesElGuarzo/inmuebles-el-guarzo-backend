import { InvalidReferenceNumberException } from '../exceptions/invalid-reference-number.exception';
import { ReferenceNumber } from './reference-number.value-object';

describe('ReferenceNumber.generate', () => {
  it('should generate a reference number with the correct format', () => {
    expect(ReferenceNumber.generate(2026, 1).value).toBe('PUB-2026-00001');
  });

  it('should pad the sequence with leading zeros to 5 digits', () => {
    expect(ReferenceNumber.generate(2026, 42).value).toBe('PUB-2026-00042');
  });

  it('should handle sequence at the maximum 5-digit value', () => {
    expect(ReferenceNumber.generate(2026, 99999).value).toBe('PUB-2026-99999');
  });
});

describe('ReferenceNumber.create — valid inputs', () => {
  it('should reconstruct a reference number from a valid string', () => {
    expect(ReferenceNumber.create('PUB-2026-00001').value).toBe('PUB-2026-00001');
  });
});

describe('ReferenceNumber.create — invalid inputs', () => {
  it('should throw when format is missing the PUB prefix', () => {
    expect(() => ReferenceNumber.create('REF-2026-00001')).toThrow(InvalidReferenceNumberException);
  });

  it('should throw when sequence has fewer than 5 digits', () => {
    expect(() => ReferenceNumber.create('PUB-2026-001')).toThrow(InvalidReferenceNumberException);
  });

  it('should throw when value is an empty string', () => {
    expect(() => ReferenceNumber.create('')).toThrow(InvalidReferenceNumberException);
  });
});

describe('ReferenceNumber.equals', () => {
  it('should return true for two reference numbers with the same value', () => {
    expect(
      ReferenceNumber.create('PUB-2026-00001').equals(ReferenceNumber.create('PUB-2026-00001')),
    ).toBe(true);
  });

  it('should return false for two different reference numbers', () => {
    expect(
      ReferenceNumber.create('PUB-2026-00001').equals(ReferenceNumber.create('PUB-2026-00002')),
    ).toBe(false);
  });

  it('should return false when other is not provided', () => {
    expect(ReferenceNumber.create('PUB-2026-00001').equals()).toBe(false);
  });
});
