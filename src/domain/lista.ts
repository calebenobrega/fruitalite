import type { ItemLista, Lista } from '@t/index';

/** Total da lista em centavos. Itens sem valor unitário não somam. */
export function totalLista(lista: Lista): number {
  return lista.itens.reduce((acc, i) => {
    if (!i.valorUnitarioCentavos) return acc;
    return acc + i.valorUnitarioCentavos * i.quantidade;
  }, 0);
}

/** Quantidade de itens com valor unitário preenchido. */
export function itensComValor(lista: Lista): number {
  return lista.itens.filter(itemTemValor).length;
}

/** Quantidade de itens ainda sem valor unitário. */
export function itensPendentesValor(lista: Lista): number {
  return lista.itens.length - itensComValor(lista);
}

/** Percentual (0-100) de itens já precificados. */
export function progressoLista(lista: Lista): number {
  if (lista.itens.length === 0) return 0;
  return Math.round((itensComValor(lista) / lista.itens.length) * 100);
}

/** Predicate: item tem valor unitário positivo. */
export function itemTemValor(item: ItemLista): boolean {
  return item.valorUnitarioCentavos !== null && item.valorUnitarioCentavos > 0;
}

/**
 * RN2 (CLAUDE.md): só pode finalizar `comprando → concluida` se todos os itens
 * tiverem valor unitário definido.
 */
export function podeFinalizar(lista: Lista): boolean {
  if (lista.fase !== 'comprando') return false;
  if (lista.itens.length === 0) return false;
  return lista.itens.every(itemTemValor);
}

/** Lista que ainda não foi finalizada (status ativo na UI). */
export function isAtiva(lista: Lista): boolean {
  return lista.fase !== 'concluida';
}
