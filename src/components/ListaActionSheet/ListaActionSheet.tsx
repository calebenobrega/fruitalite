import { useEffect, type MouseEvent } from 'react';
import type { Lista } from '@t/index';
import styles from './ListaActionSheet.module.css';

type Props = {
  lista: Lista;
  onCancelar: () => void;
  onExcluir: () => void;
};

export function ListaActionSheet({ lista, onCancelar, onExcluir }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancelar();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancelar]);

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onCancelar();
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Ações da lista"
      onClick={handleOverlayClick}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <p className={styles.titulo}>Excluir &ldquo;{lista.nome}&rdquo;?</p>
          <p className={styles.descricao}>
            Essa ação não pode ser desfeita. A lista e todos os itens serão removidos.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelarBtn} onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className={styles.excluirBtn} onClick={onExcluir}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
