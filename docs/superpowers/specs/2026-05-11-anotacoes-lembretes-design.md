# Anotações com Lembretes — Design Spec

**Data:** 2026-05-11
**Sprint:** 6
**Status:** Aprovado

---

## Escopo

CRUD completo de anotações com opção de lembrete por anotação. Ao atingir o horário, o lembrete dispara uma notificação via browser Notification API e aparece no sino da home. O usuário marca como visto e o item some.

Fora do escopo: notificações com app fechado (Sprint 7 via `@capacitor/local-notifications`).

---

## Modelo de dados

```ts
type Lembrete = {
  dataHora: string;   // ISO 8601
  disparado: boolean; // true quando setTimeout disparou
  visto: boolean;     // true quando usuário marcou como visto
};

type Anotacao = {
  id: string;
  titulo: string;
  conteudo: string;
  lembrete: Lembrete | null;
  criadaEm: string;
  atualizadaEm: string;
};
```

Retrocompatível com localStorage existente: campos ausentes tratados como `null`.

---

## Store — `anotacoesStore`

Actions existentes: `criar`, `editar`, `excluir`.

Novos actions:
- `definirLembrete(id, dataHora)` — cria ou substitui lembrete (disparado: false, visto: false)
- `removerLembrete(id)` — zera campo para null
- `marcarDisparado(id)` — seta disparado: true
- `marcarVisto(id)` — seta visto: true

---

## Hook — `useLembretes`

**Localização:** `src/features/anotacoes/hooks/useLembretes.ts`
**Chamado em:** `Layout.tsx` (uma vez, na raiz da árvore autenticada)

**Comportamento ao montar:**
1. Pede permissão de notificação (`Notification.requestPermission()`) se `Notification.permission === 'default'`
2. Varre anotações com `lembrete !== null && !lembrete.disparado`
3. Para cada uma:
   - `ms = dataHora - agora`
   - Se `ms <= 0`: chama `marcarDisparado(id)` sem notificação (perdida com app fechado)
   - Se `ms > 0`: agenda `setTimeout` que ao disparar chama `marcarDisparado(id)` + `new Notification(titulo, { body: conteudo })`
4. Guarda `Map<id, timeoutId>` para limpeza no unmount

**Reatividade:** `useEffect` com dependência em `anotacoes` recria timeouts quando lembretes mudam (novo, editado, removido).

**Limitação:** timeouts morrem se a aba for fechada. Lembretes perdidos aparecem como `disparado: true` no próximo mount (badge no sino sem notificação sonora).

---

## Tela Anotações — `/anotacoes`

**Lista:**
- Card por anotação: título (bold) + preview 1 linha do conteúdo + data relativa de atualização
- Ícone 🔔 no card se `lembrete !== null && !lembrete.visto`
- Empty state quando sem anotações
- FAB "+" fixo no canto inferior direito (acima do bottom nav)

**Bottom sheet de edição (criar e editar):**
- Campo: título (obrigatório)
- Campo: conteúdo (textarea, opcional)
- Toggle "Lembrete" → expande `<input type="datetime-local">` com valor mínimo = agora
- Botão primário "Salvar"
- Botão destrutivo "Excluir" (só no modo edição) com confirmação inline
- Botão "Remover lembrete" (só se já tem lembrete definido)

---

## Sino na home

**Badge:** ponto/número vermelho sobre o `<Bell>` quando `anotacoes.some(a => a.lembrete?.disparado && !a.lembrete?.visto)`

**Bottom sheet de notificações (abre ao tocar o sino):**
- Lista de anotações com `lembrete.disparado && !lembrete.visto`
- Cada item: título da anotação + horário formatado do lembrete
- Botão "Visto ✓" por item → `marcarVisto(id)`, item some
- Se lista vazia: fecha sheet automaticamente
- Empty state se abrir o sino sem nenhum disparado (estado transitório improvável, mas tratado)

---

## Arquivos

| Ação | Arquivo |
|------|---------|
| Atualizar | `src/types/index.ts` |
| Atualizar | `src/stores/anotacoesStore.ts` |
| Atualizar | `src/app/Layout.tsx` |
| Atualizar | `src/features/home/HomePage.tsx` |
| Atualizar | `src/app/routes.tsx` |
| Criar | `src/features/anotacoes/AnotacoesPage.tsx` |
| Criar | `src/features/anotacoes/AnotacoesPage.module.css` |
| Criar | `src/features/anotacoes/hooks/useLembretes.ts` |
