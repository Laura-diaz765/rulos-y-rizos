/**
 * @jest-environment jsdom
 */
import { safeNextPath } from '@/lib/safe-next-path';

const origin = 'https://example.com';

describe('safeNextPath', () => {
  it.each([undefined, null, 42, {}, 'dashboard', ''])(
    'devuelve el fallback para %p',
    (value) => {
      expect(safeNextPath(value, '/home', origin)).toBe('/home');
    }
  );

  it('usa "/" como fallback por defecto', () => {
    expect(safeNextPath('nope', undefined, origin)).toBe('/');
  });

  it('conserva ruta, query y hash de rutas internas', () => {
    expect(safeNextPath('/panel?a=1#x', '/', origin)).toBe('/panel?a=1#x');
  });

  it('rechaza URLs de otro origen (//host)', () => {
    expect(safeNextPath('//evil.com/x', '/', origin)).toBe('/');
  });

  it('rechaza el truco /\\host', () => {
    expect(safeNextPath('/\\evil.com', '/', origin)).toBe('/');
  });

  it('usa window.location.origin cuando no se pasa origen', () => {
    expect(safeNextPath('/panel')).toBe('/panel');
    expect(safeNextPath('//evil.com')).toBe('/');
  });
});
