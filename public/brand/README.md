# Marca Fruita — Pacote de Logos

Versões da identidade visual geradas a partir da logo original `01_LOGO_FRUITA_SSVG.svg`.

## Convenção de nomes

`<numero>_<descricao>_<contexto>.svg`

- `01_horizontal_*` — logo completa (símbolo + wordmark lado a lado)
- `02_simbolo_*` — apenas o símbolo (kiwi)
- `03_empilhado_*` — símbolo em cima, wordmark embaixo
- `04_horizontal_inverso*` — logo branca para fundos escuros
- `05_icone_app_*` — ícone de app mobile (1024x1024)
- `06_favicon_*` — favicon nos tamanhos 16, 32, 64, 512

## Variantes de fundo

- `_creme` — fundo `#F4F2EA` (off-white natural, principal)
- `_branco` — fundo `#FFFFFF` (branco puro)
- `_inverso` — sobre fundo verde escuro `#1A2F25`
- `_marca` — sobre verde primário `#2D4F3A`

## Quando usar cada uma

| Contexto | Arquivo recomendado |
|---|---|
| Site / app, fundo claro principal | `01_horizontal_creme.svg` |
| Documentos imprimíveis | `01_horizontal_branco.svg` |
| Cabeçalho de tela mobile | `03_empilhado_creme.svg` |
| Email signature, cards verdes | `04_horizontal_inverso.svg` |
| Splash screen do app | `03_empilhado_inverso.svg` |
| Ícone do app no celular | `05_icone_app_rounded.svg` |
| Favicon do site | `06_favicon_32.svg` (raster) ou `06_favicon_512.svg` (alta-res) |

## Cores de marca

- Verde primário: `#2D4F3A`
- Verde escuro (pressed/hover): `#1A2F25`
- Creme natural: `#F4F2EA`
- Branco puro: `#FFFFFF`

## Observação técnica

Os SVGs preservam os paths originais da logo. A "máscara creme" (path 2) foi parametrizada para casar dinamicamente com o fundo escolhido — por isso as bordas ficam invisíveis em qualquer cor de canvas.
