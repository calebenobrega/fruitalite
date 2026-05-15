import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useCatalogoStore } from '@stores/catalogoStore';
import { useListasStore } from '@stores/listasStore';
import { useToastStore } from '@stores/toastStore';
import { Button } from '@components/Button';
import { BadgeFase } from '@components/BadgeFase';
import type { Lista, ItemLista, Unidade } from '@t/index';
import styles from './ListaPlanejamento.module.css';

const UNIDADES: { label: string; value: Unidade }[] = [
  { label: 'Cx', value: 'caixas' },
  { label: 'Kg', value: 'kg' },
  { label: 'Un', value: 'unidades' },
];

function ItemRow({
  item,
  onAtualizarQuantidade,
  onAtualizarUnidade,
  onRemover,
}: {
  item: ItemLista;
  onAtualizarQuantidade: (produtoId: string, quantidade: number) => void;
  onAtualizarUnidade: (produtoId: string, unidade: Unidade) => void;
  onRemover: (produtoId: string) => void;
}) {
  const catalogo = useCatalogoStore((s) => s.produtos);
  const produto = catalogo.find((p) => p.id === item.produtoId);
  const [qtdStr, setQtdStr] = useState(String(item.quantidade));

  function increment() {
    const next = item.quantidade + 1;
    setQtdStr(String(next));
    onAtualizarQuantidade(item.produtoId, next);
  }

  function decrement() {
    const next = Math.max(1, item.quantidade - 1);
    setQtdStr(String(next));
    onAtualizarQuantidade(item.produtoId, next);
  }

  function handleQtdChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    setQtdStr(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 1) {
      onAtualizarQuantidade(item.produtoId, num);
    }
  }

  function handleQtdBlur() {
    const num = parseInt(qtdStr, 10);
    const valid = !isNaN(num) && num >= 1 ? num : 1;
    setQtdStr(String(valid));
    onAtualizarQuantidade(item.produtoId, valid);
  }

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <span className={styles.itemEmoji} aria-hidden="true">
          {produto?.emoji ?? '📦'}
        </span>
        <span className={styles.itemNome}>{produto?.nome ?? item.produtoId}</span>
        <button
          type="button"
          className={styles.removerBtn}
          onClick={() => onRemover(item.produtoId)}
          aria-label={`Remover ${produto?.nome ?? 'item'} da lista`}
        >
          <Trash2 size={18} strokeWidth={2} />
        </button>
      </div>
      <div className={styles.itemControls}>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={decrement}
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={qtdStr}
            onChange={handleQtdChange}
            onBlur={handleQtdBlur}
            className={styles.stepInput}
            aria-label="Quantidade"
          />
          <button
            type="button"
            className={styles.stepBtn}
            onClick={increment}
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
        <div className={styles.unidadeGroup} role="group" aria-label="Unidade de medida">
          {UNIDADES.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              className={`${styles.unidadeBtn} ${item.unidade === value ? styles.unidadeActive : ''}`}
              onClick={() => onAtualizarUnidade(item.produtoId, value)}
              aria-pressed={item.unidade === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListaPlanejamento({ lista }: { lista: Lista }) {
  const navigate = useNavigate();
  const iniciarCompra = useListasStore((s) => s.iniciarCompra);
  const excluirLista = useListasStore((s) => s.excluirLista);
  const atualizarQuantidade = useListasStore((s) => s.atualizarQuantidade);
  const atualizarUnidade = useListasStore((s) => s.atualizarUnidade);
  const removerItem = useListasStore((s) => s.removerItem);
  const catalogo = useCatalogoStore((s) => s.produtos);
  const show = useToastStore((s) => s.show);
  const [confirmando, setConfirmando] = useState(false);

  function handleIniciar() {
    const ok = iniciarCompra(lista.id);
    if (!ok) show('Não foi possível iniciar a compra', 'error');
  }

  function handleRemover(produtoId: string) {
    const produto = catalogo.find((p) => p.id === produtoId);
    const nome = produto?.nome ?? 'Item';
    if (lista.itens.length <= 1) {
      show('A lista precisa ter pelo menos 1 item', 'warning');
      return;
    }
    const ok = removerItem(lista.id, produtoId);
    if (ok) show(`${nome} removido`, 'success');
  }

  function handleAdicionar() {
    navigate('/listas/nova', {
      state: {
        adicionandoEmId: lista.id,
        idsExcluidos: lista.itens.map((i) => i.produtoId),
      },
    });
  }

  function handleExcluir() {
    excluirLista(lista.id);
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

      <div className={styles.itemList} aria-label="Itens da lista">
        {lista.itens.map((item) => (
          <ItemRow
            key={item.produtoId}
            item={item}
            onAtualizarQuantidade={(produtoId, quantidade) =>
              atualizarQuantidade(lista.id, produtoId, quantidade)
            }
            onAtualizarUnidade={(produtoId, unidade) =>
              atualizarUnidade(lista.id, produtoId, unidade)
            }
            onRemover={handleRemover}
          />
        ))}
        <button
          type="button"
          className={styles.adicionarCard}
          onClick={handleAdicionar}
          aria-label="Adicionar produto à lista"
        >
          <Plus size={20} strokeWidth={2} />
          <span>Adicionar produto</span>
        </button>
      </div>

      <div className={styles.acoes}>
        {confirmando ? (
          <div className={styles.confirmacao}>
            <p className={styles.confirmacaoTexto}>Excluir esta lista permanentemente?</p>
            <div className={styles.confirmacaoBtns}>
              <Button variant="destructive" size="sm" onClick={handleExcluir}>
                Excluir
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmando(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.excluirBtn}
            onClick={() => setConfirmando(true)}
          >
            <Trash2 size={16} strokeWidth={2} />
            Excluir lista
          </button>
        )}
      </div>

      <div className={styles.stickyFooter}>
        <Button variant="primary" size="lg" fullWidth onClick={handleIniciar}>
          Iniciar compra
        </Button>
      </div>
    </div>
  );
}
