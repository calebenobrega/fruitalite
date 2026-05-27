import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useCatalogoStore } from '@stores/catalogoStore';
import { useToastStore } from '@stores/toastStore';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { formatarPeso } from '@utils/peso';
import type { Categoria, Produto } from '@t/index';
import { ProdutoEditSheet } from './ProdutoEditSheet';
import styles from './CatalogoPage.module.css';

type Filtro = 'todos' | 'inativos' | Categoria;

const FILTROS: { label: string; value: Filtro }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Frutas', value: 'frutas' },
  { label: 'Verduras', value: 'verduras' },
  { label: 'Legumes', value: 'legumes' },
  { label: 'Raízes', value: 'raizes' },
  { label: 'Outros', value: 'outros' },
  { label: 'Inativos', value: 'inativos' },
];

export function CatalogoPage() {
  const produtos = useCatalogoStore((s) => s.produtos);
  const restaurarPadrao = useCatalogoStore((s) => s.restaurarPadrao);
  const show = useToastStore((s) => s.show);

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [sheetState, setSheetState] = useState<
    { modo: 'criar' } | { modo: 'editar'; produto: Produto } | null
  >(null);
  const [confirmandoRestauro, setConfirmandoRestauro] = useState(false);

  const produtosFiltrados = produtos
    .filter((p) => {
      const matchBusca =
        busca.trim() === '' || p.nome.toLowerCase().includes(busca.toLowerCase().trim());
      if (!matchBusca) return false;
      if (filtro === 'inativos') return !p.ativo;
      if (!p.ativo) return false;
      if (filtro === 'todos') return true;
      return p.categoria === filtro;
    })
    .sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }),
    );

  function handleRestaurar() {
    restaurarPadrao();
    show('Catálogo padrão restaurado', 'success');
    setConfirmandoRestauro(false);
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Catálogo</h1>
        <button
          type="button"
          className={styles.novoBtn}
          onClick={() => setSheetState({ modo: 'criar' })}
          aria-label="Adicionar novo produto"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo
        </button>
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
          <button
            key={value}
            type="button"
            className={`${styles.catBtn} ${filtro === value ? styles.catActive : ''}`}
            onClick={() => setFiltro(value)}
            aria-pressed={filtro === value}
          >
            {label}
          </button>
        ))}
      </div>

      <p className={styles.contador}>
        {produtosFiltrados.length}{' '}
        {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
      </p>

      {produtosFiltrados.length === 0 ? (
        <p className={styles.emptyText}>
          {busca || filtro !== 'todos'
            ? 'Nenhum produto encontrado'
            : 'Nenhum produto no catálogo'}
        </p>
      ) : (
        <div className={styles.listGroup}>
          {produtosFiltrados.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.card} ${!p.ativo ? styles.cardInativo : ''}`}
              onClick={() => setSheetState({ modo: 'editar', produto: p })}
              aria-label={`Editar ${p.nome}`}
            >
              <span
                className={`${styles.cardEmoji} ${!p.emoji ? styles.cardEmojiIniciais : ''}`}
                aria-hidden="true"
              >
                {p.emoji ?? p.nome.slice(0, 2).toUpperCase()}
              </span>
              <div className={styles.cardMain}>
                <span className={styles.cardNome}>{p.nome}</span>
                <span className={styles.cardCategoria}>{p.categoria}</span>
              </div>
              {p.pesoPorCaixaGramas && p.pesoPorCaixaGramas > 0 && (
                <span className={styles.cardPeso}>
                  {formatarPeso(p.pesoPorCaixaGramas)}/cx
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className={styles.restaurarWrap}>
        {confirmandoRestauro ? (
          <div className={styles.confirmRestaurar}>
            <p className={styles.confirmTexto}>
              Restaurar o catálogo padrão? Isso vai descartar todos os produtos personalizados
              e voltar à lista original.
            </p>
            <div className={styles.confirmBtns}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmandoRestauro(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRestaurar}>
                Restaurar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.restaurarBtn}
            onClick={() => setConfirmandoRestauro(true)}
          >
            <RotateCcw size={14} strokeWidth={2} />
            Restaurar padrão
          </button>
        )}
      </div>

      {sheetState && (
        <ProdutoEditSheet
          produto={sheetState.modo === 'editar' ? sheetState.produto : null}
          modo={sheetState.modo}
          onFechar={() => setSheetState(null)}
        />
      )}
    </div>
  );
}
