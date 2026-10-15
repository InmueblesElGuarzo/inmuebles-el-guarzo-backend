import { resolveClientIp } from './client-ip';

const FALLBACK_IP = '::ffff:10.0.0.1';
// IPv4 embebida en IPv6 con todos los grupos: el texto IP más largo posible
const LONGEST_IP = '0000:0000:0000:0000:0000:ffff:255.255.255.255';

describe('resolveClientIp', () => {
  it.each([
    ['IPv4', '1.2.3.4'],
    ['IPv6', '2001:db8::1'],
    ['IPv6 de 45 caracteres', LONGEST_IP],
  ])('should use the header when it is a valid %s', (_label, header) => {
    expect(resolveClientIp(header, FALLBACK_IP)).toBe(header);
  });

  it('should trim surrounding whitespace from the header', () => {
    expect(resolveClientIp('  1.2.3.4\t', FALLBACK_IP)).toBe('1.2.3.4');
  });

  it.each([
    ['ausente', undefined],
    ['duplicado (array)', ['1.2.3.4', '5.6.7.8']],
    ['vacío', ''],
    ['solo espacios', '   '],
    ['lista separada por comas', '1.2.3.4, 5.6.7.8'],
    ['basura', 'not-an-ip'],
    ['inyección', "1.2.3.4'; DROP TABLE publication_requests;--"],
    ['salto de línea', '1.2.3.4\nX-Injected: 1'],
    ['IPv4 fuera de rango', '256.1.1.1'],
    ['IPv6 con zone ID', 'fe80::1%eth0'],
    ['valor de 46 caracteres', '1111:2222:3333:4444:5555:6666:7777:8888%abcdef'],
    ['header larguísimo', '1'.repeat(10_000)],
  ])('should fall back when the header is %s', (_label, header) => {
    expect(resolveClientIp(header, FALLBACK_IP)).toBe(FALLBACK_IP);
  });

  it('should trim the fallback IP', () => {
    expect(resolveClientIp(undefined, ' 10.0.0.1 ')).toBe('10.0.0.1');
  });

  it.each([
    ['ausente', undefined],
    ['vacío', ''],
    ['basura', 'not-an-ip'],
    ['IPv6 con zone ID', 'fe80::1%eth0'],
    ['valor de 46 caracteres', '1111:2222:3333:4444:5555:6666:7777:8888%abcdef'],
  ])(
    'should return undefined when the header and the fallback (%s) are invalid',
    (_l, fallback) => {
      expect(resolveClientIp('not-an-ip', fallback)).toBeUndefined();
    },
  );
});
