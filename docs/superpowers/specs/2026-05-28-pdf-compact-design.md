# PDF Compacto — Design Spec

**Data:** 2026-05-28
**Feature:** Reduzir gasto de folhas no PDF gerado por `gerarPDFLista`
**Arquivo alvo:** `src/utils/pdf.ts`

---

## Contexto

O PDF gerado pela função `gerarPDFLista` usa espaçamento generoso (rowHeight 10mm, margens 16mm, cabeçalho de 56mm) que faz listas de 10–20 itens ocuparem mais espaço do que o necessário. A coluna "Observação" (espaço em branco para escrita manual) não é usada na prática. O R$/kg de itens por caixa aparece como sub-linha (+5mm por item), podendo ficar inline sem perda de informação.

---

## Mudanças de espaçamento

| Parâmetro                   | Atual | Novo  |
| --------------------------- | ----- | ----- |
| `margin`                    | 16mm  | 12mm  |
| Fonte título                | 18pt  | 16pt  |
| Fonte data                  | 10pt  | 9pt   |
| Posição 1ª linha de produto | ~56mm | ~42mm |
| `rowHeight`                 | 10mm  | 7mm   |
| Fonte linhas                | 10pt  | 9pt   |
| Fonte cabeçalho tabela      | 9pt   | 8pt   |
| `checkSize`                 | 4mm   | 3.5mm |

**Impacto:** lista com 20 itens sem caixas passa de ~256mm para ~182mm de conteúdo — cabe em folha A4 (297mm) com margem sobrando.

---

## Colunas

A coluna `Observação` é removida. O espaço recuperado vai para a coluna Produto.

**Layout resultante (esquerda → direita):**

```
[✓]  Produto (≈82mm)              Qtd.    Unit.    Subtotal
```

Posições concretas com `margin = 12`:

- `colCheckX` = 12
- `colProdX` = 17 (12 + 5, espaço para checkbox 3.5mm)
- `colQtdX` = 110 (centro)
- `colUnitX` = 134 (centro)
- `colSubtotalX` = 195 (alinhado à direita, próximo à borda)

O `contentRight` passa de 194mm para 198mm. Com `colSubtotalX = 195`, o subtotal chega perto da margem direita — o espaço que antes era da coluna Observação agora é usado.

---

## R$/kg inline

Para itens com `unidade === 'caixas'` e `pesoPorCaixaGramas > 0` e `valorUnitarioCentavos > 0`, o texto `~ R$X,XX/kg · Ykg total` é exibido na **mesma linha** do produto, logo após o nome, em:

- Fonte: 7pt
- Cor: cinza (textColor 140)

A posição X é calculada como `colProdX + doc.getTextWidth(nomeFinal) + 3`.

**Regra de truncamento:** se `posX + doc.getTextWidth(kgAnnotation) > colQtdX - 4`, o annotation é omitido silenciosamente. Não quebra layout, não corta o nome do produto.

A sub-linha de R$/kg é **removida**. `subRowHeight` deixa de existir. `rowHeight` é uniforme para todos os itens.

---

## Sem mudanças

- Ordenação alfabética dos itens: mantida
- Linha separadora entre itens: mantida (drawColor 235)
- Linha total no rodapé: mantida
- Lógica de nova página quando `y > bottomLimit`: mantida
- Web Share API + fallback `doc.save()`: mantida
- Nome do arquivo gerado: mantido

---

## Arquivo a modificar

`src/utils/pdf.ts` — função `gerarPDFLista`. Nenhum outro arquivo muda.

---

## Critério de aceitação

1. `npm run type-check` passa sem erros.
2. `npm run lint` passa sem warnings.
3. `npm run build` conclui sem erros.
4. PDF gerado visualmente: lista de 15+ itens cabe em uma folha A4.
5. Itens com caixa mostram R$/kg na mesma linha do produto.
6. Nenhuma coluna "Observação" aparece no PDF.
