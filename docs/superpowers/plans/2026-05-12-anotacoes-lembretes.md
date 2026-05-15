# Anotações com Lembretes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CRUD de anotações com lembretes opcionais que disparam notificação browser e aparecem no sino da home.

**Architecture:** `Lembrete` vive dentro de `Anotacao` (fonte única de verdade). `useLembretes` hook no `Layout` agenda `setTimeout` para cada lembrete pendente e dispara `Notification` API ao atingir o horário. O sino na `HomePage` lê anotações com `disparado && !visto` e exibe bottom sheet para marcá-las como vistas.

**Tech Stack:** React 19, TypeScript strict, Zustand v5 persist, CSS Modules + CSS custom properties, Lucide React, Vite.

---

## Task 1 — Atualizar tipos

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Substituir o tipo `Anotacao` e adicionar `Lembrete`**

```ts
// src/types/index.ts — substitua as últimas linhas:

export type Lembrete = {
  dataHora: string;   // ISO 8601
  disparado: boolean;
  visto: boolean;
};

export type Anotacao = {
  id: string;
  titulo: string;
  conteudo: string;
  lembrete: Lembrete | null;
  criadaEm: string;
  atualizadaEm: string;
};
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: erros em `anotacoesStore.ts` (spread de `...dados` não inclui `lembrete`). Isso será corrigido na Task 2.

---

## Task 2 — Atualizar `anotacoesStore`

**Files:**
- Modify: `src/stores/anotacoesStore.ts`

- [ ] **Reescrever o store completo**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Anotacao, Lembrete } from '@types/index';

type CriarDados = { titulo: string; conteudo: string; lembrete?: Lembrete | null };

type AnotacoesState = {
  anotacoes: Anotacao[];
  criar: (dados: CriarDados) => void;
  editar: (id: string, dados: Pick<Anotacao, 'titulo' | 'conteudo'>) => void;
  excluir: (id: string) => void;
  definirLembrete: (id: string, dataHora: string) => void;
  removerLembrete: (id: string) => void;
  marcarDisparado: (id: string) => void;
  marcarVisto: (id: string) => void;
};

export const useAnotacoesStore = create<AnotacoesState>()(
  persist(
    (set) => ({
      anotacoes: [],

      criar(dados) {
        const agora = new Date().toISOString();
        const anotacao: Anotacao = {
          id: crypto.randomUUID(),
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          lembrete: dados.lembrete ?? null,
          criadaEm: agora,
          atualizadaEm: agora,
        };
        set((s) => ({ anotacoes: [anotacao, ...s.anotacoes] }));
      },

      editar(id, dados) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id ? { ...a, ...dados, atualizadaEm: new Date().toISOString() } : a,
          ),
        }));
      },

      excluir(id) {
        set((s) => ({ anotacoes: s.anotacoes.filter((a) => a.id !== id) }));
      },

      definirLembrete(id, dataHora) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id
              ? { ...a, lembrete: { dataHora, disparado: false, visto: false } }
              : a,
          ),
        }));
      },

      removerLembrete(id) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id ? { ...a, lembrete: null } : a,
          ),
        }));
      },

      marcarDisparado(id) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id && a.lembrete
              ? { ...a, lembrete: { ...a.lembrete, disparado: true } }
              : a,
          ),
        }));
      },

      marcarVisto(id) {
        set((s) => ({
          anotacoes: s.anotacoes.map((a) =>
            a.id === id && a.lembrete
              ? { ...a, lembrete: { ...a.lembrete, visto: true } }
              : a,
          ),
        }));
      },
    }),
    {
      name: 'fruitalite:anotacoes',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: 0 erros.

---

## Task 3 — Criar hook `useLembretes`

**Files:**
- Create: `src/features/anotacoes/hooks/useLembretes.ts`

- [ ] **Criar o arquivo do hook**

```ts
import { useEffect, useRef } from 'react';
import { useAnotacoesStore } from '@stores/anotacoesStore';

