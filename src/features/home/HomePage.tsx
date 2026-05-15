import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, ShoppingBag, History, X, Settings } from 'lucide-react';
import { useUsuarioStore } from '@stores/usuarioStore';
import { useListasStore } from '@stores/listasStore';
import { useAnotacoesStore } from '@stores/anotacoesStore';
import { useToastStore } from '@stores/toastStore';
import { useCatalogoStore } from '@stores/catalogoStore';
import { saudacao, tempoRelativo } from '@utils/data';
import { formatarMoeda } from '@utils/moeda';
import { Button } from '@components/Button';
import { BadgeFase } from '@components/BadgeFase';
import { ProgressBar } from '@components/ProgressBar';
import { EmptyState } from '@components/EmptyState';
import { ListaActionSheet } from '@components/ListaActionSheet/ListaActionSheet';
import { useLongPress } from '@/hooks/useLongPress';
import type { Lista } from '@t/index';
import styles from './HomePage.module.css';

function progressoLista(lista: Lista): number {
  if (lista.itens.length === 0) return 0;
  const comValor = lista.itens.filter(
    (i) => i.valorUnitarioCentavos !== null && i.valorUnitarioCentavos > 0,
  ).length;
  return Math.round((comValor / lista.itens.length) * 100);
}

function totalLista(lista: Lista): number {
  return lista.itens.reduce((acc, i) => {
    if (!i.valorUnitarioCentavos) return acc;
    return acc + i.valorUnitarioCentavos * i.quantidade;
  }, 0);
}

function CardAtiva({
  lista,
  onLongPress,
}: {
  lista: Lista;
  onLongPress: (lista: Lista) => void;
}) {
  const navigate = useNavigate();
  const progresso = progressoLista(lista);
  const { bind, swallowClickIfLongPress } = useLongPress(() => onLongPress(lista));

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (swallowClickIfLongPress(e)) return;
    navigate(`/listas/${lista.id}`);
  }

  return (
    <button
      className={styles.cardAtiva}
      onClick={handleClick}
      {...bind}
      aria-label={`Abrir lista ${lista.nome}`}
    >
      <div className={styles.cardAtivaHeader}>
        <span className={styles.cardAtivaNome}>{lista.nome}</span>
        <BadgeFase fase={lista.fase} size="sm" />
      </div>
      <p className={styles.cardAtivaInfo}>
        {lista.itens.length} {lista.itens.length === 1 ? 'item' : 'itens'}
      </p>
      {lista.fase === 'comprando' && (
        <div className={styles.cardAtivaProgress}>
          <ProgressBar value={progresso} size="sm" label="Progresso da compra" />
          <span className={styles.cardAtivaProgressLabel}>{progresso}%</span>
        </div>
      )}
    </button>
  );
}

