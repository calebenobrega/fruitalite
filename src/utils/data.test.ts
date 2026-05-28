import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatarData, nomeLista, saudacao, tempoRelativo } from './data';

describe('saudacao', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function fixar(hora: number) {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, hora, 0, 0));
  }

  it('retorna "Bom dia" entre 5h e 11h59', () => {
    fixar(5);
    expect(saudacao()).toBe('Bom dia');
    fixar(11);
    expect(saudacao()).toBe('Bom dia');
  });

  it('retorna "Boa tarde" entre 12h e 17h59', () => {
    fixar(12);
    expect(saudacao()).toBe('Boa tarde');
    fixar(17);
    expect(saudacao()).toBe('Boa tarde');
  });

  it('retorna "Boa noite" antes das 5h e depois das 18h', () => {
    fixar(0);
    expect(saudacao()).toBe('Boa noite');
    fixar(4);
    expect(saudacao()).toBe('Boa noite');
    fixar(18);
    expect(saudacao()).toBe('Boa noite');
    fixar(23);
    expect(saudacao()).toBe('Boa noite');
  });
});

describe('formatarData', () => {
  it('formata ISO como dd/MM/yyyy', () => {
    expect(formatarData('2026-05-13T10:00:00.000Z')).toBe('13/05/2026');
  });
});

describe('tempoRelativo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna texto em português com sufixo', () => {
    const ontem = new Date('2026-05-14T12:00:00.000Z').toISOString();
    expect(tempoRelativo(ontem)).toMatch(/há.*dia/);
  });
});

describe('nomeLista', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('gera "Lista dd/MM" com a data atual', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 13, 14, 0, 0));
    expect(nomeLista()).toBe('Lista 13/05');
  });
});
