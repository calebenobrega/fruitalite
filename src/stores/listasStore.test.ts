import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Stub mínimo de localStorage pra Zustand persist não estourar em ambiente Node.
const memoryStore = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStore.set(k, v),
  removeItem: (k: string) => void memoryStore.delete(k),
  clear: () => memoryStore.clear(),
  key: () => null,
  length: 0,
});

import { useListasStore } from './listasStore';

function resetStore() {
  memoryStore.clear();
  useListasStore.setState({ listas: [] });
}

describe('listasStore.reabrir', () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  it('reabre lista concluida → comprando e limpa finalizadaEm', () => {
    const lista = useListasStore
      .getState()
      .criarLista([
        { produtoId: 'p1', quantidade: 1, unidade: 'caixas', valorUnitarioCentavos: 100 },
      ]);
    useListasStore.getState().finalizar(lista.id);
    const finalizada = useListasStore.getState().listas.find((l) => l.id === lista.id)!;
    expect(finalizada.fase).toBe('concluida');
    expect(finalizada.finalizadaEm).not.toBeNull();

    const ok = useListasStore.getState().reabrir(lista.id);

    expect(ok).toBe(true);
    const reaberta = useListasStore.getState().listas.find((l) => l.id === lista.id)!;
    expect(reaberta.fase).toBe('comprando');
    expect(reaberta.finalizadaEm).toBeNull();
  });

  it('retorna false quando lista já está em comprando', () => {
    const lista = useListasStore
      .getState()
      .criarLista([
        { produtoId: 'p1', quantidade: 1, unidade: 'caixas', valorUnitarioCentavos: 100 },
      ]);
    const ok = useListasStore.getState().reabrir(lista.id);
    expect(ok).toBe(false);
    const inalterada = useListasStore.getState().listas.find((l) => l.id === lista.id)!;
    expect(inalterada.fase).toBe('comprando');
  });

  it('retorna false para id inexistente', () => {
    expect(useListasStore.getState().reabrir('id-fantasma')).toBe(false);
  });
});

describe('listasStore.renomear', () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  it('renomeia lista em fase comprando', () => {
    const lista = useListasStore
      .getState()
      .criarLista(
        [{ produtoId: 'p1', quantidade: 1, unidade: 'caixas', valorUnitarioCentavos: null }],
        'Nome antigo',
      );
    const ok = useListasStore.getState().renomear(lista.id, 'Nome novo');
    expect(ok).toBe(true);
    expect(useListasStore.getState().listas.find((l) => l.id === lista.id)!.nome).toBe('Nome novo');
  });

  it('renomeia lista mesmo em fase concluida', () => {
    const lista = useListasStore
      .getState()
      .criarLista([
        { produtoId: 'p1', quantidade: 1, unidade: 'caixas', valorUnitarioCentavos: 100 },
      ]);
    useListasStore.getState().finalizar(lista.id);
    const ok = useListasStore.getState().renomear(lista.id, 'Renomeada concluída');
    expect(ok).toBe(true);
    expect(useListasStore.getState().listas.find((l) => l.id === lista.id)!.nome).toBe(
      'Renomeada concluída',
    );
  });

  it('faz trim no nome', () => {
    const lista = useListasStore
      .getState()
      .criarLista(
        [{ produtoId: 'p1', quantidade: 1, unidade: 'caixas', valorUnitarioCentavos: null }],
        'X',
      );
    useListasStore.getState().renomear(lista.id, '   Espaços   ');
    expect(useListasStore.getState().listas.find((l) => l.id === lista.id)!.nome).toBe('Espaços');
  });

  it('rejeita nome vazio após trim', () => {
    const lista = useListasStore
      .getState()
      .criarLista(
        [{ produtoId: 'p1', quantidade: 1, unidade: 'caixas', valorUnitarioCentavos: null }],
        'Original',
      );
    const ok = useListasStore.getState().renomear(lista.id, '    ');
    expect(ok).toBe(false);
    expect(useListasStore.getState().listas.find((l) => l.id === lista.id)!.nome).toBe('Original');
  });

  it('retorna false para id inexistente', () => {
    expect(useListasStore.getState().renomear('id-fantasma', 'X')).toBe(false);
  });
});
