# FruitaLite — Design System

> Sistema visual do FruitaLite. Referência única para qualquer decisão de UI: cores, tipografia, espaçamento, componentes.
> Versão 1.0 · Apenas modo claro nesta versão.

## Filosofia

**Minimalismo editorial aplicado a uma ferramenta de uso diário.** A interface precisa funcionar bem em qualquer cenário: na cama planejando a compra, na CEASA com luz solar direta, no caixa do mercado conferindo valores. Cada elemento é intencional.

Princípios:
1. **Whitespace > linhas.** Hierarquia se constrói com espaçamento, não com bordas pesadas.
2. **Tipografia carrega o peso.** Manrope para títulos, Inter para dados.
3. **Verde com propósito.** Cor da marca aparece em ações primárias, status, totais. Não como decoração.
4. **Otimizado pra mobile.** Touch targets generosos, tipografia legível, alto contraste.

## Tokens — Cores

> Todos definidos como CSS variables em `src/styles/tokens.css`. Nunca usar hex direto em componente.

```css
:root {
  /* Superfícies e fundos */
  --background: #F4F2EA;          /* fundo principal (creme natural) */
  --surface: #FFFFFF;              /* cards, modais, áreas elevadas */
  --surface-elevated: #FFFFFF;     /* dropdowns, pop-overs */
  --surface-sunken: #EFEDE5;       /* inputs, áreas rebaixadas */

  /* Primário (cor da marca) */
  --primary: #2D4F3A;              /* verde da logo, ações primárias */
  --primary-hover: #234032;        /* hover */
  --primary-pressed: #1A2F25;      /* pressionado */
  --primary-soft: #E8EFEA;         /* fundo de chips, badges, highlights */
  --on-primary: #FFFFFF;           /* texto sobre primário */

  /* Textos */
  --text: #191C1A;                 /* texto principal */
  --text-muted: #5A5A5A;           /* texto secundário, labels */
  --text-disabled: #A8A8A8;        /* desabilitado */

  /* Bordas */
  --border: #E1E3DF;               /* bordas padrão */
  --border-strong: #BFC9C1;        /* bordas em foco/hover */

  /* Semânticos */
  --success: #4A7C59;              /* sucesso, finalizada */
  --success-soft: #DEEBE2;
  --warning: #C4923D;              /* em compra, atenção */
  --warning-soft: #F5E9D2;
  --error: #A6443A;                /* erros, destrutivos */
  --error-soft: #F4DDD9;
  --info: #3A5A6E;                 /* info neutra */
  --info-soft: #DDE5EB;
}
```

## Tokens — Tipografia

```css
:root {
  /* Famílias */
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-data: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Escala tipográfica

| Token | Família | Tamanho | Peso | Line-height | Letter-spacing | Uso |
|---|---|---|---|---|---|---|
| `display` | Manrope | 32px | 700 | 1.1 | -0.03em | Hero, splash |
| `h1` | Manrope | 24px | 700 | 1.2 | -0.02em | Títulos de tela |
| `h2` | Manrope | 20px | 600 | 1.3 | -0.02em | Seções dentro da tela |
| `h3` | Manrope | 18px | 600 | 1.4 | -0.01em | Subseções, títulos de card |
| `body-lg` | Manrope | 16px | 400 | 1.6 | 0 | Texto principal |
| `body` | Manrope | 15px | 400 | 1.6 | 0 | Texto padrão (mínimo legível) |
| `data` | Inter | 14px | 500 | 1.4 | 0 | Valores em listas |
| `data-lg` | Inter | 20px | 600 | 1.2 | 0 | Totais, destaques numéricos |
| `data-xl` | Inter | 24px | 700 | 1.2 | 0 | Valor total da compra |
| `label` | Inter | 12px | 600 | 1.0 | 0.05em | Labels acima de inputs (uppercase) |
| `caption` | Inter | 12px | 400 | 1.4 | 0 | Texto auxiliar, timestamps |

### Regras tipográficas

1. **Todo número com `font-variant-numeric: tabular-nums`.** Inter já suporta — basta aplicar no CSS.
2. **Mínimo 15px para body.** Legibilidade em qualquer contexto.
3. **Sentence case sempre.** Nunca Title Case nem ALL CAPS, exceto labels com `label`.
4. **Tracking negativo só em títulos grandes** (24px+).

## Tokens — Espaçamento

Escala única em múltiplos de 8px (exceto `--space-base` de ajuste fino).

```css
:root {
  --space-base: 4px;     /* ajustes finos */
  --space-xs: 8px;       /* padding apertado, gap entre tags */
  --space-sm: 16px;      /* gap padrão entre elementos */
  --space-md: 24px;      /* padding interno de cards */
  --space-lg: 32px;      /* entre blocos */
  --space-xl: 48px;      /* margens grandes */
  --space-2xl: 64px;     /* margens de página, vazio */
}
```

Margens de viewport: **20px** em todo o app (mobile-only, viewport 375–430px).

Touch targets: **mínimo 44px, separados por ≥16px**.

## Tokens — Forma e bordas

```css
:root {
  --radius-sm: 4px;        /* tags pequenos */
  --radius: 8px;           /* inputs, botões secundários */
  --radius-md: 12px;       /* cards, modais */
  --radius-lg: 16px;       /* containers grandes, bottom sheets */
  --radius-full: 9999px;   /* botões primários (pill), avatars */

  --border-width: 1px;
  --border-width-sm: 0.5px;
  --border-width-lg: 2px;
}
```

**Botões primários são pill-shaped (radius-full).** É o sinal visual de "ação principal".

## Tokens — Sombras

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 4px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
  --shadow-focus: 0 0 0 3px rgba(45,79,58,0.20);
}
```

