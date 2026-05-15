# FruitaLite — Contexto do Projeto

> Versão lite e simplificada do Fruita. Foco no essencial: lista de compras hortifrúti com fases.
> Última atualização: maio/2026

## Resumo executivo

FruitaLite é um aplicativo mobile simples para gestão de listas de compras hortifrúti. É a versão enxuta do projeto Fruita original — sem multi-usuário, sem divisão entre lojas, sem perfis complexos. Apenas o essencial: criar lista, comprar, finalizar.

- **Tipo:** projeto pessoal / experimento
- **Plataforma de desenvolvimento:** **web mobile-only** (375–430px de viewport). Sem layout desktop; em telas maiores o app aparece travado num container centralizado de até 480px.
- **Plataforma de distribuição final:** **app Android nativo via Capacitor** (`.apk` instalável). Sprints 1-6 desenvolvem como web; Sprint 7 envelopa com Capacitor pra produzir o app final.
- **Filosofia:** menos é mais. Um usuário, um app, uma lista de cada vez.

## O que mudou em relação ao Fruita original

| Fruita (original) | FruitaLite |
|---|---|
| Multi-usuário com 4 perfis | Usuário único (sem login real, só nome + tag) |
| Multi-loja com divisão de mercadorias | Uma loja por usuário (tag escolhida no onboarding) |
| Backend Node + Express + PostgreSQL | Sem backend obrigatório (pode rodar com localStorage) |
| 24 RFs, 5 RNs, 13 entidades | ~8 funcionalidades core |
| Projeto acadêmico com 7 pessoas | Projeto solo |
| Cliente real (Paulistão/Galante) | Experimento pessoal |
| Divisão entre lojas, PDF por loja, e-mail | Sem divisão. Exportar PDF é opcional/futuro |

## História do usuário central

> Um dia antes das compras na CEASA, o usuário abre o app e monta a lista do que está faltando no hortifrúti. No dia seguinte, durante a compra, ele abre a lista e vai adicionando os valores conforme paga. Ao final, marca como concluída e tem o histórico salvo.

## Fluxo principal (3 fases da lista)

1. **Planejamento** (📋) — usuário seleciona produtos e define quantidades. Sem valores ainda.
2. **Comprando** (🛒) — durante a compra na CEASA, adiciona valor unitário de cada item. Cálculo automático do total.
3. **Concluída** (✓) — lista finalizada com todos os valores. Disponível para consulta no histórico.

## Telas do app (7 no total)

| # | Tela | Descrição |
|---|---|---|
| 0 | Onboarding | Primeiro acesso: nome do usuário + tag da loja |
| 1 | Home | Dashboard com saudação, card da lista em andamento, histórico recente |
| 2 | Anotações | Bloco de anotações simples (lembretes do usuário) |
| 3 | Seleção de produtos | Grid de produtos com seleção múltipla + busca (fase planejamento) |
| 4 | Definir quantidades | Cada produto selecionado recebe quantidade + unidade (caixa/unidade/kg) |
| 5 | Lista criada | Visualização da lista em fase Planejamento (read-only até iniciar compra) |
| 6 | Lista em compra | Lista em fase Comprando — adicionar valor unitário item por item |
| 7 | Lista finalizada | Resumo final com totais, opção de exportar PDF |

## Navegação (Bottom Nav — 3 itens)

- **Esquerda:** Anotações
- **Centro:** Início (Home)
- **Direita:** Listas

## Funcionalidades core

- **F1.** Onboarding com nome + tag de loja (salvo localmente)
- **F2.** Saudação dinâmica (Bom dia / Boa tarde / Boa noite conforme horário do device)
- **F3.** Criar nova lista a partir de catálogo de produtos hortifrúti pré-cadastrados
- **F4.** Selecionar múltiplos produtos com busca textual
- **F5.** Definir quantidade por produto, escolhendo unidade entre: caixas, unidades, kg
- **F6.** Lista em fase de planejamento (sem valores), depois transição para fase de compra
- **F7.** Durante a compra: adicionar valor unitário, cálculo automático de subtotal e total
- **F8.** Barra de progresso da lista (% de produtos com valor)
- **F9.** Finalizar lista quando todos os produtos têm valor
- **F10.** Histórico de listas finalizadas
- **F11.** Anotações simples (CRUD local — sem categorias nem tags)

## Fora do escopo (não fazer agora)

- Backend / API / sincronização entre dispositivos
- Login real, recuperação de senha, multi-usuário
- Divisão de mercadorias entre lojas
- Envio por e-mail
- Notificações push
- Modo offline / sincronização
- Análise preditiva, sugestões automáticas, IA
- Integração com fornecedores ou PDV
- Múltiplas tags por usuário (uma loja por usuário e pronto)
- Edição de produtos do catálogo (catálogo é fixo na v1)
- Compartilhamento de listas

