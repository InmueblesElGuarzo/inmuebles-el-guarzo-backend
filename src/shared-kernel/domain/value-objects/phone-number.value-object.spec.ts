import { InvalidPhoneNumberException } from '../exceptions/invalid-phone-number.exception';
import { PhoneNumber } from './phone-number.value-object';

describe('PhoneNumber.create — valid inputs', () => {
  it('should create a phone number with digits only', () => {
    expect(PhoneNumber.create('3001234567').value).toBe('3001234567');
  });

  it('should accept international format with +, spaces, dashes and parentheses', () => {
    expect(PhoneNumber.create('+57 (300) 123-4567').value).toBe('+57 (300) 123-4567');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(PhoneNumber.create('  3001234567  ').value).toBe('3001234567');
  });
});

describe('PhoneNumber.create — invalid inputs', () => {
  it('should throw when value is empty', () => {
    expect(() => PhoneNumber.create('')).toThrow(InvalidPhoneNumberException);
  });

  it('should throw when value exceeds 50 characters', () => {
    expect(() => PhoneNumber.create('3'.repeat(51))).toThrow(InvalidPhoneNumberException);
  });

  it('should throw when value contains invalid characters', () => {
    expect(() => PhoneNumber.create('+57abc123')).toThrow(InvalidPhoneNumberException);
  });
});

describe('PhoneNumber.equals', () => {
  it('should return true for two phone numbers with the same value', () => {
    expect(PhoneNumber.create('3001234567').equals(PhoneNumber.create('3001234567'))).toBe(true);
  });

  it('should return false for two different phone numbers', () => {
    expect(PhoneNumber.create('3001234567').equals(PhoneNumber.create('3107654321'))).toBe(false);
  });

  it('should return false when other is not provided', () => {
    expect(PhoneNumber.create('3001234567').equals()).toBe(false);
  });
});
