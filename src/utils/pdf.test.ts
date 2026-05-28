import { describe, expect, it } from 'vitest';
import { buildKgAnnotation } from './pdf';

describe('buildKgAnnotation', () => {
  it('retorna string vazia quando unitCentavos é 0', () => {
    expect(buildKgAnnotation(0, 15000, 3)).toBe('');
  });

  it('retorna string vazia quando pesoCxGramas é 0', () => {
    expect(buildKgAnnotation(2000, 0, 3)).toBe('');
  });

  it('retorna string vazia quando unitCentavos é negativo', () => {
    expect(buildKgAnnotation(-100, 10000, 2)).toBe('');
  });

  it('inclui marcador de R$/kg e peso total quando dados válidos', () => {
    const result = buildKgAnnotation(2000, 10000, 2);
    expect(result).toMatch(/~.*\/kg/);
    expect(result).toContain('20 kg');
    expect(result).toContain('total');
  });

  it('calcula arredondamento correto de R$/kg', () => {
    const result = buildKgAnnotation(3000, 15000, 1);
    expect(result).toMatch(/~.*\/kg/);
  });
});