## Tokens — Animação

```css
:root {
  --duration-fast: 100ms;
  --duration: 200ms;
  --duration-slow: 400ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
}
```

Respeitar `prefers-reduced-motion: reduce` zerando todas as durações.

## Iconografia

- **Biblioteca:** Lucide React (`lucide-react`)
- **Estilo:** stroke 2px, line style, monocromáticos
- **Cor:** sempre via token (`color: var(--text)` ou `var(--text-muted)`)
- **Tamanhos:** 16px (inline), 20px (padrão), 24px (botões/headers), 32px (vazios)
- **Sem emojis na UI estrutural.** Emojis só nos produtos do catálogo (🍎 🥕 🥬).

## Componentes do design system

### Botão

#### Variantes

**Primário** — ação principal. Pill-shaped.
- Fundo: `--primary`, texto: `--on-primary`
- Border-radius: `--radius-full`
- Padding: 14px vertical, 24px horizontal (md)
- Altura: 44px (md), 52px (lg)
- Hover: fundo `--primary-hover`
- Pressed: fundo `--primary-pressed`, transform: scale(0.98)
- Disabled: `--border` de fundo, `--text-disabled` no texto

**Secundário** — coexiste com o primário.
- Fundo: `--primary-soft`, texto: `--primary`
- Border-radius: `--radius`
- Demais propriedades iguais ao primário

**Terciário (texto)** — menor peso.
- Fundo: transparente, texto: `--primary`
- Sublinhado no hover

**Destrutivo** — ações irreversíveis.
- Fundo: `--error`, texto: `#FFFFFF`
- Mesma forma do primário

**Ícone** — ação compacta sem texto.
- 44x44px, fundo transparente
- Hover: `--surface-sunken`
- Border-radius: `--radius-full`
- Ícone 20px centralizado

#### Tamanhos

| Tamanho | Altura | Padding-x | Tipografia |
|---|---|---|---|
| `sm` | 36px | 16px | `body` |
| `md` (padrão) | 44px | 24px | `body` |
| `lg` | 52px | 32px | `body-lg` |

### Input

```
[ LABEL ACIMA DO CAMPO ]
[ ┌──────────────────┐ ]
[ │ valor digitado   │ ]
[ └──────────────────┘ ]
[ texto auxiliar       ]
```

- Altura: 44px mínimo
- Padding: 12px vertical, 16px horizontal
- Border: `1px solid var(--border)`
- Border-radius: `--radius` (8px)
- Fundo: `--surface-sunken`
- Texto: `body`, cor `--text`
- Placeholder: cor `--text-disabled`

#### Estados
| Estado | Visual |
|---|---|
| Default | Border `--border` |
| Hover | Border `--border-strong` |
| Focus | Border `--primary` + `--shadow-focus` |
| Error | Border `--error`, helper text em `--error` |
| Disabled | `opacity: 0.4` |

