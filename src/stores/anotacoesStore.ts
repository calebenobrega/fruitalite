import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@config/storage-keys';
import type { Anotacao, Lembrete } from '@t/index';

type CriarDados = { titulo: string; conteudo: string; lembrete?: Lembrete | null };

type AnotacoesState = {
  anotacoes: Anotacao[];
  criar: (dados: CriarDados) => void;
  editar: (id: string, dados: Pick<Anotacao, 'titulo' | 'conteudo'>) => void;
  excluir: (id: string) => void;
  definirLembrete: (id: string, dataHora: string) => void;
  removerLembrete: (id: string) => void;
  marcarDisparado: (id: string) => void;
  marcarVisto: (id: string) => void;
};

export const useAnotacoesStore = create<AnotacoesState>()(
  persist(
    (set) => ({
      anotacoes: [],

      criar(dados) {
        const agora = new Date().toISOString();
        const anotacao: Anotacao = {
          id: crypto.randomUUID(),
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          lembrete: dados.lembrete ?? null,
          criadaEm: agora,
          atualizadaEm: agora,
        };
        set((s) => ({ anotacoes: [anotacao, ...s.anotacoes] }));
      },

      editar(id, dados) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id ? { ...a, ...dados, atualizadaEm: new Date().toISOString() } : a,
          ),
        }));
      },

      excluir(id) {
        set((s) => ({ anotacoes: s.anotacoes.filter((a) => a.id !== id) }));
      },

      definirLembrete(id, dataHora) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id
              ? { ...a, lembrete: { dataHora, disparado: false, visto: false } }
              : a,
          ),
        }));
      },

      removerLembrete(id) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id ? { ...a, lembrete: null } : a,
          ),
        }));
      },

      marcarDisparado(id) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id && a.lembrete
              ? { ...a, lembrete: { ...a.lembrete, disparado: true } }
              : a,
          ),
        }));
      },

      marcarVisto(id) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id && a.lembrete
              ? { ...a, lembrete: { ...a.lembrete, visto: true } }
              : a,
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.anotacoes,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
