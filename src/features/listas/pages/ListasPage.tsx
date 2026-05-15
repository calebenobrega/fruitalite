import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { useListasStore } from '@stores/listasStore';
import { useToastStore } from '@stores/toastStore';
import { formatarMoeda } from '@utils/moeda';
import { tempoRelativo } from '@utils/data';
import { Button } from '@components/Button';
import { BadgeFase } from '@components/BadgeFase';
import { EmptyState } from '@components/EmptyState';
import { ListaActionSheet } from '@components/ListaActionSheet/ListaActionSheet';
import { useLongPress } from '@/hooks/useLongPress';
import type { Lista } from '@t/index';
import styles from './ListasPage.module.css';

function totalLista(lista: Lista): number {
  return lista.itens.reduce((acc, i) => {
    if (!i.valorUnitarioCentavos) return acc;
    return acc + i.valorUnitarioCentavos * i.quantidade;
  }, 0);
}

function CardLista({
  lista,
  rightSlot,
  onLongPress,
}: {
  lista: Lista;
  rightSlot: React.ReactNode;
  onLongPress: (lista: Lista) => void;
}) {
  const navigate = useNavigate();
  const { bind, swallowClickIfLongPress } = useLongPress(() => onLongPress(lista));

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (swallowClickIfLongPress(e)) return;
    navigate(`/listas/${lista.id}`);
  }

  return (
    <button
      type="button"
      className={styles.card}
      onClick={handleClick}
      {...bind}
      aria-label={`Abrir lista ${lista.nome}`}
    >
      <div className={styles.cardMain}>
        <span className={styles.cardNome}>{lista.nome}</span>
        <span className={styles.cardInfo}>
          {lista.fase === 'concluida' && lista.finalizadaEm
            ? tempoRelativo(lista.finalizadaEm)
            : `${lista.itens.length} ${lista.itens.length === 1 ? 'item' : 'itens'}`}
        </span>
      </div>
      {rightSlot}
    </button>
  );
}

export function ListasPage() {
  const navigate = useNavigate();
  const listas = useListasStore((s) => s.listas);
  const excluirLista = useListasStore((s) => s.excluirLista);
  const showToast = useToastStore((s) => s.show);

  const [listaParaExcluir, setListaParaExcluir] = useState<Lista | null>(null);

  const ativas = listas.filter((l) => l.fase === 'planejamento' || l.fase === 'comprando');
  const concluidas = listas.filter((l) => l.fase === 'concluida');

  function handleConfirmarExclusao() {
    if (!listaParaExcluir) return;
    excluirLista(listaParaExcluir.id);
    showToast(`Lista "${listaParaExcluir.nome}" excluída`, 'success');
    setListaParaExcluir(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Listas</h1>
      </header>

      {listas.length === 0 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Nenhuma lista ainda"
            description="Crie sua primeira lista para começar."
            action={
              <Button
                variant="primary"
                iconLeft={<Plus size={16} />}
                onClick={() => navigate('/listas/nova')}
              >
                Nova lista
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {ativas.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Em andamento</h2>
              <div className={styles.listGroup}>
                {ativas.map((lista) => (
                  <CardLista
                    key={lista.id}
                    lista={lista}
                    onLongPress={setListaParaExcluir}
                    rightSlot={<BadgeFase fase={lista.fase} size="sm" />}
                  />
                ))}
              </div>
            </section>
          )}

          {concluidas.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Histórico</h2>
              <div className={styles.listGroup}>
                {concluidas.map((lista) => (
                  <CardLista
                    key={lista.id}
                    lista={lista}
                    onLongPress={setListaParaExcluir}
                    rightSlot={
                      <span className={`${styles.cardTotal} tabular`}>
                        {formatarMoeda(totalLista(lista))}
                      </span>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          <div className={styles.novaListaWrap}>
            <Button
              variant="primary"
              iconLeft={<Plus size={18} />}
              fullWidth
              size="lg"
              onClick={() => navigate('/listas/nova')}
            >
              Nova lista
            </Button>
          </div>
        </>
      )}

      {listaParaExcluir && (
        <ListaActionSheet
          lista={listaParaExcluir}
          onCancelar={() => setListaParaExcluir(null)}
          onExcluir={handleConfirmarExclusao}
        />
      )}
    </div>
  );
}