export function useLembretes() {
  const anotacoes = useAnotacoesStore((s) => s.anotacoes);
  const marcarDisparado = useAnotacoesStore((s) => s.marcarDisparado);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    const agora = Date.now();
    const pendentes = anotacoes.filter(
      (a) => a.lembrete !== null && !a.lembrete.disparado,
    );

    timeoutsRef.current.forEach((tid) => clearTimeout(tid));
    timeoutsRef.current.clear();

    for (const anotacao of pendentes) {
      const lembrete = anotacao.lembrete!;
      const ms = new Date(lembrete.dataHora).getTime() - agora;

      if (ms <= 0) {
        marcarDisparado(anotacao.id);
      } else {
        const tid = setTimeout(() => {
          marcarDisparado(anotacao.id);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(anotacao.titulo || 'Lembrete', {
              body: anotacao.conteudo || 'Você tem um lembrete no FruitaLite.',
              icon: '/brand/05_icone_app_rounded.svg',
            });
          }
        }, ms);
        timeoutsRef.current.set(anotacao.id, tid);
      }
    }

    return () => {
      timeoutsRef.current.forEach((tid) => clearTimeout(tid));
      timeoutsRef.current.clear();
    };
  }, [anotacoes, marcarDisparado]);
}
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: 0 erros.

---

## Task 4 — Conectar hook no `Layout`

**Files:**
- Modify: `src/app/Layout.tsx`

- [ ] **Adicionar `useLembretes` no Layout**

```tsx
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from '@components/BottomNav';
import { ToastPortal } from '@components/Toast';
import { useLembretes } from '@features/anotacoes/hooks/useLembretes';

type LayoutProps = {
  children: ReactNode;
};

const HIDE_NAV_PATHS = ['/onboarding'];

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV_PATHS.includes(pathname);
  useLembretes();

  return (
    <div className="app-shell">
      <main className="app-content">{children}</main>
      {showNav && <BottomNav />}
      <ToastPortal />
    </div>
  );
}
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: 0 erros.

---

## Task 5 — Criar `AnotacoesPage.tsx`

**Files:**
- Create: `src/features/anotacoes/AnotacoesPage.tsx`

- [ ] **Criar o arquivo**

```tsx
import { useState } from 'react';
import { Bell, ClipboardList, Plus, X } from 'lucide-react';
import { useAnotacoesStore } from '@stores/anotacoesStore';
import { useToastStore } from '@stores/toastStore';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { tempoRelativo } from '@utils/data';
import type { Anotacao, Lembrete } from '@types/index';
import styles from './AnotacoesPage.module.css';

type SheetMode = 'criar' | 'editar';

function minDatetimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

