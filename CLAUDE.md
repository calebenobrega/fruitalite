# FruitaLite — Contexto para Claude Code

> Este arquivo é lido automaticamente pelo Claude Code. Mantém o contexto do projeto sempre disponível em qualquer sessão.

## Identidade

**FruitaLite** é a versão simplificada do projeto Fruita. Aplicativo **web mobile-only** para gestão de listas de compras hortifrúti — usuário único, sem backend, com fluxo em 3 fases (planejamento, comprando, concluída).

- **Tipo:** projeto pessoal (não-acadêmico)
- **Plataforma de desenvolvimento:** **web mobile-only** — React + Vite, viewport alvo 375px–430px, sem layout desktop. Em telas maiores o app aparece travado num container de até 480px centralizado.
- **Plataforma de distribuição final:** **app Android nativo via Capacitor** (`.apk` instalável). Não é PWA, não é "site". O Capacitor envelopa o build do Vite numa WebView nativa em uma sprint dedicada no fim do projeto. iOS fica fora da v1 (precisa de Mac).
- **Persistência:** localStorage (v1) — funciona dentro da WebView do Capacitor sem ajuste extra
- **Usuário:** um por dispositivo, sem login real (só nome + tag de loja salvos local)

## Stack

- **Frontend:** React + Vite + TypeScript
- **Estilo:** CSS Modules ou Tailwind com tokens customizados (decisão do dev — sugestão: CSS Modules + variáveis CSS para começar enxuto)
- **Estado global:** Zustand (simples, leve, perfeito pro escopo)
- **Persistência:** localStorage com wrapper tipado
- **Ícones:** Lucide React
- **Fontes:** Manrope + Inter (Google Fonts)
- **Router:** React Router v6
- **Datas:** date-fns
- **PDF (se entrar):** jsPDF

> Sem backend. Sem ORM. Sem API. Tudo client-side.

## Estrutura de pastas

```
fruitalite/
├── public/
│   └── brand/              # SVGs da logo (copiar do Fruita antigo)
├── src/
│   ├── app/
│   │   ├── App.tsx         # raiz + router
│   │   ├── Layout.tsx      # shell com bottom nav
│   │   └── routes.tsx
│   ├── components/         # design system (Button, Card, Input, Chip, etc)
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Chip/
│   │   ├── BottomNav/
│   │   └── ...
│   ├── features/
│   │   ├── onboarding/     # tela 0
│   │   ├── home/           # tela 1
│   │   ├── catalogo/       # gestão do catálogo de produtos
│   │   │   ├── CatalogoPage.tsx
│   │   │   └── ProdutoEditSheet.tsx
│   │   ├── listas/         # telas 3-7
│   │   │   ├── pages/
│   │   │   │   ├── SelecionarProdutos.tsx
│   │   │   │   ├── ListaPlanejamento.tsx
│   │   │   │   ├── ListaComprando.tsx
│   │   │   │   └── ListaConcluida.tsx
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   └── anotacoes/      # tela 2
│   ├── stores/
│   │   ├── usuarioStore.ts
│   │   ├── listasStore.ts
│   │   ├── catalogoStore.ts
│   │   ├── anotacoesStore.ts
│   │   └── toastStore.ts
│   ├── data/
│   │   └── catalogo.ts     # catálogo fixo de produtos
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── moeda.ts        # formatação BRL, conversão centavos
│   │   ├── data.ts         # formatação datas, saudação dinâmica
│   │   └── peso.ts         # conversão gramas/kg
│   ├── styles/
│   │   ├── tokens.css      # variáveis CSS (cores, tipografia, etc)
│   │   └── globals.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
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

## Convenções de código

- **Idioma:** PT-BR para domínio (`lista`, `produto`, `adicionarItem`, `calcularTotal`, `Comprador`). Inglês para infra (`useState`, `Router`, `Component`).
- **Comentários:** PT-BR sempre que se referem a regra de negócio. Inglês ok pra comentário técnico de framework.
- **Strings de UI:** PT-BR sempre.
- **Organização:** por feature, não por tipo. Cada feature tem suas pages, components e hooks juntos.
- **Componentes:** functional components com hooks. Sem classes.
- **Tipagem:** strict mode no tsconfig. Nunca `any`. Use `unknown` e estreite.
- **Formatação:** Prettier + ESLint com config padrão react+typescript.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`).
- **Branches:** `main` estável. Mudanças grandes em `feature/<nome-curto>`.

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
9. **localStorage com wrapper tipado.** Nunca acessar `localStorage` direto em componente. Criar funções tipadas (ex: `salvarLista(lista: Lista)`, `carregarListas(): Lista[]`).
10. **Não inventar funcionalidades fora do escopo.** Antes de adicionar algo, conferir `CONTEXTO.md` seção "Fora do escopo". Se em dúvida, perguntar.

## Modelo de dados (referência rápida)

```ts
type Fase = 'planejamento' | 'comprando' | 'concluida';
type Unidade = 'caixas' | 'unidades' | 'kg';
type Categoria = 'frutas' | 'verduras' | 'legumes';

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
};

type ItemLista = {
  produtoId: string;
  quantidade: number;
  unidade: Unidade;
  valorUnitarioCentavos: number | null;
};

type Lista = {
  id: string;
  nome: string;
  fase: Fase;
  itens: ItemLista[];
  criadaEm: string;
  finalizadaEm: string | null;
};

type Anotacao = {
  id: string;
  titulo: string;
  conteudo: string;
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
- F11. Anotações simples (CRUD)
- F12. Compartilhar PDF da lista concluída via Share API nativa (Capacitor)
- F13. Gestão do catálogo — CRUD de produtos (CatalogoPage + catalogoStore)
- F14. Resumo/Estatísticas na Home — total gasto, ticket médio, produto mais comprado
- F15. Backup/export JSON + import/restore (ConfiguracoesPage)
- F16. Long-press em listas para excluir (HomePage + ListasPage)

## Fora do escopo (não implementar sem pedido explícito)

- Backend / API
- Login com senha, multi-usuário, sync entre devices
- Divisão entre lojas
- Push notifications / lembretes no sistema operacional
- PWA (o app é Capacitor/Android, não PWA)
- IA / sugestões automáticas
- Multi-tag por usuário
- Modo escuro

Se aparecer pedido nessa direção, **sinalizar que está fora do escopo antes de implementar**.

## Tarefas comuns e onde olhar primeiro

- **Criar componente de UI** → `DESIGN.md` para spec visual + `src/components/` para padrão
- **Adicionar tela nova** → criar pasta em `src/features/<nome>/pages/` + adicionar rota em `src/app/routes.tsx`
- **Mudar estado** → store correspondente em `src/stores/`
- **Adicionar produto** → editar `src/data/catalogo.ts`
- **Formatar moeda/data/peso** → usar utils em `src/utils/`

## Como rodar localmente

```bash
npm install
npm run dev
# abre em http://localhost:5173
```

> Setup será criado quando você rodar o `npm create vite@latest fruitalite -- --template react-ts`

## Sobre o projeto pai (Fruita original)

Este projeto é a versão lite do Fruita original (projeto acadêmico). Não confundir os dois:

- O Fruita original tinha multi-usuário, backend, divisão entre lojas, PDF, etc.
- O FruitaLite é solo, client-side, sem divisão, foco no fluxo de 3 fases.

Quando reaproveitar algo do original: apenas a **identidade visual** (logo SVG) e o **design system** (cores, tipografia, padrões de componente). Tudo o mais é redesenhado pro contexto enxuto.

---

*Última atualização: 2026-05-15 — v1.0 lançado.*
