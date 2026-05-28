import { useUsuarioStore } from '@stores/usuarioStore';
import { useListasStore } from '@stores/listasStore';
import { useAnotacoesStore } from '@stores/anotacoesStore';
import { useCatalogoStore } from '@stores/catalogoStore';
import { BACKUP_TIPO, BACKUP_VERSAO } from '@config/storage-keys';
import type { Anotacao, Lista, Produto, Usuario } from '@t/index';

type BackupV1 = {
  tipo: typeof BACKUP_TIPO;
  versao: number;
  exportadoEm: string;
  dados: {
    usuario: Usuario | null;
    isOnboarded: boolean;
    listas: Lista[];
    anotacoes: Anotacao[];
    catalogo: Produto[];
  };
};

export function exportarBackup(): void {
  const usuarioState = useUsuarioStore.getState();
  const listasState = useListasStore.getState();
  const anotacoesState = useAnotacoesStore.getState();
  const catalogoState = useCatalogoStore.getState();

  const backup: BackupV1 = {
    tipo: BACKUP_TIPO,
    versao: BACKUP_VERSAO,
    exportadoEm: new Date().toISOString(),
    dados: {
      usuario: usuarioState.usuario,
      isOnboarded: usuarioState.isOnboarded,
      listas: listasState.listas,
      anotacoes: anotacoesState.anotacoes,
      catalogo: catalogoState.produtos,
    },
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dataStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fruitalite_backup_${dataStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ResultadoImport = {
  listas: number;
  anotacoes: number;
  catalogo: number;
  usuario: boolean;
};

export async function importarBackup(file: File): Promise<ResultadoImport> {
  const texto = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(texto);
  } catch {
    throw new Error('Arquivo inválido — não é JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Arquivo inválido');
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.tipo !== BACKUP_TIPO) {
    throw new Error('Arquivo não é um backup do FruitaLite');
  }
  if (typeof obj.versao !== 'number') {
    throw new Error('Backup sem versão definida');
  }
  if (obj.versao > BACKUP_VERSAO) {
    throw new Error(
      `Backup é de uma versão mais nova (v${obj.versao}). Atualize o app.`,
    );
  }

  const dados = obj.dados as Record<string, unknown> | undefined;
  if (!dados || typeof dados !== 'object') {
    throw new Error('Backup sem dados');
  }

  const listas = Array.isArray(dados.listas) ? (dados.listas as Lista[]) : [];
  const anotacoes = Array.isArray(dados.anotacoes) ? (dados.anotacoes as Anotacao[]) : [];
  const catalogo = Array.isArray(dados.catalogo) ? (dados.catalogo as Produto[]) : [];
  const usuario = (dados.usuario ?? null) as Usuario | null;
  const isOnboarded = typeof dados.isOnboarded === 'boolean' ? dados.isOnboarded : !!usuario;

  // Aplica no zustand — persist middleware grava no localStorage automaticamente
  useListasStore.setState({ listas });
  useAnotacoesStore.setState({ anotacoes });
  if (catalogo.length > 0) {
    useCatalogoStore.setState({ produtos: catalogo });
  }
  useUsuarioStore.setState({ usuario, isOnboarded });

  return {
    listas: listas.length,
    anotacoes: anotacoes.length,
    catalogo: catalogo.length,
    usuario: !!usuario,
  };
}
