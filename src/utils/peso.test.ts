import { describe, expect, it } from 'vitest';
import { formatarPeso } from './peso';

describe('formatarPeso', () => {
  it('mostra gramas quando < 1 kg', () => {
    expect(formatarPeso(500)).toBe('500 g');
    expect(formatarPeso(999)).toBe('999 g');
  });

  it('mostra kg quando >= 1 kg', () => {
    expect(formatarPeso(1000)).toBe('1 kg');
    expect(formatarPeso(1500)).toBe('1,5 kg');
    expect(formatarPeso(20000)).toBe('20 kg');
  });

  it('usa vírgula como separador decimal (pt-BR)', () => {
    expect(formatarPeso(2500)).toBe('2,5 kg');
  });

  it('omite casas decimais quando exato', () => {
    expect(formatarPeso(5000)).toBe('5 kg');
  });

  it('lida com 0 gramas', () => {
    expect(formatarPeso(0)).toBe('0 g');
  });
});
