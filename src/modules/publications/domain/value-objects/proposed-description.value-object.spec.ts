import { InvalidProposedDescriptionException } from '../exceptions/invalid-proposed-description.exception';
import { ProposedDescription } from './proposed-description.value-object';

const VALID_DESC = 'Hermosa casa en el norte de Medellín con amplio jardín.';
const EXACT_MIN = '12345678901234567890';

describe('ProposedDescription.create — válida', () => {
  it('should create from a valid description longer than 20 chars', () => {
    expect(ProposedDescription.create(VALID_DESC).value).toBe(VALID_DESC);
  });

  it('should create from description with exactly 20 characters', () => {
    expect(ProposedDescription.create(EXACT_MIN).value).toBe(EXACT_MIN);
  });

  it('should trim surrounding whitespace', () => {
    const result = ProposedDescription.create(`  ${VALID_DESC}  `);
    expect(result.value).toBe(VALID_DESC);
  });
});

describe('ProposedDescription.create — inválida', () => {
  it('should throw InvalidProposedDescriptionException for empty string', () => {
    expect(() => ProposedDescription.create('')).toThrow(InvalidProposedDescriptionException);
  });

  it('should throw InvalidProposedDescriptionException for whitespace-only string', () => {
    expect(() => ProposedDescription.create('   ')).toThrow(InvalidProposedDescriptionException);
  });

  it('should throw InvalidProposedDescriptionException for string shorter than 20 chars', () => {
    expect(() => ProposedDescription.create('Muy corta')).toThrow(
      InvalidProposedDescriptionException,
    );
  });

  it('should throw for string with exactly 19 characters', () => {
    expect(() => ProposedDescription.create('1234567890123456789')).toThrow(
      InvalidProposedDescriptionException,
    );
  });
});

describe('ProposedDescription.equals', () => {
  it('should return true for two descriptions with the same value', () => {
    const a = ProposedDescription.create(VALID_DESC);
    const b = ProposedDescription.create(VALID_DESC);
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for two different descriptions', () => {
    const a = ProposedDescription.create(VALID_DESC);
    const b = ProposedDescription.create('Apartamento en el centro de la ciudad amplia.');
    expect(a.equals(b)).toBe(false);
  });

  it('should return false when other is undefined', () => {
    expect(ProposedDescription.create(VALID_DESC).equals(undefined)).toBe(false);
  });
});