function CardHistorico({
  lista,
  onLongPress,
}: {
  lista: Lista;
  onLongPress: (lista: Lista) => void;
}) {
  const navigate = useNavigate();
  const total = totalLista(lista);
  const { bind, swallowClickIfLongPress } = useLongPress(() => onLongPress(lista));

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (swallowClickIfLongPress(e)) return;
    navigate(`/listas/${lista.id}`);
  }

  return (
    <button
      className={styles.cardHistorico}
      onClick={handleClick}
      {...bind}
      aria-label={`Ver lista ${lista.nome}`}
    >
      <div className={styles.cardHistoricoLeft}>
        <span className={styles.cardHistoricoNome}>{lista.nome}</span>
        <span className={styles.cardHistoricoData}>
          {lista.finalizadaEm ? tempoRelativo(lista.finalizadaEm) : ''}
        </span>
      </div>
      <span className={`${styles.cardHistoricoTotal} tabular`}>{formatarMoeda(total)}</span>
    </button>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const usuario = useUsuarioStore((s) => s.usuario);
  const listas = useListasStore((s) => s.listas);
  const excluirLista = useListasStore((s) => s.excluirLista);
  const anotacoes = useAnotacoesStore((s) => s.anotacoes);
  const marcarVisto = useAnotacoesStore((s) => s.marcarVisto);
  const showToast = useToastStore((s) => s.show);
  const catalogo = useCatalogoStore((s) => s.produtos);

  const [notifAberto, setNotifAberto] = useState(false);
  const [listaParaExcluir, setListaParaExcluir] = useState<Lista | null>(null);

  function handleConfirmarExclusao() {
    if (!listaParaExcluir) return;
    excluirLista(listaParaExcluir.id);
    showToast(`Lista "${listaParaExcluir.nome}" excluída`, 'success');
    setListaParaExcluir(null);
  }

  const listaAtiva = listas.find((l) => l.fase === 'planejamento' || l.fase === 'comprando') ?? null;
  const concluidas = listas.filter((l) => l.fase === 'concluida');
  const ultimas3 = concluidas.slice(0, 3);

  const nomeExibido = usuario?.nome ?? '';
  const tagLoja = usuario?.tagLoja ?? '';

  // ── Estatísticas (só se houver listas concluídas)
  const totalGasto = concluidas.reduce((acc, l) => acc + totalLista(l), 0);
  const ticketMedio = concluidas.length > 0 ? Math.round(totalGasto / concluidas.length) : 0;
  const contagemProdutos = new Map<string, number>();
  for (const lista of concluidas) {
    for (const item of lista.itens) {
      contagemProdutos.set(item.produtoId, (contagemProdutos.get(item.produtoId) ?? 0) + 1);
    }
  }
  let topId: string | null = null;
  let topCount = 0;
  for (const [id, count] of contagemProdutos) {
    if (count > topCount) { topCount = count; topId = id; }
  }
  const maisComprado = topId ? (catalogo.find((p) => p.id === topId) ?? null) : null;

  const disparadasNaoVistas = anotacoes.filter(
    (a) => a.lembrete?.disparado && !a.lembrete?.visto,
  );

  return (
    <div className={styles.page}>

      {/* ── App header: logo + sino + sair ─────────── */}
      <header className={styles.appHeader}>
        <img
          src="/brand/01_horizontal_creme.svg"
          alt="FruitaLite"
          className={styles.headerLogo}
          draggable={false}
        />
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.sairBtn}
            onClick={() => navigate('/configuracoes')}
            aria-label="Configurações"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
          <div className={styles.notifWrapper}>
            <button
              className={styles.notifBtn}
              onClick={() => setNotifAberto(true)}
              aria-label={`Notificações${disparadasNaoVistas.length > 0 ? ` — ${disparadasNaoVistas.length} nova${disparadasNaoVistas.length > 1 ? 's' : ''}` : ''}`}
            >
              <Bell size={22} strokeWidth={2} />
            </button>
            {disparadasNaoVistas.length > 0 && (
              <span className={styles.notifBadge} aria-hidden="true">
                {disparadasNaoVistas.length > 9 ? '9+' : disparadasNaoVistas.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Saudação ────────────────────────────── */}
      <div className={styles.greeting}>
        <p className={styles.saudacao}>
          {saudacao()}, <strong>{nomeExibido}</strong>
        </p>
        {tagLoja && <span className={styles.tagLoja}>{tagLoja}</span>}
      </div>

      {/* ── Nova lista ──────────────────────────── */}
      <div className={styles.novaListaWrap}>
        <Button
          variant="primary"
          iconLeft={<Plus size={16} />}
          fullWidth
          onClick={() => navigate('/listas/nova')}
        >
          Nova lista
        </Button>
      </div>

      {/* ── Lista em andamento ──────────────────── */}
      {listaAtiva && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Em andamento</h2>
          <CardAtiva lista={listaAtiva} onLongPress={setListaParaExcluir} />
        </section>
      )}

      {/* ── Histórico recente ───────────────────── */}
      {ultimas3.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recentes</h2>
            {concluidas.length > 3 && (
              <button className={styles.verTodos} onClick={() => navigate('/listas')}>
                Ver todos
              </button>
            )}
          </div>
          <div className={styles.historicoList}>
            {ultimas3.map((lista) => (
              <CardHistorico key={lista.id} lista={lista} onLongPress={setListaParaExcluir} />
            ))}
          </div>
        </section>
      )}

      {/* ── Estatísticas ─────────────────────────── */}
      {concluidas.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resumo</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={`${styles.statValor} tabular`}>{formatarMoeda(totalGasto)}</span>
              <span className={styles.statLabel}>Total gasto</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValor} tabular`}>{formatarMoeda(ticketMedio)}</span>
              <span className={styles.statLabel}>Ticket médio</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statEmoji} aria-hidden="true">
                {maisComprado?.emoji ?? '—'}
              </span>
              <span className={styles.statLabel}>
                {maisComprado?.nome ?? '—'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Empty state ─────────────────────────── */}
      {!listaAtiva && ultimas3.length === 0 && (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Nenhuma lista por aqui"
            description="Crie sua primeira lista e planeje sua ida ao hortifrúti."
          />
        </div>
      )}

      {/* ── Histórico vazio mas com lista ativa ─── */}
      {listaAtiva && ultimas3.length === 0 && (
        <div className={styles.emptyHistorico}>
          <History size={20} />
          <span>Listas finalizadas aparecerão aqui</span>
        </div>
      )}

      {/* ── Action sheet: excluir lista ──────────── */}
      {listaParaExcluir && (
        <ListaActionSheet
          lista={listaParaExcluir}
          onCancelar={() => setListaParaExcluir(null)}
          onExcluir={handleConfirmarExclusao}
        />
      )}

      {/* ── Bottom sheet de lembretes ────────────── */}
      {notifAberto && (
        <div
          className={styles.notifOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Lembretes"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNotifAberto(false);
          }}
        >
          <div className={styles.notifSheet}>
            <div className={styles.notifSheetHeader}>
              <span className={styles.notifSheetTitle}>Lembretes</span>
              <button
                type="button"
                className={styles.notifCloseBtn}
                onClick={() => setNotifAberto(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {disparadasNaoVistas.length === 0 ? (
              <p className={styles.notifEmpty}>Nenhum lembrete pendente.</p>
            ) : (
              <ul className={styles.notifList}>
                {disparadasNaoVistas.map((a) => (
                  <li key={a.id} className={styles.notifItem}>
                    <div className={styles.notifItemInfo}>
                      <span className={styles.notifItemTitulo}>{a.titulo}</span>
                      <span className={styles.notifItemHora}>
                        {a.lembrete
                          ? new Date(a.lembrete.dataHora).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.vistoBtn}
                      onClick={() => {
                        marcarVisto(a.id);
                        if (disparadasNaoVistas.length === 1) setNotifAberto(false);
                      }}
                    >
                      Visto ✓
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
