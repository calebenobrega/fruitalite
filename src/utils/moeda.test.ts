import { describe, expect, it } from 'vitest';
import { formatarMoeda, formatarMoedaCompact, parseMoeda } from './moeda';

describe('formatarMoeda', () => {
  it('formata 0 centavos como R$ 0,00', () => {
    expect(formatarMoeda(0)).toMatch(/R\$\s*0,00/);
  });

  it('formata 100 centavos como R$ 1,00', () => {
    expect(formatarMoeda(100)).toMatch(/R\$\s*1,00/);
  });

  it('formata 12345 centavos como R$ 123,45', () => {
    expect(formatarMoeda(12345)).toMatch(/R\$\s*123,45/);
  });

  it('usa separador de milhar com ponto', () => {
    expect(formatarMoeda(1234567)).toMatch(/R\$\s*12\.345,67/);
  });
});

describe('formatarMoedaCompact', () => {
  it('formata sem o prefixo R$', () => {
    expect(formatarMoedaCompact(12345)).toBe('123,45');
  });

  it('formata 0 como 0,00', () => {
    expect(formatarMoedaCompact(0)).toBe('0,00');
  });

  it('sempre tem 2 casas decimais', () => {
    expect(formatarMoedaCompact(1000)).toBe('10,00');
  });
});

describe('parseMoeda', () => {
  it('parseia decimal com vírgula', () => {
    expect(parseMoeda('12,34')).toBe(1234);
  });

  it('trata ponto como separador de milhar (formato BR), não decimal', () => {
    // "12.34" no formato BR seria "doze mil e trinta e quatro" — sem
    // vírgula é tudo inteiro = R$ 1234,00 = 123400 centavos.
    expect(parseMoeda('12.34')).toBe(123400);
  });

  it('parseia milhar com ponto + decimal vírgula (formato BR)', () => {
    expect(parseMoeda('1.234,56')).toBe(123456);
  });

  it('parseia inteiro como reais', () => {
    expect(parseMoeda('100')).toBe(10000);
  });

  it('arredonda 3 casas decimais pra centavo', () => {
    expect(parseMoeda('1,234')).toBe(123);
    expect(parseMoeda('1,236')).toBe(124);
  });

  it('retorna 0 pra string inválida', () => {
    expect(parseMoeda('abc')).toBe(0);
    expect(parseMoeda('')).toBe(0);
  });
});
