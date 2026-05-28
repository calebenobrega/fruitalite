import { describe, expect, it } from 'vitest';
import type { ItemLista, Lista } from '@t/index';
import {
  isAtiva,
  itemTemValor,
  itensComValor,
  itensPendentesValor,
  podeFinalizar,
  progressoLista,
  totalLista,
} from './lista';

function item(over: Partial<ItemLista> = {}): ItemLista {
  return {
    produtoId: 'p1',
    quantidade: 1,
    unidade: 'caixas',
    valorUnitarioCentavos: null,
    ...over,
  };
}

function lista(over: Partial<Lista> = {}): Lista {
  return {
    id: 'l1',
    nome: 'Teste',
    fase: 'comprando',
    itens: [],
    criadaEm: new Date().toISOString(),
    finalizadaEm: null,
    ...over,
  };
}

describe('itemTemValor', () => {
  it('false para valor null', () => {
    expect(itemTemValor(item({ valorUnitarioCentavos: null }))).toBe(false);
  });

  it('false para valor 0', () => {
    expect(itemTemValor(item({ valorUnitarioCentavos: 0 }))).toBe(false);
  });

  it('true para valor positivo', () => {
    expect(itemTemValor(item({ valorUnitarioCentavos: 100 }))).toBe(true);
  });
});

describe('totalLista', () => {
  it('zero quando lista vazia', () => {
    expect(totalLista(lista({ itens: [] }))).toBe(0);
  });

  it('soma quantidade * valorUnitario', () => {
    const l = lista({
      itens: [
        item({ quantidade: 2, valorUnitarioCentavos: 500 }),
        item({ produtoId: 'p2', quantidade: 3, valorUnitarioCentavos: 200 }),
      ],
    });
    expect(totalLista(l)).toBe(2 * 500 + 3 * 200);
  });

  it('ignora itens sem valor', () => {
    const l = lista({
      itens: [
        item({ quantidade: 2, valorUnitarioCentavos: 500 }),
        item({ produtoId: 'p2', quantidade: 3, valorUnitarioCentavos: null }),
      ],
    });
    expect(totalLista(l)).toBe(1000);
  });
});

describe('itensComValor / itensPendentesValor', () => {
  it('conta corretamente itens precificados e pendentes', () => {
    const l = lista({
      itens: [
        item({ valorUnitarioCentavos: 100 }),
        item({ produtoId: 'p2', valorUnitarioCentavos: 200 }),
        item({ produtoId: 'p3', valorUnitarioCentavos: null }),
        item({ produtoId: 'p4', valorUnitarioCentavos: 0 }),
      ],
    });
    expect(itensComValor(l)).toBe(2);
    expect(itensPendentesValor(l)).toBe(2);
  });
});

describe('progressoLista', () => {
  it('0 para lista vazia', () => {
    expect(progressoLista(lista({ itens: [] }))).toBe(0);
  });

  it('100 quando todos os itens têm valor', () => {
    const l = lista({
      itens: [
        item({ valorUnitarioCentavos: 100 }),
        item({ produtoId: 'p2', valorUnitarioCentavos: 200 }),
      ],
    });
    expect(progressoLista(l)).toBe(100);
  });

  it('50 quando metade tem valor', () => {
    const l = lista({
      itens: [
        item({ valorUnitarioCentavos: 100 }),
        item({ produtoId: 'p2', valorUnitarioCentavos: null }),
      ],
    });
    expect(progressoLista(l)).toBe(50);
  });

  it('arredonda corretamente', () => {
    const l = lista({
      itens: [
        item({ valorUnitarioCentavos: 100 }),
        item({ produtoId: 'p2', valorUnitarioCentavos: null }),
        item({ produtoId: 'p3', valorUnitarioCentavos: null }),
      ],
    });
    expect(progressoLista(l)).toBe(33);
  });
});

describe('podeFinalizar (RN2)', () => {
  it('false se já está concluída', () => {
    const l = lista({
      fase: 'concluida',
      itens: [item({ valorUnitarioCentavos: 100 })],
    });
    expect(podeFinalizar(l)).toBe(false);
  });

  it('false se lista vazia', () => {
    expect(podeFinalizar(lista({ itens: [] }))).toBe(false);
  });

  it('false se algum item está sem valor', () => {
    const l = lista({
      itens: [
        item({ valorUnitarioCentavos: 100 }),
        item({ produtoId: 'p2', valorUnitarioCentavos: null }),
      ],
    });
    expect(podeFinalizar(l)).toBe(false);
  });

  it('true se todos os itens têm valor e fase é comprando', () => {
    const l = lista({
      itens: [
        item({ valorUnitarioCentavos: 100 }),
        item({ produtoId: 'p2', valorUnitarioCentavos: 200 }),
      ],
    });
    expect(podeFinalizar(l)).toBe(true);
  });
});

describe('isAtiva', () => {
  it('true para fase comprando', () => {
    expect(isAtiva(lista({ fase: 'comprando' }))).toBe(true);
  });

  it('false para fase concluida', () => {
    expect(isAtiva(lista({ fase: 'concluida' }))).toBe(false);
  });
});
