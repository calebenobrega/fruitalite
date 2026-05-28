# FruitaLite

PWA mobile-only para gestão de listas de compras hortifrúti. Usuário único, client-side puro com localStorage, fluxo em 3 fases (planejamento → comprando → concluída).

> Instalável via Chrome (Android) e Safari (iOS 15+). Sem APK, sem app store.

## Como rodar

```bash
npm install
npm run dev          # http://localhost:5173 (SW não ativa em dev)
```

O app é desenhado para viewport de 375–430px. Use as ferramentas de simulação mobile do navegador ou redimensione a janela para ≤480px — em telas maiores ele aparece travado num container centralizado.

Para testar o service worker e o comportamento PWA real:

```bash
npm run build
npx vite preview --port 4173    # http://localhost:4173 (SW ativo)
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | TS check + bundle de produção (gera `dist/` com `sw.js`) |
| `npm run preview` | Servir o build local (SW ativo) |
| `npm run lint` | ESLint sobre `src/` (max 0 warnings) |
| `npm run lint:fix` | ESLint com `--fix` |
| `npm run format` | Prettier formatando `src/` |
| `npm run format:check` | Prettier conferindo sem alterar |
| `npm run type-check` | `tsc --noEmit` |

## Instalar como PWA

- **Android (Chrome):** menu ⋮ → "Adicionar à tela inicial" / "Instalar app"
- **iOS 15+ (Safari):** botão compartilhar → "Adicionar à Tela de Início"

## Deploy

Deploy automático na Vercel a cada `git push master`. Configuração em [`vercel.json`](./vercel.json) (SPA rewrites + headers de cache para o service worker).

## Stack

React 19 · Vite 8 · TypeScript 6 strict · React Router 6 · Zustand 5 (persist) · CSS Modules + variáveis CSS · Lucide React · Manrope + Inter · date-fns 4 · jsPDF · vite-plugin-pwa + Workbox.

Sem backend. Tudo client-side. Persistência em localStorage via middleware persist do Zustand.

## Estrutura de pastas (resumo)

```
src/
├── app/         # entry + router + layout
├── components/  # design system
├── features/    # onboarding, home, listas, anotacoes, catalogo, configuracoes, design-system
├── stores/      # estado global (Zustand)
├── data/        # catálogo seed
├── types/       # tipos compartilhados
├── utils/       # moeda, peso, data, backup, pdf
└── styles/      # tokens.css, globals.css
public/brand/    # logos SVG + ícones PWA (PNGs gerados via @vite-pwa/assets-generator)
```

Detalhada em [`CLAUDE.md`](./CLAUDE.md#estrutura-de-pastas).

## Documentação interna

- [`CLAUDE.md`](./CLAUDE.md) — stack, convenções, regras invioláveis, modelo de dados
- [`CONTEXTO.md`](./CONTEXTO.md) — visão geral, fluxos, escopo, regras de negócio
- [`DESIGN.md`](./DESIGN.md) — design system (tokens CSS, tipografia, componentes)
- [`public/brand/README.md`](./public/brand/README.md) — variantes de logo

## Histórico

| Data | Marco | Tag |
|---|---|---|
| 2026-05-15 | v1.0 — APK Capacitor Android | `lite-v1.0.0` |
| 2026-05-25 | Pré-migração PWA (ponto de retorno) | `pre-pwa-migration` |
| 2026-05-25 | Migração APK → PWA, deploy Vercel | _master atual_ |

Para inspecionar o estado pré-migração: `git checkout pre-pwa-migration`.
