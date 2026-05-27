import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useCatalogoStore } from '@stores/catalogoStore';
import { useToastStore } from '@stores/toastStore';
import { Button } from '@components/Button';
import type { Categoria, Produto, Unidade } from '@t/index';
import styles from './ProdutoEditSheet.module.css';

const CATEGORIAS: { label: string; value: Categoria }[] = [
  { label: 'Frutas', value: 'frutas' },
  { label: 'Verduras', value: 'verduras' },
  { label: 'Legumes', value: 'legumes' },
  { label: 'Raízes', value: 'raizes' },
  { label: 'Outros', value: 'outros' },
];

const UNIDADES: { label: string; value: Unidade }[] = [
  { label: 'Caixas', value: 'caixas' },
  { label: 'Unidades', value: 'unidades' },
  { label: 'Kg', value: 'kg' },
];

type Props = {
  produto: Produto | null;
  modo: 'criar' | 'editar';
  onFechar: () => void;
};

export function ProdutoEditSheet({ produto, modo, onFechar }: Props) {
  const adicionar = useCatalogoStore((s) => s.adicionar);
  const editar = useCatalogoStore((s) => s.editar);
  const remover = useCatalogoStore((s) => s.remover);
  const show = useToastStore((s) => s.show);

  const [nome, setNome] = useState(produto?.nome ?? '');
  const [emoji, setEmoji] = useState(produto?.emoji ?? '');
  const [categoria, setCategoria] = useState<Categoria>(produto?.categoria ?? 'frutas');
  const [unidadePadrao, setUnidadePadrao] = useState<Unidade>(produto?.unidadePadrao ?? 'caixas');
  const [pesoKg, setPesoKg] = useState(() =>
    produto?.pesoPorCaixaGramas
      ? String(produto.pesoPorCaixaGramas / 1000).replace('.', ',')
      : '',
  );
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);

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

  function handleEmojiChange(e: ChangeEvent<HTMLInputElement>) {
    // Mantém apenas o primeiro símbolo (emoji geralmente são 1-2 code units com VS-16)
    const value = e.target.value;
    if (value === '') {
      setEmoji('');
      return;
    }
    const chars = Array.from(value);
    setEmoji(chars[0] ?? '');
  }

  function parsePesoGramas(): number | undefined {
    const trimmed = pesoKg.trim().replace(',', '.');
    if (trimmed === '') return undefined;
    const kg = parseFloat(trimmed);
    if (isNaN(kg) || kg <= 0) return undefined;
    return Math.round(kg * 1000);
  }

  const nomeValido = nome.trim().length > 0;
  const emojiFinal = emoji.trim() || undefined;

  function handleSalvar() {
    if (!nomeValido) return;
    const pesoGramas = parsePesoGramas();
    const dados: Omit<Produto, 'id'> = {
      nome: nome.trim(),
      emoji: emojiFinal,
      categoria,
      unidadePadrao,
      ativo,
    };
    if (pesoGramas) dados.pesoPorCaixaGramas = pesoGramas;

    if (modo === 'criar') {
      const novo = adicionar(dados);
      show(`${novo.nome} adicionado`, 'success');
    } else if (produto) {
      const partial: Partial<Omit<Produto, 'id'>> = { ...dados };
      // Limpa o peso quando o usuário apaga o valor.
      if (!pesoGramas) partial.pesoPorCaixaGramas = undefined;
      editar(produto.id, partial);
      show(`${dados.nome} atualizado`, 'success');
    }
    onFechar();
  }

  function handleExcluir() {
    if (!produto) return;
    remover(produto.id);
    show(`${produto.nome} removido do catálogo`, 'success');
    onFechar();
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={modo === 'criar' ? 'Novo produto' : 'Editar produto'}
      onClick={handleOverlayClick}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        <h2 className={styles.titulo}>
          {modo === 'criar' ? 'Novo produto' : 'Editar produto'}
        </h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="produto-nome">
            Nome
          </label>
          <input
            id="produto-nome"
            type="text"
            className={styles.input}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Manga Tommy"
            autoFocus={modo === 'criar'}
            maxLength={40}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="produto-emoji">
            Emoji <span className={styles.labelOpcional}>(opcional)</span>
          </label>
          <div className={styles.emojiRow}>
            <span className={styles.emojiPreview} aria-hidden="true">
              {emojiFinal ?? nome.slice(0, 2).toUpperCase() || '?'}
            </span>
            <input
              id="produto-emoji"
              type="text"
              className={`${styles.input} ${styles.emojiInput}`}
              value={emoji}
              onChange={handleEmojiChange}
              placeholder="Sem emoji → iniciais"
              maxLength={4}
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Categoria</span>
          <div className={styles.categoriaGroup} role="radiogroup">
            {CATEGORIAS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                className={`${styles.catBtn} ${categoria === value ? styles.catActive : ''}`}
                onClick={() => setCategoria(value)}
                aria-pressed={categoria === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Unidade padrão</span>
          <p className={styles.helper}>
            Pré-preenche a unidade ao adicionar à lista.
          </p>
          <div className={styles.categoriaGroup} role="radiogroup">
            {UNIDADES.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                className={`${styles.catBtn} ${unidadePadrao === value ? styles.catActive : ''}`}
                onClick={() => setUnidadePadrao(value)}
                aria-pressed={unidadePadrao === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="produto-peso">
            Peso padrão da caixa (opcional)
          </label>
          <div className={styles.pesoWrapper}>
            <input
              id="produto-peso"
              type="text"
              inputMode="decimal"
              className={styles.pesoInput}
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              placeholder="0"
            />
            <span className={styles.pesoSuffix}>kg</span>
          </div>
          <p className={styles.helper}>
            Auto-preenche o peso por caixa quando o produto for adicionado a uma lista em Cx.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            <span className={styles.toggleText}>Produto ativo</span>
          </label>
          <p className={styles.helper}>
            Produtos inativos não aparecem na seleção de lista.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelarBtn} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.salvarBtn}
            onClick={handleSalvar}
            disabled={!nomeValido}
          >
            Salvar
          </button>
        </div>

        {modo === 'editar' && produto && (
          <div className={styles.excluirSection}>
            {confirmandoExcluir ? (
              <div className={styles.confirmacao}>
                <p className={styles.confirmacaoTexto}>
                  Remover &ldquo;{produto.nome}&rdquo; do catálogo? Listas existentes que usam
                  este produto continuarão funcionando.
                </p>
                <div className={styles.confirmacaoBtns}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmandoExcluir(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleExcluir}>
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={styles.excluirBtn}
                onClick={() => setConfirmandoExcluir(true)}
              >
                <Trash2 size={16} strokeWidth={2} />
                Remover do catálogo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
