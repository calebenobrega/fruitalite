import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react';
import { useListasStore } from '@stores/listasStore';
import { useToastStore } from '@stores/toastStore';
import type { Lista } from '@t/index';
import styles from './RenomearListaSheet.module.css';

type Props = {
  lista: Lista;
  onFechar: () => void;
};

export function RenomearListaSheet({ lista, onFechar }: Props) {
  const renomear = useListasStore((s) => s.renomear);
  const show = useToastStore((s) => s.show);
  const [nome, setNome] = useState(lista.nome);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onFechar();
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setNome(e.target.value);
  }

  function handleSalvar() {
    const ok = renomear(lista.id, nome);
    if (ok) {
      show('Lista renomeada', 'success');
      onFechar();
    } else {
      show('Nome inválido', 'warning');
    }
  }

  const podeSalvar = nome.trim() !== '' && nome.trim() !== lista.nome;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Renomear lista"
      onClick={handleOverlayClick}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        <h2 className={styles.titulo}>Renomear lista</h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="renomear-input">
            Nome da lista
          </label>
          <input
            id="renomear-input"
            type="text"
            value={nome}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            className={styles.input}
            autoFocus
            maxLength={60}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelarBtn} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.salvarBtn}
            onClick={handleSalvar}
            disabled={!podeSalvar}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