#### Label
- Acima do campo, gap 8px
- Tipografia `label` (uppercase, letter-spacing)
- Cor `--text-muted`
- Sufixo "(opcional)" para campos não obrigatórios. Sem asterisco para obrigatórios.

#### Variantes especiais

**Numérico** (quantidade, valor):
- `font-variant-numeric: tabular-nums`
- Alinhamento à direita
- Sufixo de unidade dentro do campo (`R$` à esquerda, `kg` à direita)

**Busca:**
- Ícone lupa à esquerda (16px, `--text-muted`)
- Botão limpar (X) à direita quando preenchido

### Card

- Fundo: `--surface`
- Border: `0.5px solid var(--border)`
- Border-radius: `--radius-md` (12px)
- Padding: 16px
- Sombra: `--shadow-sm` se interativo

#### Variantes
- **Estático** — sem sombra, sem hover. Apenas exibe.
- **Interativo** — sombra padrão, cursor pointer, hover muda fundo para `--surface-sunken`
- **Selecionável** — border `--primary` quando selecionado, ícone check no canto superior direito

### Chip / Tag

- Border-radius: `--radius-full` (pill)
- Padding: 4px 12px (sm), 6px 14px (md)
- Tipografia: `caption` peso 500 ou 600
- Altura: ~24px (sm), ~28px (md)

#### Variantes por uso

| Uso | Fundo | Texto |
|---|---|---|
| Status: planejamento | `--primary-soft` | `--primary` |
| Status: comprando | `--warning-soft` | `--warning` |
| Status: concluída | `--success-soft` | `--success` |
| Status: pendente | `--surface-sunken` | `--text-muted` |
| Informativo | `--info-soft` | `--info` |

### Badge de fase (variação do chip)

Específico pra exibir a fase de uma lista. Inclui emoji + texto.
- `📋 Planejamento` — fundo `--primary-soft`, texto `--primary`
- `🛒 Comprando` — fundo `--warning-soft`, texto `--warning`
- `✓ Concluída` — fundo `--success-soft`, texto `--success`

### Bottom Navigation

- Altura: 64px + safe area (env(safe-area-inset-bottom))
- Fundo: `--surface`
- Border top: `0.5px solid var(--border)`
- Posição: fixed bottom, full width

#### Itens (3)
1. **Anotações** (esquerda) — ícone `clipboard-list` ou `notebook-pen` (Lucide)
2. **Início** (centro) — ícone `home`
3. **Listas** (direita) — ícone `shopping-bag` ou `list-checks`

#### Estados
- **Inativo:** ícone + label cor `--text-muted`
- **Ativo:** ícone + label cor `--primary`, peso 600, com barra horizontal indicadora acima (4px altura, 32px largura, `--primary`, border-radius full)

### Barra de progresso

- Altura: 8px (padrão), 4px (compacto)
- Border-radius: `--radius-full`
- Background: `--surface-sunken`
- Preenchimento: `--primary` (proporcional)
- Animação: width transition 300ms

### Bottom sheet

> Mobile-only. Não existe variante "modal centralizado" neste app — toda interação modal acontece via bottom sheet ancorado embaixo.

- Fundo: `--surface`
- Border-radius: `--radius-lg` apenas no topo (cantos superiores arredondados)
- Largura: 100% viewport
- Max-height: 90vh, com scroll interno se passar
- Drag handle no topo (24px wide × 4px tall, `--border-strong`, centralizado, margem superior de 8px)
- Overlay: `rgba(0,0,0,0.4)` cobrindo o resto da tela; toque no overlay fecha
- Padding interno: 20px lateral e top, 24px na base (alinhado às margens do app)

#### Estrutura
1. **Header:** título (h2/h3) + botão fechar (ícone X 44×44) à direita
2. **Body:** conteúdo, scrollável se necessário
3. **Footer:** ações em coluna, botão primário em cima full-width, secundário/cancelar abaixo

### Toast (notificação inline)

- Posição: bottom-center, acima do BottomNav (offset de ~80px do fundo pra não sobrepor)
- Largura: calc(100% - 40px) (respeitando margens laterais de 20px), max-width 440px
- Padding: 16px 20px
- Border-radius: `--radius-md`
- Sombra: `--shadow-lg`
- Duração: 4s (info/success), 6s (warning), persistente (error — só fecha quando o usuário toca)