## Stack sugerida

- **Frontend:** React + Vite + TypeScript (web mobile-only, viewport 375–430px, sem breakpoints desktop)
- **Estado:** Zustand ou Context API (simples, sem Redux)
- **Persistência:** localStorage (v1), eventualmente IndexedDB se a quantidade crescer
- **Estilo:** CSS variables + módulos CSS ou Tailwind com tokens customizados
- **Ícones:** Lucide React
- **Fontes:** Manrope (títulos) + Inter (dados) via Google Fonts
- **PDF (futuro):** jsPDF se entrar no escopo

> Sem backend na v1. Tudo cliente-side. Se for crescer, depois plugar Supabase ou similar.

## Estrutura de pastas sugerida

```
fruitalite/
├── src/
│   ├── app/              # entry, router, layout raiz
│   ├── features/         # organização por feature
│   │   ├── onboarding/
│   │   ├── home/
│   │   ├── listas/
│   │   ├── anotacoes/
│   │   └── catalogo/
│   ├── components/       # componentes do design system (Button, Card, Input, etc)
│   ├── hooks/            # hooks compartilhados
│   ├── stores/           # estado global (Zustand)
│   ├── types/            # tipos TS compartilhados
│   ├── utils/            # formatadores (moeda, peso, data, saudação)
│   ├── data/             # catálogo fixo de produtos
│   └── styles/           # tokens.css, globals.css
├── public/
│   └── brand/            # logos SVG do Fruita
└── ...
```

## Catálogo inicial de produtos (sugestão)

Hortifrúti básico — começar com ~20 itens. Cada produto tem: id, nome, emoji, categoria.

**Frutas:** Maçã, Banana, Laranja, Mamão, Melancia, Abacaxi, Manga, Uva
**Verduras:** Alface, Couve, Espinafre, Rúcula
**Legumes:** Tomate, Cenoura, Batata, Cebola, Pimentão, Pepino, Abóbora, Beterraba

## Regras de negócio (poucas e claras)

- **RN1.** Lista nova começa em fase `planejamento`. Não pode ter valores nesse momento.
- **RN2.** Para passar para fase `comprando`, a lista precisa ter pelo menos 1 produto com quantidade definida.
- **RN3.** Para passar para fase `concluida`, todos os produtos da lista precisam ter valor unitário definido.
- **RN4.** Lista `concluida` é read-only. Não pode ser editada (apenas excluída).
- **RN5.** Valores monetários: armazenar em centavos como inteiro. Nunca usar float.
- **RN6.** Pesos: armazenar em gramas como inteiro. Converter pra kg apenas na exibição.
- **RN7.** Quantidade aceita 3 unidades: `caixas`, `unidades`, `kg`. Cada produto da lista escolhe uma.

## Modelo de dados (cliente-side)

```ts
type Fase = 'planejamento' | 'comprando' | 'concluida';
type Unidade = 'caixas' | 'unidades' | 'kg';

type Usuario = {
  nome: string;
  tagLoja: string;
  criadoEm: string; // ISO
};

type Produto = {
  id: string;
  nome: string;
  emoji: string;
  categoria: 'frutas' | 'verduras' | 'legumes';
};

type ItemLista = {
  produtoId: string;
  quantidade: number; // inteiro
  unidade: Unidade;
  valorUnitarioCentavos: number | null; // null enquanto não preenchido
};

type Lista = {
  id: string;
  nome: string; // ex: "Lista 13/05"
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

## Convenções

- **Idioma do código:** PT-BR para domínio (`lista`, `produto`, `adicionarItem`, `calcularTotal`). Inglês para infra (React, hooks, libs).
- **Idioma da UI:** PT-BR sempre.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Branches:** `main` estável. Para mudanças maiores, `feature/<nome>`.

## Identidade visual

Reaproveita a marca do Fruita original (logo em verde `#2D4F3A`, símbolo de kiwi). Os SVGs estão em `packages/design-tokens/brand/` no projeto antigo — podem ser copiados pra cá.

Versão lite usa **apenas modo claro** na v1. Modo escuro fica pra depois (ou nunca, se não precisar).

## Critérios de "pronto" pra v1

- Usuário consegue criar uma lista do zero
- Consegue rodar o fluxo completo: planejamento → comprando → concluída
- Lista finalizada aparece no histórico
- Anotações funcionam (criar, editar, excluir)
- Visual está fiel ao design system
- Funciona bem em viewport mobile (375px e 430px); em desktop aparece travado em 480px centralizado
- Dados persistem entre sessões (localStorage)
