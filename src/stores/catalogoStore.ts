import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@config/storage-keys';
import type { Produto } from '@t/index';
import { catalogoPadrao } from '@data/catalogo';

type CatalogoState = {
  produtos: Produto[];
  adicionar: (produto: Omit<Produto, 'id'>) => Produto;
  editar: (id: string, partial: Partial<Omit<Produto, 'id'>>) => void;
  remover: (id: string) => void;
  restaurarPadrao: () => void;
  toggleAtivo: (id: string) => void;
};

function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function idUnico(nomeBase: string, existentes: Produto[]): string {
  const base = slugify(nomeBase) || 'produto';
  if (!existentes.some((p) => p.id === base)) return base;
  let n = 2;
  while (existentes.some((p) => p.id === `${base}_${n}`)) n++;
  return `${base}_${n}`;
}

export const useCatalogoStore = create<CatalogoState>()(
  persist(
    (set, get) => ({
      produtos: catalogoPadrao,

      adicionar(produto) {
        const existentes = get().produtos;
        const id = idUnico(produto.nome, existentes);
        const novo: Produto = { id, ...produto };
        set((s) => ({ produtos: [...s.produtos, novo] }));
        return novo;
      },

      editar(id, partial) {
        set((s) => ({
          produtos: s.produtos.map((p) => (p.id === id ? { ...p, ...partial, id: p.id } : p)),
        }));
      },

      remover(id) {
        set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) }));
      },

      restaurarPadrao() {
        set({ produtos: catalogoPadrao });
      },

      toggleAtivo(id) {
        set((s) => ({
          produtos: s.produtos.map((p) =>
            p.id === id ? { ...p, ativo: !p.ativo } : p,
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.catalogo,
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
);