| Tipo | Fundo | Texto | Ícone |
|---|---|---|---|
| Success | `--success-soft` | `--success` | check-circle |
| Warning | `--warning-soft` | `--warning` | alert-triangle |
| Error | `--error-soft` | `--error` | x-circle |
| Info | `--info-soft` | `--info` | info |

### Empty state

Quando não há dados (lista vazia, sem anotações, busca sem resultado).

- Ícone 48px, cor `--text-muted`
- Título h3, cor `--text`
- Texto explicativo `body`, cor `--text-muted`
- Botão primário ou secundário com ação principal
- Espaçamento vertical 16px entre elementos
- Padding total: 64px vertical mínimo
- Centralizado

Exemplo:
> 🗒️
> **Nenhuma lista por aqui**
> Crie a primeira lista para começar a registrar suas compras.
> [+ Nova lista]

### Item de lista de produto

Estrutura comum em várias telas — produtos da lista, catálogo, etc.

Padrão:
```
[Emoji] Nome do produto              [info à direita]
        subtexto opcional
```

- Padding: 16px
- Background: `--surface`
- Border: `0.5px solid var(--border)`
- Border-radius: `--radius-md`
- Gap entre itens: 8-12px

## Acessibilidade

- **Contraste:** mínimo WCAG AA (4.5:1 texto normal, 3:1 texto grande). Verde primário em fundo creme atinge ~9:1 (AAA).
- **Foco visível:** `--shadow-focus` em todo elemento interativo no `:focus-visible`. Nunca remover outline sem alternativa.
- **Touch targets:** mínimo 44x44px, separados por ≥16px.
- **Texto:** mínimo 15px para body, 12px para labels (com letter-spacing).
- **Movimento:** respeitar `prefers-reduced-motion`.
- **Idioma:** `<html lang="pt-BR">` sempre.

## Voz e tom

PT-BR direto, sem jargão. Profissional e próximo, sem informalidade exagerada. Sem emojis na UI (exceto produtos do catálogo). Sem exclamações desnecessárias.

| Contexto | ❌ Evitar | ✅ Preferir |
|---|---|---|
| Confirmação | "Show! Tudo certo!" | "Lista salva." |
| Erro | "Ops, algo deu errado!" | "Preencha o valor antes de continuar." |
| Vazio | "Nada por aqui ainda 😢" | "Nenhuma lista por aqui. Crie a primeira." |
| Botão | "Salvar!" | "Salvar lista" |

Microcopy de botões: verbo + objeto sempre que possível.

## O que NÃO faz parte do sistema

- Gradientes (em UI; em ilustrações pode)
- Sombras coloridas
- Animações elaboradas (>400ms ou com bounce/spring exagerado)
- Glassmorphism, neumorphism, qualquer efeito 3D
- Mais de duas famílias tipográficas
- Mais de uma cor primária
- Emojis na UI estrutural (apenas em produtos do catálogo)
- Modo escuro nesta versão

## Exemplo: estrutura de `tokens.css`

```css
/* src/styles/tokens.css */
:root {
  /* === Cores === */
  --background: #F4F2EA;
  --surface: #FFFFFF;
  --surface-elevated: #FFFFFF;
  --surface-sunken: #EFEDE5;

  --primary: #2D4F3A;
  --primary-hover: #234032;
  --primary-pressed: #1A2F25;
  --primary-soft: #E8EFEA;
  --on-primary: #FFFFFF;

  --text: #191C1A;
  --text-muted: #5A5A5A;
  --text-disabled: #A8A8A8;

  --border: #E1E3DF;
  --border-strong: #BFC9C1;

  --success: #4A7C59;
  --success-soft: #DEEBE2;
  --warning: #C4923D;
  --warning-soft: #F5E9D2;
  --error: #A6443A;
  --error-soft: #F4DDD9;
  --info: #3A5A6E;
  --info-soft: #DDE5EB;

  /* === Tipografia === */
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-data: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* === Espaçamento === */
  --space-base: 4px;
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-2xl: 64px;

  /* === Bordas === */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* === Sombras === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 4px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
  --shadow-focus: 0 0 0 3px rgba(45,79,58,0.20);

  /* === Animação === */
  --duration-fast: 100ms;
  --duration: 200ms;
  --duration-slow: 400ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);

  /* === Z-index === */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}

/* === Globals === */
html {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
  background: var(--background);
}

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

/* Números sempre tabular */
.tabular,
[data-tabular] {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