export function AnotacoesPage() {
  const anotacoes = useAnotacoesStore((s) => s.anotacoes);
  const criar = useAnotacoesStore((s) => s.criar);
  const editar = useAnotacoesStore((s) => s.editar);
  const excluir = useAnotacoesStore((s) => s.excluir);
  const definirLembrete = useAnotacoesStore((s) => s.definirLembrete);
  const removerLembrete = useAnotacoesStore((s) => s.removerLembrete);
  const show = useToastStore((s) => s.show);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [sheetModo, setSheetModo] = useState<SheetMode>('criar');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [temLembrete, setTemLembrete] = useState(false);
  const [dataHoraStr, setDataHoraStr] = useState('');
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);

  function abrirCriar() {
    setSheetModo('criar');
    setEditandoId(null);
    setTitulo('');
    setConteudo('');
    setTemLembrete(false);
    setDataHoraStr('');
    setConfirmandoExcluir(false);
    setSheetAberto(true);
  }

  function abrirEditar(a: Anotacao) {
    setSheetModo('editar');
    setEditandoId(a.id);
    setTitulo(a.titulo);
    setConteudo(a.conteudo);
    setTemLembrete(a.lembrete !== null);
    setDataHoraStr(a.lembrete ? a.lembrete.dataHora.slice(0, 16) : '');
    setConfirmandoExcluir(false);
    setSheetAberto(true);
  }

  function fecharSheet() {
    setSheetAberto(false);
    setConfirmandoExcluir(false);
  }

  function handleSalvar() {
    if (!titulo.trim()) {
      show('O título é obrigatório', 'warning');
      return;
    }

    const lembreteNovo: Lembrete | null =
      temLembrete && dataHoraStr
        ? { dataHora: new Date(dataHoraStr).toISOString(), disparado: false, visto: false }
        : null;

    if (sheetModo === 'criar') {
      criar({ titulo: titulo.trim(), conteudo: conteudo.trim(), lembrete: lembreteNovo });
      show('Anotação criada', 'success');
    } else if (editandoId) {
      editar(editandoId, { titulo: titulo.trim(), conteudo: conteudo.trim() });
      if (temLembrete && dataHoraStr) {
        definirLembrete(editandoId, new Date(dataHoraStr).toISOString());
      } else {
        removerLembrete(editandoId);
      }
      show('Anotação salva', 'success');
    }
    fecharSheet();
  }

  function handleExcluir() {
    if (!editandoId) return;
    excluir(editandoId);
    show('Anotação excluída', 'info');
    fecharSheet();
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Anotações</h1>
      </header>

      {anotacoes.length === 0 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="Nenhuma anotação"
            description="Toque em + para criar sua primeira anotação."
          />
        </div>
      ) : (
        <ul className={styles.cardList}>
          {anotacoes.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={styles.card}
                onClick={() => abrirEditar(a)}
                aria-label={`Editar anotação: ${a.titulo}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardTitulo}>{a.titulo}</span>
                  {a.lembrete && !a.lembrete.visto && (
                    <Bell
                      size={14}
                      className={styles.cardBell}
                      aria-label="Lembrete ativo"
                    />
                  )}
                </div>
                {a.conteudo ? (
                  <p className={styles.cardPreview}>{a.conteudo}</p>
                ) : null}
                <span className={styles.cardData}>{tempoRelativo(a.atualizadaEm)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={abrirCriar}
        aria-label="Nova anotação"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {sheetAberto && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={sheetModo === 'criar' ? 'Nova anotação' : 'Editar anotação'}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharSheet();
          }}
        >
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>
                {sheetModo === 'criar' ? 'Nova anotação' : 'Editar anotação'}
              </span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={fecharSheet}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="anotacao-titulo">
                Título
              </label>
              <input
                id="anotacao-titulo"
                type="text"
                className={styles.fieldInput}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Conferir preços de banana"
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="anotacao-conteudo">
                Conteúdo{' '}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="anotacao-conteudo"
                className={styles.fieldTextarea}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Detalhes..."
                rows={3}
              />
            </div>

            <div className={styles.toggleRow}>
              <span className={styles.fieldLabel}>Lembrete</span>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={temLembrete}
                  onChange={(e) => setTemLembrete(e.target.checked)}
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </label>
            </div>

            {temLembrete && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="anotacao-lembrete">
                  Data e hora
                </label>
                <input
                  id="anotacao-lembrete"
                  type="datetime-local"
                  className={styles.fieldInput}
                  value={dataHoraStr}
                  min={minDatetimeLocal()}
                  onChange={(e) => setDataHoraStr(e.target.value)}
                />
              </div>
            )}

            <div className={styles.sheetFooter}>
              <Button variant="primary" size="lg" fullWidth onClick={handleSalvar}>
                Salvar
              </Button>

              {sheetModo === 'editar' && !confirmandoExcluir && (
                <button
                  type="button"
                  className={styles.excluirBtn}
                  onClick={() => setConfirmandoExcluir(true)}
                >
                  Excluir anotação
                </button>
              )}

              {confirmandoExcluir && (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Tem certeza?</span>
                  <div className={styles.confirmBtns}>
                    <Button variant="destructive" size="sm" onClick={handleExcluir}>
                      Excluir
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfirmandoExcluir(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: erro sobre CSS module (arquivo ainda não existe). Prosseguir para Task 6.

---

## Task 6 — Criar `AnotacoesPage.module.css`

**Files:**
- Create: `src/features/anotacoes/AnotacoesPage.module.css`

- [ ] **Criar o arquivo**

```css
/* ── Layout ──────────────────────────────────── */

.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 0 var(--viewport-padding);
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 80px);
}

/* ── Header ──────────────────────────────────── */

.pageHeader {
  padding: 24px 0 20px;
}

.pageTitle {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

/* ── Card list ───────────────────────────────── */

.cardList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}

.card {
  width: 100%;
  text-align: left;
  background: var(--surface);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing-default);
}

.card:hover {
  background: var(--surface-sunken);
}

.cardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cardTitulo {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cardBell {
  color: var(--primary);
  flex-shrink: 0;
}

.cardPreview {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cardData {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-disabled);
}

/* ── Empty state ─────────────────────────────── */

.emptyWrap {
  padding-top: 32px;
}

/* ── FAB ─────────────────────────────────────── */

.fab {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + 16px + env(safe-area-inset-bottom, 0px));
  right: var(--viewport-padding);
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--primary);
  color: var(--on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  transition:
    transform var(--duration-fast) var(--easing-default),
    box-shadow var(--duration-fast) var(--easing-default);
}

.fab:hover {
  transform: scale(1.05);
}

.fab:active {
  transform: scale(0.97);
}

/* ── Bottom sheet overlay ────────────────────── */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 30;
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  background: var(--surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 20px var(--viewport-padding)
    calc(var(--viewport-padding) + env(safe-area-inset-bottom, 0px));
  max-height: 88dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheetHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheetTitle {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.closeBtn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  background: var(--surface-sunken);
  transition: background var(--duration-fast) var(--easing-default);
}

.closeBtn:hover {
  background: var(--border);
}

/* ── Form fields ─────────────────────────────── */

.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fieldLabel {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.optional {
  font-weight: 400;
}

.fieldInput {
  height: 44px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 12px;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  width: 100%;
  transition:
    border-color var(--duration-fast) var(--easing-default),
    box-shadow var(--duration-fast) var(--easing-default);
}

.fieldInput:focus {
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
}

.fieldTextarea {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  width: 100%;
  resize: none;
  line-height: 1.5;
  transition:
    border-color var(--duration-fast) var(--easing-default),
    box-shadow var(--duration-fast) var(--easing-default);
}

.fieldTextarea:focus {
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
}

/* ── Lembrete toggle ─────────────────────────── */

.toggleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggleLabel {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 26px;
  cursor: pointer;
}

.toggleInput {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggleTrack {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: var(--radius-full);
  transition: background var(--duration) var(--easing-default);
}

.toggleTrack::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration) var(--easing-default);
}

.toggleInput:checked + .toggleTrack {
  background: var(--primary);
}

.toggleInput:checked + .toggleTrack::after {
  transform: translateX(18px);
}

/* ── Sheet footer ────────────────────────────── */

.sheetFooter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.excluirBtn {
  height: 44px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--error);
  background: transparent;
  text-align: center;
  transition: opacity var(--duration-fast) var(--easing-default);
}

.excluirBtn:hover {
  opacity: 0.75;
}

.confirmRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: var(--error-soft);
  border-radius: var(--radius);
}

