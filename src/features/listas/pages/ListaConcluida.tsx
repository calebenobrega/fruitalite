import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useCatalogoStore } from '@stores/catalogoStore';
import { useListasStore } from '@stores/listasStore';
import { useToastStore } from '@stores/toastStore';
import { totalLista } from '@domain/lista';
import { Button } from '@components/Button';
import { BadgeFase } from '@components/BadgeFase';
import { formatarMoeda, formatarMoedaCompact } from '@utils/moeda';
import { formatarData } from '@utils/data';
import { gerarPDFLista } from '@utils/pdf';
import type { Lista, ItemLista, Unidade } from '@t/index';
import styles from './ListaConcluida.module.css';

function labelUnidade(u: Unidade): string {
  return u === 'caixas' ? 'cx.' : u === 'kg' ? 'kg' : 'un.';
}

function ItemRow({ item }: { item: ItemLista }) {
  const catalogo = useCatalogoStore((s) => s.produtos);
  const produto = catalogo.find((p) => p.id === item.produtoId);
  const subtotal = (item.valorUnitarioCentavos ?? 0) * item.quantidade;

  return (
    <li className={styles.itemRow}>
      <div className={styles.itemTop}>
        <span className={styles.itemEmoji} aria-hidden="true">
          {produto?.emoji ?? '📦'}
        </span>
        <span className={styles.itemNome}>{produto?.nome ?? item.produtoId}</span>
        <span className={`${styles.itemSubtotal} tabular`}>{formatarMoeda(subtotal)}</span>
      </div>
      <p className={styles.itemDetalhe}>
        {item.quantidade} {labelUnidade(item.unidade)} ×{' '}
        {formatarMoedaCompact(item.valorUnitarioCentavos ?? 0)}/
        {labelUnidade(item.unidade)}
      </p>
    </li>
  );
}

export function ListaConcluida({ lista }: { lista: Lista }) {
  const navigate = useNavigate();
  const excluirLista = useListasStore((s) => s.excluirLista);
  const show = useToastStore((s) => s.show);
  const [confirmando, setConfirmando] = useState(false);
  const total = totalLista(lista);

  function handleExcluir() {
    excluirLista(lista.id);
    show('Lista excluída', 'info');
    navigate('/', { replace: true });
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className={styles.pageTitle}>{lista.nome}</h1>
        <BadgeFase fase={lista.fase} size="sm" />
      </header>

      <div className={styles.resumoCard}>
        {lista.finalizadaEm && (
          <div className={styles.resumoRow}>
            <span className={styles.resumoLabel}>Concluída em</span>
            <span className={styles.resumoValor}>{formatarData(lista.finalizadaEm)}</span>
          </div>
        )}
        <div className={styles.resumoRow}>
          <span className={styles.resumoLabel}>Total gasto</span>
          <span className={`${styles.resumoTotal} tabular`}>{formatarMoeda(total)}</span>
        </div>
      </div>

      <ul className={styles.itemList} aria-label="Itens comprados">
        {lista.itens.map((item) => (
          <ItemRow key={item.produtoId} item={item} />
        ))}
      </ul>

      <div className={styles.rodape}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          iconLeft={<Share2 size={18} />}
          onClick={() => {
            void gerarPDFLista(lista);
          }}
        >
          Compartilhar PDF
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/', { replace: true })}>
          Voltar para início
        </Button>
        <button type="button" className={styles.excluirBtn} onClick={() => setConfirmando(true)}>
          Excluir lista
        </button>
      </div>

      {confirmando && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirmar exclusão">
          <div className={styles.dialog}>
            <p className={styles.dialogTitle}>Excluir lista?</p>
            <p className={styles.dialogDesc}>Esta ação não pode ser desfeita.</p>
            <Button variant="destructive" size="lg" fullWidth onClick={handleExcluir}>
              Excluir
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
