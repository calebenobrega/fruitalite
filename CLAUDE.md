# FruitaLite — Contexto para Claude Code

> Este arquivo é lido automaticamente pelo Claude Code. Mantém o contexto do projeto sempre disponível em qualquer sessão.

## Identidade

**FruitaLite** é a versão simplificada do projeto Fruita. Aplicativo **web mobile-only** para gestão de listas de compras hortifrúti — usuário único, sem backend, com fluxo em 3 fases (planejamento, comprando, concluída).

- **Tipo:** projeto pessoal + TCC (orientadora ciente)
- **Repo:** github.com/calebenobrega/fruitalite — branch ativa: `master`
- **Plataforma de desenvolvimento:** web mobile-only — React + Vite, viewport alvo 375px–430px, sem layout desktop. Em telas maiores o app aparece travado num container de até 480px centralizado.
- **Plataforma de distribuição:** **PWA instalável** — Android via Chrome ("Adicionar à tela inicial") e iOS 15+ via Safari ("Adicionar à Tela de Início"). Sem Play Store, sem App Store, sem APK.
- **Persistência:** localStorage (sem backend, sem sync)
- **Usuário:** um por dispositivo, sem login real (só nome + tag de loja salvos local)

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Estilo:** CSS Modules + variáveis CSS (tokens em `src/styles/tokens.css`)
- **Estado global:** Zustand 5 (4 stores persistidas + 1 efêmera)
- **Persistência:** localStorage com wrapper tipado (`src/utils/storage.ts`)
- **Ícones:** Lucide React
- **Fontes:** Manrope + Inter (Google Fonts, cacheadas via Workbox)
- **Router:** React Router v6
- **Datas:** date-fns
- **PDF:** jsPDF + Web Share API (`src/utils/pdf.ts`)
- **PWA:** vite-plugin-pwa + Workbox (service worker gerado automaticamente no build)

> Sem backend. Sem ORM. Sem API. Tudo client-side.

## Deploy

- **Hosting:** Vercel free tier
- **Deploy:** automático — cada `git push master` dispara build e deploy
- **URL atual:** subdomínio Vercel (`.vercel.app`)
- **Domínio futuro:** `app.fruita.com` (quando `fruita.com` for adquirido — atualizar `start_url` no manifest)
- **Build local:** `npm run build` → `dist/` (inclui `sw.js` + `workbox-*.js`)
- **Preview local:** `npx vite preview --port 4173` (SW só ativa no preview/prod, não em `npm run dev`)

## Decisões de marca (PWA)

- **name / short_name:** `"Fruita"` (exibido abaixo do ícone na Home Screen)
- **theme_color:** `#2D4F3A` (verde primário — colore a status bar no Chrome antes da instalação)
- **background_color:** `#2D4F3A` (splash enquanto o React carrega no iOS)
- **Ícone fonte:** `public/brand/05_icone_app_quadrado.svg` → PNGs gerados em `public/brand/`
- **Tipografia:** Manrope (display/body) + Inter (dados numéricos)

## Estrutura de pastas