.confirmText {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--error);
}

.confirmBtns {
  display: flex;
  gap: 8px;
}
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: 0 erros.

---

## Task 7 — Atualizar `routes.tsx`

**Files:**
- Modify: `src/app/routes.tsx`

- [ ] **Substituir o placeholder de Anotações pela página real**

Remover a função `PlaceholderAnotacoes` e seu import de `ClipboardList`.
Adicionar import e usar `AnotacoesPage`:

```tsx
import { AnotacoesPage } from '@features/anotacoes/AnotacoesPage';
```

Rota `/anotacoes` passa de:
```tsx
<PlaceholderAnotacoes />
```
Para:
```tsx
<AnotacoesPage />
```

Remova também o import de `ClipboardList` se não for mais usado em nenhum outro lugar do arquivo.

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: 0 erros.

---

## Task 8 — Atualizar `HomePage.tsx` (badge + sheet de lembretes)

**Files:**
- Modify: `src/features/home/HomePage.tsx`

- [ ] **Reescrever HomePage com badge no sino e bottom sheet de lembretes**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, ShoppingBag, History, X } from 'lucide-react';
import { useUsuarioStore } from '@stores/usuarioStore';
import { useListasStore } from '@stores/listasStore';
import { useAnotacoesStore } from '@stores/anotacoesStore';
import { saudacao, tempoRelativo } from '@utils/data';
import { formatarMoeda } from '@utils/moeda';
import { Button } from '@components/Button';
import { BadgeFase } from '@components/BadgeFase';
import { ProgressBar } from '@components/ProgressBar';
import { EmptyState } from '@components/EmptyState';
import type { Lista } from '@types/index';
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

