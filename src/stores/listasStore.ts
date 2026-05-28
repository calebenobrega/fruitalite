import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@config/storage-keys';
import type { Lista, ItemLista, Unidade } from '@t/index';
import { nomeLista } from '@utils/data';

type ListasState = {
  listas: Lista[];
  criarLista: (itens: ItemLista[], nome?: string) => Lista;
  excluirLista: (id: string) => void;
  definirValor: (listaId: string, produtoId: string, centavos: number) => void;
  atualizarQuantidade: (listaId: string, produtoId: string, quantidade: number) => void;
  atualizarUnidade: (listaId: string, produtoId: string, unidade: Unidade) => void;
  atualizarPesoPorCaixa: (listaId: string, produtoId: string, gramas: number | null) => void;
  removerItem: (listaId: string, produtoId: string) => boolean;
  adicionarItens: (listaId: string, novosItens: ItemLista[]) => number;
  finalizar: (id: string) => boolean;
  reabrir: (id: string) => boolean;
  renomear: (id: string, nome: string) => boolean;
};

export const useListasStore = create<ListasState>()(
  persist(
    (set, get) => ({
      listas: [],

      criarLista(itens, nome) {
        // RN1: precisa ter ≥1 item com quantidade > 0
        const itensValidos = itens.filter((i) => i.quantidade > 0);
        if (itensValidos.length === 0) {
          throw new Error('RN1: lista precisa ter pelo menos um item com quantidade');
        }
        const lista: Lista = {
          id: crypto.randomUUID(),
          nome: nome ?? nomeLista(),
          fase: 'comprando',
          itens: itensValidos,
          criadaEm: new Date().toISOString(),
          finalizadaEm: null,
        };
        set((s) => ({ listas: [lista, ...s.listas] }));
        return lista;
      },

      excluirLista(id) {
        set((s) => ({ listas: s.listas.filter((l) => l.id !== id) }));
      },

      definirValor(listaId, produtoId, centavos) {
        set((s) => ({
          listas: s.listas.map((l) => {
            if (l.id !== listaId) return l;
            return {
              ...l,
              itens: l.itens.map((i) =>
                i.produtoId === produtoId ? { ...i, valorUnitarioCentavos: centavos } : i,
              ),
            };
          }),
        }));
      },

      atualizarQuantidade(listaId, produtoId, quantidade) {
        const validQty = Math.max(1, quantidade);
        set((s) => ({
          listas: s.listas.map((l) => {
            if (l.id !== listaId) return l;
            if (l.fase === 'concluida') return l;
            return {
              ...l,
              itens: l.itens.map((i) =>
                i.produtoId === produtoId ? { ...i, quantidade: validQty } : i,
              ),
            };
          }),
        }));
      },

      atualizarUnidade(listaId, produtoId, unidade) {
        set((s) => ({
          listas: s.listas.map((l) => {
            if (l.id !== listaId) return l;
            if (l.fase === 'concluida') return l;
            return {
              ...l,
              itens: l.itens.map((i) => (i.produtoId === produtoId ? { ...i, unidade } : i)),
            };
          }),
        }));
      },

      atualizarPesoPorCaixa(listaId, produtoId, gramas) {
        set((s) => ({
          listas: s.listas.map((l) => {
            if (l.id !== listaId) return l;
            if (l.fase === 'concluida') return l;
            return {
              ...l,
              itens: l.itens.map((i) => {
                if (i.produtoId !== produtoId) return i;
                if (gramas === null || gramas <= 0) {
                  const { pesoPorCaixaGramas: _omit, ...rest } = i;
                  void _omit;
                  return rest;
                }
                return { ...i, pesoPorCaixaGramas: gramas };
              }),
            };
          }),
        }));
      },

      removerItem(listaId, produtoId) {
        const lista = get().listas.find((l) => l.id === listaId);
        if (!lista) return false;
        if (lista.fase === 'concluida') return false;
        // RN1: lista precisa ter ≥1 item — não permitir remover o último
        if (lista.itens.length <= 1) return false;
        if (!lista.itens.some((i) => i.produtoId === produtoId)) return false;
        set((s) => ({
          listas: s.listas.map((l) =>
            l.id === listaId
              ? { ...l, itens: l.itens.filter((i) => i.produtoId !== produtoId) }
              : l,
          ),
        }));
        return true;
      },

      adicionarItens(listaId, novosItens) {
        const lista = get().listas.find((l) => l.id === listaId);
        if (!lista) return 0;
        if (lista.fase === 'concluida') return 0;
        const idsExistentes = new Set(lista.itens.map((i) => i.produtoId));
        const novosValidos = novosItens.filter(
          (i) => i.quantidade > 0 && !idsExistentes.has(i.produtoId),
        );
        if (novosValidos.length === 0) return 0;
        set((s) => ({
          listas: s.listas.map((l) =>
            l.id === listaId ? { ...l, itens: [...l.itens, ...novosValidos] } : l,
          ),
        }));
        return novosValidos.length;
      },

      finalizar(id) {
        const lista = get().listas.find((l) => l.id === id);
        // RN3: todos os itens precisam ter valor unitário
        if (!lista) return false;
        if (lista.fase !== 'comprando') return false;
        const todosComValor = lista.itens.every(
          (i) => i.valorUnitarioCentavos !== null && i.valorUnitarioCentavos > 0,
        );
        if (!todosComValor) return false;
        set((s) => ({
          listas: s.listas.map((l) =>
            l.id === id ? { ...l, fase: 'concluida', finalizadaEm: new Date().toISOString() } : l,
          ),
        }));
        return true;
      },

      reabrir(id) {
        const lista = get().listas.find((l) => l.id === id);
        if (!lista) return false;
        if (lista.fase !== 'concluida') return false;
        set((s) => ({
          listas: s.listas.map((l) =>
            l.id === id ? { ...l, fase: 'comprando', finalizadaEm: null } : l,
          ),
        }));
        return true;
      },

      renomear(id, nome) {
        const limpo = nome.trim();
        if (limpo === '') return false;
        const lista = get().listas.find((l) => l.id === id);
        if (!lista) return false;
        set((s) => ({
          listas: s.listas.map((l) => (l.id === id ? { ...l, nome: limpo } : l)),
        }));
        return true;
      },
    }),
    {
      name: STORAGE_KEYS.listas,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // v1 → v2: fase 'planejamento' deixou de existir; toda lista antiga vai pra 'comprando'.
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== 'object') {
          return { listas: [] };
        }
        const state = persisted as { listas?: Lista[] };
        if (version < 2) {
          return {
            ...state,
            listas: (state.listas ?? []).map((l) =>
              (l.fase as string) === 'planejamento' ? { ...l, fase: 'comprando' } : l,
            ),
          };
        }
        return state;
      },
    },
  ),
);