```
fruitalite/
├── public/
│   ├── brand/                       # SVGs + PNGs gerados (ícones PWA, favicon)
│   │   ├── *.svg                    # logos e símbolos da marca
│   │   ├── pwa-64x64.png
│   │   ├── pwa-192x192.png          # Android Chrome install prompt
│   │   ├── pwa-512x512.png
│   │   ├── maskable-icon-512x512.png
│   │   ├── apple-touch-icon-180x180.png  # iOS Home Screen
│   │   └── favicon.ico
│   └── manifest.webmanifest         # PWA manifest
├── src/
│   ├── app/
│   │   ├── App.tsx                  # raiz + router
│   │   ├── Layout.tsx               # shell com bottom nav
│   │   └── routes.tsx
│   ├── components/                  # design system (Button, Card, Input, Chip, etc)
│   ├── features/
│   │   ├── onboarding/              # tela 0
│   │   ├── home/                    # tela 1
│   │   ├── catalogo/                # gestão do catálogo de produtos
│   │   │   ├── CatalogoPage.tsx
│   │   │   └── ProdutoEditSheet.tsx
│   │   ├── listas/                  # telas 3-7
│   │   │   └── pages/
│   │   │       ├── SelecionarProdutos.tsx
│   │   │       ├── ListaPlanejamento.tsx
│   │   │       ├── ListaComprando.tsx
│   │   │       ├── ListaConcluida.tsx
│   │   │       ├── ListaDetalhe.tsx
│   │   │       └── ListasPage.tsx
│   │   ├── anotacoes/               # tela 2
│   │   │   └── hooks/useLembretes.ts  # polling de lembretes via setInterval
│   │   └── configuracoes/           # backup JSON + logout
│   ├── hooks/
│   │   └── useLongPress.ts
│   ├── stores/
│   │   ├── usuarioStore.ts          # → 'fruitalite:usuario'
│   │   ├── listasStore.ts           # → 'fruitalite:listas'
│   │   ├── catalogoStore.ts         # → 'fruitalite:catalogo'
│   │   ├── anotacoesStore.ts        # → 'fruitalite:anotacoes'
│   │   └── toastStore.ts            # efêmero, sem persistência
│   ├── data/
│   │   └── catalogo.ts              # ~80+ produtos seed
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── moeda.ts                 # formatação BRL, conversão centavos
│   │   ├── data.ts                  # formatação datas, saudação dinâmica
│   │   ├── peso.ts                  # conversão gramas/kg
│   │   ├── pdf.ts                   # jsPDF + Web Share API
│   │   ├── backup.ts                # export/import JSON
│   │   └── storage.ts               # wrapper tipado de localStorage
│   ├── styles/
│   │   ├── tokens.css               # variáveis CSS (cores, tipografia, etc)
│   │   └── globals.css
│   └── main.tsx
├── index.html
├── vercel.json                      # SPA rewrites + headers de cache para SW
├── package.json
├── tsconfig.json
├── vite.config.ts                   # aliases + vite-plugin-pwa configurado
├── CLAUDE.md
├── CONTEXTO.md
└── DESIGN.md
```

## Onde encontrar o quê

| Preciso de... | Vá para |
|---|---|
| Visão geral do projeto, fluxos, escopo | `CONTEXTO.md` |
| Cores, tipografia, componentes visuais | `DESIGN.md` |
| Catálogo base de produtos | `src/data/catalogo.ts` |
| Catálogo customizado pelo usuário | `src/stores/catalogoStore.ts` |
| Tipos compartilhados | `src/types/index.ts` |
| Estado global | `src/stores/` |
| Backup/restore de dados | `src/utils/backup.ts` |
| Geração e compartilhamento de PDF | `src/utils/pdf.ts` |
| Configuração do service worker | `vite.config.ts` (VitePWA) |
| Manifest PWA | `public/manifest.webmanifest` |
| Roteamento e headers Vercel | `vercel.json` |

## Convenções de código