function CardAtiva({ lista }: { lista: Lista }) {
  const navigate = useNavigate();
  const progresso = progressoLista(lista);

  return (
    <button
      className={styles.cardAtiva}
      onClick={() => navigate(`/listas/${lista.id}`)}
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

function CardHistorico({ lista }: { lista: Lista }) {
  const navigate = useNavigate();
  const total = totalLista(lista);

  return (
    <button
      className={styles.cardHistorico}
      onClick={() => navigate(`/listas/${lista.id}`)}
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
  const anotacoes = useAnotacoesStore((s) => s.anotacoes);
  const marcarVisto = useAnotacoesStore((s) => s.marcarVisto);

  const [notifAberto, setNotifAberto] = useState(false);

  const listaAtiva =
    listas.find((l) => l.fase === 'planejamento' || l.fase === 'comprando') ?? null;
  const concluidas = listas.filter((l) => l.fase === 'concluida');
  const ultimas3 = concluidas.slice(0, 3);

  const nomeExibido = usuario?.nome ?? '';
  const tagLoja = usuario?.tagLoja ?? '';

  const disparadasNaoVistas = anotacoes.filter(
    (a) => a.lembrete?.disparado && !a.lembrete?.visto,
  );

  return (
    <div className={styles.page}>

      {/* ── App header: logo + sino ─────────────── */}
      <header className={styles.appHeader}>
        <img
          src="/brand/01_horizontal_creme.svg"
          alt="FruitaLite"
          className={styles.headerLogo}
          draggable={false}
        />
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
      </header>

      {/* ── Saudação ────────────────────────────── */}
      <div className={styles.greeting}>
        <p className={styles.saudacao}>
          {saudacao()}, <strong>{nomeExibido}</strong>
        </p>
        {tagLoja && <span className={styles.tagLoja}>{tagLoja}</span>}
      </div>

      {/* ── Lista em andamento ──────────────────── */}
      {listaAtiva && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Em andamento</h2>
          <CardAtiva lista={listaAtiva} />
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
              <CardHistorico key={lista.id} lista={lista} />
            ))}
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
      )}

      {/* ── Histórico vazio mas com lista ativa ─── */}
      {listaAtiva && ultimas3.length === 0 && (
        <div className={styles.emptyHistorico}>
          <History size={20} />
          <span>Listas finalizadas aparecerão aqui</span>
        </div>
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
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: erros de CSS (classes ainda não existem em HomePage.module.css). Prosseguir para Task 9.

---

## Task 9 — Atualizar `HomePage.module.css`

**Files:**
- Modify: `src/features/home/HomePage.module.css`

- [ ] **Substituir o bloco `/* ── App header */` e adicionar estilos novos**

Substituir o bloco existente `.notifBtn` (linhas 23–39) por:

```css
.notifWrapper {
  position: relative;
  flex-shrink: 0;
}

.notifBtn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  background: transparent;
  transition: background var(--duration-fast) var(--easing-default);
}

.notifBtn:hover {
  background: var(--surface-sunken);
  color: var(--text);
}

.notifBadge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--error);
  color: #fff;
  border-radius: var(--radius-full);
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Adicionar ao final do arquivo os estilos do bottom sheet de lembretes**

```css
/* ── Notification bottom sheet ─────────────────── */

.notifOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 30;
  display: flex;
  align-items: flex-end;
}

.notifSheet {
  width: 100%;
  background: var(--surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 20px var(--viewport-padding)
    calc(var(--viewport-padding) + env(safe-area-inset-bottom, 0px));
  max-height: 70dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notifSheetHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notifSheetTitle {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.notifCloseBtn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  background: var(--surface-sunken);
  transition: background var(--duration-fast) var(--easing-default);
}

.notifCloseBtn:hover {
  background: var(--border);
}

.notifList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}

.notifItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  padding: 12px 16px;
}

.notifItemInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.notifItemTitulo {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notifItemHora {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.vistoBtn {
  height: 32px;
  padding: 0 12px;
  border-radius: var(--radius);
  background: var(--primary-soft);
  color: var(--primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background var(--duration-fast) var(--easing-default);
}

.vistoBtn:hover {
  background: color-mix(in srgb, var(--primary-soft) 70%, var(--primary) 30%);
}

.notifEmpty {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
  padding: 16px 0;
}
```

- [ ] **Verificar TypeScript**

```
npx tsc --noEmit
```

Esperado: 0 erros.

---

## Task 10 — Verificação final

- [ ] **TypeScript limpo**

```
npx tsc --noEmit
```

Esperado: 0 erros.

- [ ] **Smoke test manual**

1. `npm run dev` → abrir em http://localhost:5173
2. Ir para `/anotacoes` → empty state aparece
3. Tocar "+" → bottom sheet abre com campos título + conteúdo + toggle lembrete
4. Preencher título "Teste", ativar lembrete, definir hora ~1 minuto no futuro → Salvar
5. Card aparece na lista com ícone 🔔
6. Ir para home → sino sem badge ainda (lembrete não disparou)
7. Aguardar 1 minuto → notificação do browser aparece (se permissão foi concedida)
8. Sino mostra badge "1"
9. Tocar sino → bottom sheet mostra "Teste" com horário
10. Tocar "Visto ✓" → item some, sheet fecha, badge desaparece
11. Abrir anotação "Teste" → editar título, remover lembrete → Salvar → ícone 🔔 some do card
12. Editar anotação → tocar "Excluir anotação" → confirmar → anotação excluída, toast aparece
13. Reload → tudo persistido (localStorage)
