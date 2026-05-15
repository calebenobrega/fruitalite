import { useState } from 'react';
import { Bell, ClipboardList, Plus, X } from 'lucide-react';
import { useAnotacoesStore } from '@stores/anotacoesStore';
import { useToastStore } from '@stores/toastStore';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { tempoRelativo } from '@utils/data';
import type { Anotacao, Lembrete } from '@t/index';
import styles from './AnotacoesPage.module.css';

type SheetMode = 'criar' | 'editar';

function minDatetimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

export function AnotacoesPage() {
  const anotacoes = useAnotacoesStore((s) => s.anotacoes);
  const criar = useAnotacoesStore((s) => s.criar);
  const editar = useAnotacoesStore((s) => s.editar);
  const excluir = useAnotacoesStore((s) => s.excluir);
  const definirLembrete = useAnotacoesStore((s) => s.definirLembrete);
  const removerLembrete = useAnotacoesStore((s) => s.removerLembrete);
  const show = useToastStore((s) => s.show);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [sheetModo, setSheetModo] = useState<SheetMode>('criar');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [temLembrete, setTemLembrete] = useState(false);
  const [dataHoraStr, setDataHoraStr] = useState('');
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);

  function abrirCriar() {
    setSheetModo('criar');
    setEditandoId(null);
    setTitulo('');
    setConteudo('');
    setTemLembrete(false);
    setDataHoraStr('');
    setConfirmandoExcluir(false);
    setSheetAberto(true);
  }

  function abrirEditar(a: Anotacao) {
    setSheetModo('editar');
    setEditandoId(a.id);
    setTitulo(a.titulo);
    setConteudo(a.conteudo);
    setTemLembrete(a.lembrete !== null);
    setDataHoraStr(a.lembrete ? a.lembrete.dataHora.slice(0, 16) : '');
    setConfirmandoExcluir(false);
    setSheetAberto(true);
  }

  function fecharSheet() {
    setSheetAberto(false);
    setConfirmandoExcluir(false);
  }

  function handleSalvar() {
    if (!titulo.trim()) {
      show('O título é obrigatório', 'warning');
      return;
    }

    const lembreteNovo: Lembrete | null =
      temLembrete && dataHoraStr
        ? { dataHora: new Date(dataHoraStr).toISOString(), disparado: false, visto: false }
        : null;

    if (sheetModo === 'criar') {
      criar({ titulo: titulo.trim(), conteudo: conteudo.trim(), lembrete: lembreteNovo });
      show('Anotação criada', 'success');
    } else if (editandoId) {
      editar(editandoId, { titulo: titulo.trim(), conteudo: conteudo.trim() });
      if (temLembrete && dataHoraStr) {
        definirLembrete(editandoId, new Date(dataHoraStr).toISOString());
      } else {
        removerLembrete(editandoId);
      }
      show('Anotação salva', 'success');
    }
    fecharSheet();
  }

  function handleExcluir() {
    if (!editandoId) return;
    excluir(editandoId);
    show('Anotação excluída', 'info');
    fecharSheet();
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Anotações</h1>
      </header>

      {anotacoes.length === 0 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="Nenhuma anotação"
            description="Toque em + para criar sua primeira anotação."
          />
        </div>
      ) : (
        <ul className={styles.cardList}>
          {anotacoes.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={styles.card}
                onClick={() => abrirEditar(a)}
                aria-label={`Editar anotação: ${a.titulo}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardTitulo}>{a.titulo}</span>
                  {a.lembrete && !a.lembrete.visto && (
                    <Bell size={14} className={styles.cardBell} aria-label="Lembrete ativo" />
                  )}
                </div>
                {a.conteudo ? <p className={styles.cardPreview}>{a.conteudo}</p> : null}
                <span className={styles.cardData}>{tempoRelativo(a.atualizadaEm)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={abrirCriar}
        aria-label="Nova anotação"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {sheetAberto && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={sheetModo === 'criar' ? 'Nova anotação' : 'Editar anotação'}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharSheet();
          }}
        >
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>
                {sheetModo === 'criar' ? 'Nova anotação' : 'Editar anotação'}
              </span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={fecharSheet}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="anotacao-titulo">
                Título
              </label>
              <input
                id="anotacao-titulo"
                type="text"
                className={styles.fieldInput}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Conferir preços de banana"
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="anotacao-conteudo">
                Conteúdo <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="anotacao-conteudo"
                className={styles.fieldTextarea}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Detalhes..."
                rows={3}
              />
            </div>

            <div className={styles.toggleRow}>
              <span className={styles.fieldLabel}>Lembrete</span>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={temLembrete}
                  onChange={(e) => setTemLembrete(e.target.checked)}
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </label>
            </div>

            {temLembrete && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="anotacao-lembrete">
                  Data e hora
                </label>
                <input
                  id="anotacao-lembrete"
                  type="datetime-local"
                  className={styles.fieldInput}
                  value={dataHoraStr}
                  min={minDatetimeLocal()}
                  onChange={(e) => setDataHoraStr(e.target.value)}
                />
              </div>
            )}

            <div className={styles.sheetFooter}>
              <Button variant="primary" size="lg" fullWidth onClick={handleSalvar}>
                Salvar
              </Button>

              {sheetModo === 'editar' && !confirmandoExcluir && (
                <button
                  type="button"
                  className={styles.excluirBtn}
                  onClick={() => setConfirmandoExcluir(true)}
                >
                  Excluir anotação
                </button>
              )}

              {confirmandoExcluir && (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Tem certeza?</span>
                  <div className={styles.confirmBtns}>
                    <Button variant="destructive" size="sm" onClick={handleExcluir}>
                      Excluir
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfirmandoExcluir(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