- **Idioma:** PT-BR para domínio (`lista`, `produto`, `adicionarItem`, `calcularTotal`). Inglês para infra (`useState`, `Router`, `Component`).
- **Comentários:** PT-BR sempre que se referem a regra de negócio. Inglês ok pra comentário técnico de framework.
- **Strings de UI:** PT-BR sempre.
- **Organização:** por feature, não por tipo. Cada feature tem suas pages, components e hooks juntos.
- **Componentes:** functional components com hooks. Sem classes.
- **Tipagem:** strict mode no tsconfig. Nunca `any`. Use `unknown` e estreite.
- **Formatação:** Prettier + ESLint com config padrão react+typescript.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`). Commits diretos na `master`.
- **Branches:** `master` estável. Mudanças grandes em `feature/<nome-curto>` se necessário.
- **Tags:** semver para releases (`lite-v1.0.0`, `lite-v2.0.0`). Tags de segurança antes de mudanças irreversíveis (`pre-X-migration`).

## Regras invioláveis ao gerar código

1. **Cores via tokens, sempre.** Use `var(--primary)`, nunca hex direto em componente. Os tokens estão em `src/styles/tokens.css` (ver `DESIGN.md`).
2. **Números com tabular-nums.** Qualquer valor exibido (R$, quantidade, peso) usa `font-variant-numeric: tabular-nums` (Inter já suporta).
3. **Moeda em centavos.** Armazenar como `number` inteiro representando centavos. Nunca usar float. Converter pra exibição apenas no momento da renderização com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
4. **Peso em gramas.** Armazenar como inteiro. Converter pra kg só na UI.
5. **Validar transição de fase.** RN1-RN4 (ver `CONTEXTO.md`):
   - `planejamento → comprando`: precisa ter ≥1 produto com quantidade
   - `comprando → concluida`: todos produtos precisam ter valor unitário
   - `concluida` é read-only (não edita, só visualiza ou exclui)
6. **Touch targets ≥ 44px.** Botões, ícones clicáveis, links — tudo respeita o mínimo.
7. **Mobile-only.** Layout pensado para 375px–430px de viewport. Não criar breakpoints `@media (min-width: ...)`. O shell em `globals.css` trava a app num container `max-width: 480px` centralizado pra quando o usuário acessar do desktop, mas o design assume sempre celular.
8. **Saudação dinâmica.** Sempre que mostrar saudação, usar função utilitária que retorna "Bom dia / Boa tarde / Boa noite" baseado em `new Date().getHours()`.
9. **localStorage com wrapper tipado.** Nunca acessar `localStorage` direto em componente. Usar funções em `src/utils/storage.ts`.
10. **Não inventar funcionalidades fora do escopo.** Antes de adicionar algo, conferir `CONTEXTO.md` seção "Fora do escopo". Se em dúvida, perguntar.
11. **Não recriar Capacitor.** Nunca criar `android/`, `ios/`, `capacitor.config.*` ou instalar `@capacitor/*`. O app é PWA — qualquer feature mobile vai por API web padrão.
12. **Antes de instalar dependência nova, justificar.** Este projeto tem escopo enxuto. Dependências novas devem ser discutidas antes de `npm install`.
13. **Antes de mudança irreversível, criar tag de retorno.** Ex: `git tag pre-X-migration && git push --tags` antes de remover/migrar algo grande.

## Modelo de dados (referência rápida)

```ts
type Fase = 'planejamento' | 'comprando' | 'concluida';
type Unidade = 'caixas' | 'unidades' | 'kg';
type Categoria = 'frutas' | 'verduras' | 'legumes' | 'raizes';

type Usuario = {
  nome: string;
  tagLoja: string;
  criadoEm: string; // ISO 8601
};

type Produto = {
  id: string;
  nome: string;
  emoji: string;
  categoria: Categoria;
  pesoPorCaixaGramas?: number;
};

type ItemLista = {
  produtoId: string;
  quantidade: number;
  unidade: Unidade;
  valorUnitarioCentavos: number | null;
  pesoPorCaixaGramas?: number;
};

type Lista = {
  id: string;
  nome: string;
  fase: Fase;
  itens: ItemLista[];
  criadaEm: string;
  finalizadaEm: string | null;
};

type Lembrete = {
  dataHora: string;   // ISO 8601
  disparado: boolean;
  visto: boolean;
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

> Sempre que mudar o modelo, atualizar `src/types/index.ts` + este bloco + considerar migração de dados em localStorage.

## Funcionalidades core (resumo do escopo)

- F1. Onboarding (nome + tag)
- F2. Saudação dinâmica na home
- F3. Criar lista a partir do catálogo
- F4. Selecionar múltiplos produtos com busca + filtros por categoria
- F5. Definir quantidade + unidade por produto (inline em ListaPlanejamento)
- F6. Fluxo de fases (planejamento → comprando → concluída)
- F7. Adicionar valor unitário na fase de compra, com cálculo automático
- F8. Barra de progresso da lista
- F9. Finalizar lista
- F10. Histórico de listas concluídas
- F11. Anotações simples (CRUD + lembretes por horário)
- F12. Compartilhar PDF da lista concluída via Web Share API (iOS 15+ e Android Chrome) com fallback `doc.save()`
- F13. Gestão do catálogo — CRUD de produtos (CatalogoPage + catalogoStore)
- F14. Resumo/Estatísticas na Home — total gasto, ticket médio, produto mais comprado
- F15. Backup/export JSON + import/restore (ConfiguracoesPage)
- F16. Long-press em listas para excluir (HomePage + ListasPage)

## Fora do escopo (não implementar sem pedido explícito)

- Backend / API / sincronização entre devices
- Login com senha, multi-usuário
- Divisão entre lojas
- Push notifications reais (lembretes só disparam com app aberto — comportamento atual e aceitável)
- Modo escuro
- IA / sugestões automáticas
- Multi-tag por usuário
- Play Store / App Store (decisão consciente)
- Capacitor / APK / Android Studio build

Se aparecer pedido nessa direção, **sinalizar que está fora do escopo antes de implementar**.

## O que NÃO fazer neste repo

- **Não recriar Capacitor** — não instalar `@capacitor/*`, não criar `android/`, `ios/`, `capacitor.config.*`
- **Não adicionar backend, login ou analytics** — app é 100% client-side por design
- **Não adicionar features de ERP, PDV, multi-usuário ou marketplace** — essas vivem no projeto Fruita comercial (repo separado, futuro)
- **Não publicar na Play Store nem App Store** — PWA direto é a estratégia escolhida
- **Não migrar dados do APK automaticamente** — re-cadastro é aceitável para a base mínima de usuários
- **Não criar features sem conferir o escopo** — perguntar antes se houver dúvida

## Tarefas comuns e onde olhar primeiro

- **Criar componente de UI** → `DESIGN.md` para spec visual + `src/components/` para padrão
- **Adicionar tela nova** → criar pasta em `src/features/<nome>/pages/` + adicionar rota em `src/app/routes.tsx`
- **Mudar estado** → store correspondente em `src/stores/`
- **Adicionar produto** → editar `src/data/catalogo.ts`
- **Formatar moeda/data/peso** → usar utils em `src/utils/`
- **Mudar manifest ou ícones** → `public/manifest.webmanifest` + `public/brand/`
- **Mudar comportamento do service worker** → `vite.config.ts` (VitePWA > workbox)

## Como rodar localmente

```bash
npm install
npm run dev           # dev server em http://localhost:5173 (SW não ativa aqui)

npm run build         # build de produção → dist/
npx vite preview --port 4173  # preview com SW ativo em http://localhost:4173

npm run type-check    # TypeScript sem emitir arquivos
npm run lint          # ESLint (máx 0 warnings)
```

## Frentes previstas

**Curto prazo (neste repo):**
- Polimento: bugs pós-migração PWA, microcopy, UX miúda, estados vazios, acessibilidade básica
- README público no GitHub com instruções de instalação PWA

**Médio prazo (neste repo):**
- Eventual extração de design tokens para pacote `@fruita/design-tokens`

**Fora deste repo (projetos futuros separados):**
- Site institucional Fruita
- Fruita comercial (B2B/SaaS, marketplace fornecedor↔varejo) — repo separado
- Eventual convergência Lite + comercial sob marca única "FRUITA"

## Sobre os projetos Fruita

| Projeto | Status | Descrição |
|---|---|---|
| **FruitaLite** | ✅ Ativo (este repo) | PWA pessoal, client-side, gratuito |
| **Fruita original** | 📦 Arquivado (referência) | TCC acadêmico, multi-usuário, backend |
| **Fruita comercial** | 🔮 Futuro (repo separado) | B2B/SaaS, marketplace, não confundir |

Quando reaproveitar algo do original: apenas a **identidade visual** (logo SVG) e o **design system** (cores, tipografia). Tudo o mais é redesenhado pro contexto enxuto.

## Histórico

| Data | Marco | Tag git |
|---|---|---|
| 2026-05-15 | v1.0 lançada — APK Capacitor Android | `lite-v1.0.0` |
| 2026-05-25 | Pré-migração PWA (ponto de retorno) | `pre-pwa-migration` |
| 2026-05-25 | Migração APK → PWA concluída, deploy Vercel | _(master atual)_ |

Para voltar ao estado do APK: `git checkout lite-v1.0.0`
Para inspecionar o estado pré-migração: `git checkout pre-pwa-migration`

---

*Última atualização: 2026-05-25 — migração APK → PWA concluída.*
