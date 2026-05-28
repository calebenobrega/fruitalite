import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useCatalogoStore } from '@stores/catalogoStore';
import { useListasStore } from '@stores/listasStore';
import { useToastStore } from '@stores/toastStore';
import { Button } from '@components/Button';
import { BadgeFase } from '@components/BadgeFase';
import { ProgressBar } from '@components/ProgressBar';
import {
  itensComValor,
  itensPendentesValor,
  progressoLista,
  totalLista,
} from '@domain/lista';
import { formatarMoeda, formatarMoedaCompact, parseMoeda } from '@utils/moeda';
import { formatarPeso } from '@utils/peso';
import type { Lista, ItemLista, Unidade } from '@t/index';
import styles from './ListaComprando.module.css';

const UNIDADES: { label: string; value: Unidade }[] = [
  { label: 'Cx', value: 'caixas' },
  { label: 'Kg', value: 'kg' },
  { label: 'Un', value: 'unidades' },
];

function ItemRow({
  item,
  onDefinirValor,
  onAtualizarQuantidade,
  onAtualizarUnidade,
  onAtualizarPesoPorCaixa,
  onRemover,
}: {
  item: ItemLista;
  onDefinirValor: (produtoId: string, centavos: number) => void;
  onAtualizarQuantidade: (produtoId: string, quantidade: number) => void;
  onAtualizarUnidade: (produtoId: string, unidade: Unidade) => void;
  onAtualizarPesoPorCaixa: (produtoId: string, gramas: number | null) => void;
  onRemover: (produtoId: string) => void;
}) {
  const catalogo = useCatalogoStore((s) => s.produtos);
  const produto = catalogo.find((p) => p.id === item.produtoId);

  // Edição local dos campos de valor: null = sem edição pendente, display derivado do prop.
  // Esse padrão evita setState dentro de useEffect quando quantidade/valor mudam no store.
  const [valorUnitStr, setValorUnitStr] = useState<string | null>(null);
  const [valorTotalStr, setValorTotalStr] = useState<string | null>(null);
  const [qtdStr, setQtdStr] = useState(String(item.quantidade));
  const [pesoStr, setPesoStr] = useState(() =>
    item.pesoPorCaixaGramas && item.pesoPorCaixaGramas > 0
      ? String(item.pesoPorCaixaGramas / 1000).replace('.', ',')
      : '',
  );

  const valorUnitDisplay =
    valorUnitStr ??
    (item.valorUnitarioCentavos && item.valorUnitarioCentavos > 0
      ? formatarMoedaCompact(item.valorUnitarioCentavos)
      : '');
  const valorTotalDisplay =
    valorTotalStr ??
    (item.valorUnitarioCentavos && item.valorUnitarioCentavos > 0
      ? formatarMoedaCompact(item.valorUnitarioCentavos * item.quantidade)
      : '');

  function handlePesoChange(e: ChangeEvent<HTMLInputElement>) {
    setPesoStr(e.target.value);
  }

  function handlePesoBlur() {
    const trimmed = pesoStr.trim().replace(',', '.');
    if (trimmed === '') {
      setPesoStr('');
      onAtualizarPesoPorCaixa(item.produtoId, null);
      return;
    }
    const kg = parseFloat(trimmed);
    if (isNaN(kg) || kg <= 0) {
      setPesoStr('');
      onAtualizarPesoPorCaixa(item.produtoId, null);
      return;
    }
    const gramas = Math.round(kg * 1000);
    setPesoStr(String(gramas / 1000).replace('.', ','));
    onAtualizarPesoPorCaixa(item.produtoId, gramas);
  }

  function handleUnitChange(e: ChangeEvent<HTMLInputElement>) {
    setValorUnitStr(e.target.value);
  }

  function handleUnitBlur() {
    if (valorUnitStr === null) return;
    const trimmed = valorUnitStr.trim();
    onDefinirValor(item.produtoId, trimmed === '' ? 0 : parseMoeda(valorUnitStr));
    setValorUnitStr(null);
  }

  function handleTotalChange(e: ChangeEvent<HTMLInputElement>) {
    setValorTotalStr(e.target.value);
  }

  function handleTotalBlur() {
    if (valorTotalStr === null) return;
    const trimmed = valorTotalStr.trim();
    if (trimmed === '') {
      onDefinirValor(item.produtoId, 0);
    } else if (item.quantidade > 0) {
      const totalCentavos = parseMoeda(valorTotalStr);
      onDefinirValor(item.produtoId, Math.round(totalCentavos / item.quantidade));
    }
    setValorTotalStr(null);
  }

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

  const sufixoUnidade =
    item.unidade === 'caixas' ? 'cx' : item.unidade === 'kg' ? 'kg' : 'un';

  const isCaixas = item.unidade === 'caixas';
  const valorPorKgCentavos =
    isCaixas &&
    item.pesoPorCaixaGramas &&
    item.pesoPorCaixaGramas > 0 &&
    item.valorUnitarioCentavos &&
    item.valorUnitarioCentavos > 0
      ? Math.round((item.valorUnitarioCentavos * 1000) / item.pesoPorCaixaGramas)
      : null;
  const totalGramas =
    isCaixas && item.pesoPorCaixaGramas && item.pesoPorCaixaGramas > 0
      ? item.pesoPorCaixaGramas * item.quantidade
      : null;

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemTop}>
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
      <div className={styles.itemMiddle}>
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
      {isCaixas && (
        <div className={styles.pesoRow}>
          <label className={styles.pesoLabel} htmlFor={`peso-${item.produtoId}`}>
            Peso por caixa
          </label>
          <div className={styles.pesoWrapper}>
            <input
              id={`peso-${item.produtoId}`}
              type="text"
              inputMode="decimal"
              value={pesoStr}
              onChange={handlePesoChange}
              onBlur={handlePesoBlur}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className={styles.pesoInput}
              aria-label={`Peso da caixa de ${produto?.nome ?? item.produtoId} em kg`}
            />
            <span className={styles.pesoSuffix}>kg</span>
          </div>
        </div>
      )}
      <div className={styles.itemBottom}>
        <div className={styles.valorLinha}>
          <label className={styles.valorLabel} htmlFor={`unit-${item.produtoId}`}>
            R$/{sufixoUnidade}
          </label>
          <div className={styles.valorWrapper}>
            <span className={styles.valorPrefix}>R$</span>
            <input
              id={`unit-${item.produtoId}`}
              type="text"
              inputMode="decimal"
              value={valorUnitDisplay}
              onChange={handleUnitChange}
              onBlur={handleUnitBlur}
              onFocus={(e) => e.target.select()}
              placeholder="0,00"
              className={styles.valorInput}
              aria-label={`Valor por ${sufixoUnidade} de ${produto?.nome ?? item.produtoId}`}
            />
          </div>
        </div>
        <div className={styles.valorLinha}>
          <label className={styles.valorLabel} htmlFor={`total-${item.produtoId}`}>
            Total
          </label>
          <div className={styles.valorWrapper}>
            <span className={styles.valorPrefix}>R$</span>
            <input
              id={`total-${item.produtoId}`}
              type="text"
              inputMode="decimal"
              value={valorTotalDisplay}
              onChange={handleTotalChange}
              onBlur={handleTotalBlur}
              onFocus={(e) => e.target.select()}
              placeholder="0,00"
              className={styles.valorInput}
              aria-label={`Valor total de ${produto?.nome ?? item.produtoId}`}
            />
          </div>
        </div>
      </div>
      {valorPorKgCentavos !== null && (
        <div className={styles.precoKgRow}>
          <span className={`${styles.precoKg} tabular`}>
            ≈ {formatarMoeda(valorPorKgCentavos)}/kg
          </span>
          {totalGramas !== null && (
            <span className={`${styles.totalPeso} tabular`}>
              • {formatarPeso(totalGramas)} no total
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ListaComprando({ lista }: { lista: Lista }) {
  const navigate = useNavigate();
  const definirValor = useListasStore((s) => s.definirValor);
  const atualizarQuantidade = useListasStore((s) => s.atualizarQuantidade);
  const atualizarUnidade = useListasStore((s) => s.atualizarUnidade);
  const atualizarPesoPorCaixa = useListasStore((s) => s.atualizarPesoPorCaixa);
  const removerItem = useListasStore((s) => s.removerItem);
  const finalizar = useListasStore((s) => s.finalizar);
  const catalogo = useCatalogoStore((s) => s.produtos);
  const show = useToastStore((s) => s.show);

  const comValor = itensComValor(lista);
  const progresso = progressoLista(lista);
  const totalCentavos = totalLista(lista);

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

  function handleFinalizar() {
    const ok = finalizar(lista.id);
    if (!ok) {
      const faltando = itensPendentesValor(lista);
      show(
        faltando === 1
          ? 'Falta o valor de 1 item'
          : `Faltam os valores de ${faltando} itens`,
        'warning',
      );
    }
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

      <div className={styles.progressSection}>
        <div className={styles.progressRow}>
          <ProgressBar value={progresso} size="sm" label="Progresso da compra" />
          <span className={`${styles.progressPct} tabular`}>{progresso}%</span>
        </div>
        <p className={styles.progressDesc}>
          {comValor} de {lista.itens.length}{' '}
          {lista.itens.length === 1 ? 'item preenchido' : 'itens preenchidos'}
        </p>
      </div>

      <div className={styles.itemList}>
        {lista.itens.map((item) => (
          <ItemRow
            key={item.produtoId}
            item={item}
            onDefinirValor={(produtoId, centavos) =>
              definirValor(lista.id, produtoId, centavos)
            }
            onAtualizarQuantidade={(produtoId, quantidade) =>
              atualizarQuantidade(lista.id, produtoId, quantidade)
            }
            onAtualizarUnidade={(produtoId, unidade) =>
              atualizarUnidade(lista.id, produtoId, unidade)
            }
            onAtualizarPesoPorCaixa={(produtoId, gramas) =>
              atualizarPesoPorCaixa(lista.id, produtoId, gramas)
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

      <div className={styles.stickyFooter}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total geral</span>
          <span className={`${styles.totalValor} tabular`}>
            {formatarMoeda(totalCentavos)}
          </span>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={handleFinalizar}>
          Finalizar compra
        </Button>
      </div>
    </div>
  );
}
