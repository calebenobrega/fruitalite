# FruitaLite

Versão lite do projeto Fruita: app **mobile** para gestão de listas de compras hortifrúti. Usuário único, client-side puro com localStorage, fluxo em 3 fases (planejamento → comprando → concluída).

## Como rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173. Use as ferramentas de simulação mobile do navegador (iPhone, Pixel) ou redimensione a janela para ≤480px de largura — o app trava em viewport mobile e não tem layout desktop.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento Vite |
| `npm run build` | compilação TS + bundle de produção |
| `npm run preview` | servir o build local |
| `npm run lint` | ESLint sobre `src/` |
| `npm run lint:fix` | ESLint com `--fix` |
| `npm run format` | Prettier formatando `src/` |
| `npm run format:check` | Prettier conferindo sem alterar |
| `npm run type-check` | `tsc --noEmit` |

## Documentação interna

- [`CLAUDE.md`](./CLAUDE.md) — contexto técnico, stack, convenções, regras invioláveis, modelo de dados
- [`CONTEXTO.md`](./CONTEXTO.md) — visão geral, fluxos, escopo, regras de negócio
- [`DESIGN.md`](./DESIGN.md) — design system completo (tokens CSS, tipografia, componentes)
- [`public/brand/README.md`](./public/brand/README.md) — variantes de logo e quando usar cada uma

## Build Android (APK)

O app usa [Capacitor](https://capacitorjs.com/) para gerar um `.apk` Android nativo a partir do build Vite.

**Pré-requisitos:** Android Studio instalado com SDK Android.

### Fluxo de desenvolvimento

```bash
# 1. Compilar o web app
npm run build

# 2. Sincronizar com o projeto Android
npx cap sync android

# 3. Abrir no Android Studio
npx cap open android
```

No Android Studio: clique **Run ▶** com um emulador ou dispositivo conectado para instalar diretamente.

### Gerar APK debug

No Android Studio:
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. O `.apk` fica em `android/app/build/outputs/apk/debug/app-debug.apk`

### Gerar APK release (assinado)

1. **Build → Generate Signed Bundle / APK → APK**
2. Criar ou usar keystore existente
3. O `.apk` fica em `android/app/build/outputs/apk/release/app-release.apk`

### Atualizar ícones e splash

Os SVGs fonte ficam em `assets/`. Para regerar os recursos Android:

```bash
npx @capacitor/assets generate --android \
  --iconBackgroundColor '#f5f0e8' \
  --iconBackgroundColorDark '#1a3a2a' \
  --splashBackgroundColor '#1a3a2a' \
  --splashBackgroundColorDark '#1a3a2a' \
  --logoSplashScale 0.35
```

## Stack

React 19 · Vite · TypeScript strict · React Router 6 · Zustand · CSS Modules + variáveis CSS · Lucide React · Manrope + Inter · date-fns · Capacitor. Sem backend.

## Estrutura de pastas

Detalhada em [`CLAUDE.md`](./CLAUDE.md#estrutura-de-pastas). Resumo:

```
src/
├── app/         # entry + router + layout
├── components/  # design system
├── features/    # onboarding, home, listas, anotacoes
├── stores/      # estado global (Zustand)
├── data/        # catálogo de produtos
├── types/       # tipos compartilhados
├── utils/       # moeda, peso, data, storage
└── styles/      # tokens.css, globals.css
public/brand/    # logos SVG do Fruita
```
