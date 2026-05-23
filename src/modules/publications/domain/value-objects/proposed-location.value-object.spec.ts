import { InvalidProposedLocationException } from '../exceptions/invalid-proposed-location.exception';
import { ProposedLocation } from './proposed-location.value-object';

const VALID_LOCATION = 'Medellín, Antioquia, Colombia';
const LOCATION_300 = 'A'.repeat(300);
const LOCATION_301 = 'A'.repeat(301);

describe('ProposedLocation.create — válida', () => {
  it('should create from a valid location string', () => {
    expect(ProposedLocation.create(VALID_LOCATION).value).toBe(VALID_LOCATION);
  });

  it('should trim surrounding whitespace', () => {
    expect(ProposedLocation.create('  Bogotá  ').value).toBe('Bogotá');
  });

  it('should create with exactly 300 characters (upper boundary)', () => {
    expect(ProposedLocation.create(LOCATION_300).value).toBe(LOCATION_300);
  });
});

describe('ProposedLocation.create — inválida', () => {
  it('should throw InvalidProposedLocationException for empty string', () => {
    expect(() => ProposedLocation.create('')).toThrow(InvalidProposedLocationException);
  });

  it('should throw InvalidProposedLocationException for whitespace-only string', () => {
    expect(() => ProposedLocation.create('   ')).toThrow(InvalidProposedLocationException);
  });

  it('should throw InvalidProposedLocationException for string with 301 characters', () => {
    expect(() => ProposedLocation.create(LOCATION_301)).toThrow(InvalidProposedLocationException);
  });
});

describe('ProposedLocation.equals', () => {
  it('should return true for two locations with the same value', () => {
    const a = ProposedLocation.create(VALID_LOCATION);
    const b = ProposedLocation.create(VALID_LOCATION);
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for two different locations', () => {
    const a = ProposedLocation.create('Medellín, Antioquia');
    const b = ProposedLocation.create('Bogotá, Cundinamarca');
    expect(a.equals(b)).toBe(false);
  });

  it('should return false when other is undefined', () => {
    expect(ProposedLocation.create(VALID_LOCATION).equals()).toBe(false);
  });
});
