import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useCatalogoStore } from '@stores/catalogoStore';
import { useListasStore } from '@stores/listasStore';
import { useToastStore } from '@stores/toastStore';
import { Input } from '@components/Input';
import { Chip } from '@components/Chip';
import { Button } from '@components/Button';
import type { Categoria, ItemLista } from '@t/index';
import styles from './SelecionarProdutos.module.css';

type Filtro = 'todos' | Categoria;

const FILTROS: { label: string; value: Filtro }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Frutas', value: 'frutas' },
  { label: 'Verduras', value: 'verduras' },
  { label: 'Legumes', value: 'legumes' },
  { label: 'Raízes', value: 'raizes' },
  { label: 'Outros', value: 'outros' },
];

type LocationState = {
  adicionandoEmId?: string;
  idsExcluidos?: string[];
} | null;

export function SelecionarProdutos() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const adicionandoEmId = state?.adicionandoEmId;
  const idsExcluidos = state?.idsExcluidos ?? [];

  const catalogo = useCatalogoStore((s) => s.produtos);
  const criarLista = useListasStore((s) => s.criarLista);
  const adicionarItens = useListasStore((s) => s.adicionarItens);
  const show = useToastStore((s) => s.show);

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const idsExcluidosSet = new Set(idsExcluidos);
  const produtosFiltrados = catalogo.filter((p) => {
    if (!p.ativo) return false;
    if (adicionandoEmId && idsExcluidosSet.has(p.id)) return false;
    const matchFiltro = filtro === 'todos' || p.categoria === filtro;
    const matchBusca =
      busca.trim() === '' || p.nome.toLowerCase().includes(busca.toLowerCase().trim());
    return matchFiltro && matchBusca;
  });

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildItens(): ItemLista[] {
    return Array.from(selecionados).map((produtoId) => {
      const produto = catalogo.find((p) => p.id === produtoId);
      const item: ItemLista = {
        produtoId,
        quantidade: 1,
        unidade: produto?.unidadePadrao ?? 'caixas',
        valorUnitarioCentavos: null,
      };
      if (produto?.pesoPorCaixaGramas && produto.pesoPorCaixaGramas > 0) {
        item.pesoPorCaixaGramas = produto.pesoPorCaixaGramas;
      }
      return item;
    });
  }

  function handleContinuar() {
    if (selecionados.size === 0) return;
    const itens = buildItens();

    if (adicionandoEmId) {
      const adicionados = adicionarItens(adicionandoEmId, itens);
      if (adicionados > 0) {
        show(
          adicionados === 1 ? '1 produto adicionado' : `${adicionados} produtos adicionados`,
          'success',
        );
      }
      navigate(`/listas/${adicionandoEmId}`, { replace: true });
      return;
    }

    try {
      const lista = criarLista(itens);
      navigate(`/listas/${lista.id}`, { replace: true });
    } catch {
      show('Erro ao criar lista', 'error');
    }
  }

  const titulo = adicionandoEmId ? 'Adicionar produtos' : 'Nova lista';

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
        <h1 className={styles.pageTitle}>{titulo}</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.searchWrap}>
        <Input
          variant="search"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onClear={() => setBusca('')}
        />
      </div>

      <div className={styles.filtersWrap}>
        {FILTROS.map(({ label, value }) => (
          <Chip
            key={value}
            variant={filtro === value ? 'primary' : 'neutral'}
            size="md"
            onClick={() => setFiltro(value)}
            selected={filtro === value}
          >
            {label}
          </Chip>
        ))}
      </div>

      {produtosFiltrados.length > 0 ? (
        <div className={styles.grid} role="group" aria-label="Produtos disponíveis">
          {produtosFiltrados.map((produto) => {
            const selected = selecionados.has(produto.id);
            return (
              <button
                key={produto.id}
                type="button"
                className={`${styles.produtoCard} ${selected ? styles.produtoSelecionado : ''}`}
                onClick={() => toggleSelecionado(produto.id)}
                aria-pressed={selected}
                aria-label={produto.nome}
              >
                <span className={styles.checkIndicator} aria-hidden="true">
                  {selected && <Check size={11} strokeWidth={3} />}
                </span>
                <span
                  className={`${styles.produtoEmoji} ${!produto.emoji ? styles.produtoEmojiIniciais : ''}`}
                  aria-hidden="true"
                >
                  {produto.emoji ?? produto.nome.slice(0, 2).toUpperCase()}
                </span>
                <span className={styles.produtoNome}>{produto.nome}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyBusca}>Nenhum produto encontrado</p>
      )}

      <div className={styles.stickyFooter}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinuar}
          disabled={selecionados.size === 0}
        >
          {selecionados.size > 0 ? `Continuar (${selecionados.size})` : 'Selecione produtos'}
        </Button>
      </div>
    </div>
  );
}
