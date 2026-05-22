import { InvalidEmailFormatException } from '../exceptions/invalid-email-format.exception';
import { Email } from './email.value-object';

describe('Email.create — valid inputs', () => {
  it('should create a valid email and normalize to lowercase', () => {
    expect(Email.create('Alice@Example.COM').value).toBe('alice@example.com');
  });

  it('should trim whitespace before validating', () => {
    expect(Email.create('  alice@example.com  ').value).toBe('alice@example.com');
  });
});

describe('Email.create — invalid inputs', () => {
  it('should throw when email is empty', () => {
    expect(() => Email.create('')).toThrow(InvalidEmailFormatException);
  });

  it('should throw when email exceeds 180 characters', () => {
    const longLocal = 'a'.repeat(175);
    expect(() => Email.create(`${longLocal}@example.com`)).toThrow(InvalidEmailFormatException);
  });

  it('should throw when email has no @ symbol', () => {
    expect(() => Email.create('notanemail')).toThrow(InvalidEmailFormatException);
  });

  it('should throw when email has no domain', () => {
    expect(() => Email.create('alice@')).toThrow(InvalidEmailFormatException);
  });
});

describe('Email.equals', () => {
  it('should return true for two emails with the same value', () => {
    expect(Email.create('alice@example.com').equals(Email.create('alice@example.com'))).toBe(true);
  });

  it('should return false for two different emails', () => {
    expect(Email.create('alice@example.com').equals(Email.create('bob@example.com'))).toBe(false);
  });

  it('should return false when other is not provided', () => {
    expect(Email.create('alice@example.com').equals()).toBe(false);
  });

  it('should return true when comparing an instance to itself', () => {
    const a = Email.create('alice@example.com');
    expect(a.equals(a)).toBe(true);
  });
});
