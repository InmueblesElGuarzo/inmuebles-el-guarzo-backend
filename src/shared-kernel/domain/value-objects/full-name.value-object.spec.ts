import { InvalidFullNameException } from '../exceptions/invalid-full-name.exception';
import { FullName } from './full-name.value-object';

describe('FullName.create — valid inputs', () => {
  it('should create a valid full name with proper case', () => {
    expect(FullName.create('juan perez').value).toBe('Juan Perez');
  });

  it('should lowercase particles that are not the first word', () => {
    expect(FullName.create('juan DE la vega').value).toBe('Juan de la Vega');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(FullName.create('  juan perez  ').value).toBe('Juan Perez');
  });

  it('should collapse multiple consecutive spaces into one', () => {
    expect(FullName.create('juan   perez').value).toBe('Juan Perez');
  });

  it('should capitalize the first particle when it is the first word', () => {
    expect(FullName.create('de la vega torres').value).toBe('De la Vega Torres');
  });
});

describe('FullName.create — invalid inputs', () => {
  it('should throw when name has no internal space', () => {
    expect(() => FullName.create('juanperez')).toThrow(InvalidFullNameException);
  });

  it('should throw when name is shorter than 2 characters', () => {
    expect(() => FullName.create('a')).toThrow(InvalidFullNameException);
  });

  it('should throw when name exceeds 150 characters', () => {
    const long = 'a'.repeat(76) + ' ' + 'b'.repeat(75);
    expect(() => FullName.create(long)).toThrow(InvalidFullNameException);
  });

  it('should throw when name contains control characters', () => {
    expect(() => FullName.create('juan\x00perez')).toThrow(InvalidFullNameException);
  });
});

describe('FullName.equals', () => {
  it('should return true for two names with the same normalized value', () => {
    expect(FullName.create('juan perez').equals(FullName.create('juan perez'))).toBe(true);
  });

  it('should return false for two different names', () => {
    expect(FullName.create('juan perez').equals(FullName.create('maria lopez'))).toBe(false);
  });

  it('should return false when other is not provided', () => {
    expect(FullName.create('juan perez').equals()).toBe(false);
  });

  it('should return true when comparing an instance to itself', () => {
    const a = FullName.create('juan perez');
    expect(a.equals(a)).toBe(true);
  });
});
