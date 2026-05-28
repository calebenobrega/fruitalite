import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@config/storage-keys';
import type { Usuario } from '@t/index';

type UsuarioState = {
  usuario: Usuario | null;
  isOnboarded: boolean;
  salvar: (dados: Pick<Usuario, 'nome' | 'tagLoja'>) => void;
  resetar: () => void;
};

export const useUsuarioStore = create<UsuarioState>()(
  persist(
    (set) => ({
      usuario: null,
      isOnboarded: false,
      salvar(dados) {
        const usuario: Usuario = { ...dados, criadoEm: new Date().toISOString() };
        set({ usuario, isOnboarded: true });
      },
      resetar() {
        set({ usuario: null, isOnboarded: false });
      },
    }),
    {
      name: STORAGE_KEYS.usuario,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
