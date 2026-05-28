# PDF Compacto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o PDF gerado por `gerarPDFLista` mais denso — rowHeight 7mm, margens 12mm, R$/kg inline no produto, sem coluna Observação — para que listas de 20+ itens caibam em uma folha A4.

**Architecture:** Modificação cirúrgica em `src/utils/pdf.ts`. Uma função pura `buildKgAnnotation` é extraída do loop de renderização para ser testável isoladamente. Todos os outros ajustes são trocas de constantes e remoção de uma sub-linha de renderização.

**Tech Stack:** jsPDF, Vitest, TypeScript

**Spec:** `docs/superpowers/specs/2026-05-28-pdf-compact-design.md`

---

## File Map

| Ação   | Arquivo                 | O que muda                                                                  |
| ------ | ----------------------- | --------------------------------------------------------------------------- |
| Modify | `src/utils/pdf.ts`      | Constantes de layout, remoção coluna obs, sub-linha → inline, extrai helper |
| Create | `src/utils/pdf.test.ts` | Testes unitários de `buildKgAnnotation`                                     |

---

## Task 1: Criar teste falho para `buildKgAnnotation`

**Files:**

- Create: `src/utils/pdf.test.ts`

- [ ] **Step 1: Criar o arquivo de teste**

Crie `src/utils/pdf.test.ts` com o conteúdo abaixo. O teste vai falhar porque `buildKgAnnotation` ainda não existe em `pdf.ts`.

```typescript
import { describe, expect, it } from 'vitest';
import { buildKgAnnotation } from './pdf';

describe('buildKgAnnotation', () => {
  it('retorna string vazia quando unitCentavos é 0', () => {
    expect(buildKgAnnotation(0, 15000, 3)).toBe('');
  });

  it('retorna string vazia quando pesoCxGramas é 0', () => {
    expect(buildKgAnnotation(2000, 0, 3)).toBe('');
  });

  it('retorna string vazia quando unitCentavos é negativo', () => {
    expect(buildKgAnnotation(-100, 10000, 2)).toBe('');
  });

  it('inclui marcador de R$/kg e peso total quando dados válidos', () => {
    // 2000 centavos/cx, caixa de 10kg (10000g), 2 caixas
    // R$/kg = round(2000 * 1000 / 10000) = 200 centavos = R$2,00/kg
    // total = 10000g * 2 = 20000g = 20 kg
    const result = buildKgAnnotation(2000, 10000, 2);
    expect(result).toMatch(/~.*\/kg/);
    expect(result).toContain('20 kg');
    expect(result).toContain('total');
  });

  it('calcula arredondamento correto de R$/kg', () => {
    // 3000 centavos/cx, caixa de 15kg (15000g)
    // R$/kg = round(3000 * 1000 / 15000) = 200 centavos = R$2,00/kg
    const result = buildKgAnnotation(3000, 15000, 1);
    expect(result).toMatch(/~.*\/kg/);
  });
});
```

- [ ] **Step 2: Confirmar que o teste falha**

```bash
npm test -- --reporter=verbose src/utils/pdf.test.ts
```

Esperado: falha com `SyntaxError` ou `does not provide an export named 'buildKgAnnotation'`.

---

## Task 2: Extrair `buildKgAnnotation` e fazer os testes passarem

**Files:**

- Modify: `src/utils/pdf.ts`

- [ ] **Step 1: Adicionar o export `buildKgAnnotation` em `pdf.ts`**

Adicione a função **antes** de `gerarPDFLista`. Ela extrai a lógica que hoje está inline dentro do loop:

```typescript
export function buildKgAnnotation(
  unitCentavos: number,
  pesoCxGramas: number,
  quantidade: number,
): string {
  if (unitCentavos <= 0 || pesoCxGramas <= 0) return '';
  const valorPorKgCentavos = Math.round((unitCentavos * 1000) / pesoCxGramas);
  const totalGramas = pesoCxGramas * quantidade;
  return `~ ${formatarMoeda(valorPorKgCentavos)}/kg · ${formatarPeso(totalGramas)} total`;
}
```

Posição sugerida: logo após a função `nomeProduto`, antes de `gerarPDFLista`.

- [ ] **Step 2: Rodar os testes e confirmar que passam**

```bash
npm test -- --reporter=verbose src/utils/pdf.test.ts
```

Esperado: 5 testes passando.

- [ ] **Step 3: Commit**

```bash
git add src/utils/pdf.test.ts src/utils/pdf.ts
git commit -m "test: extrai e testa buildKgAnnotation do utilitário de PDF"
```

---

## Task 3: Atualizar constantes de layout e cabeçalho

**Files:**

- Modify: `src/utils/pdf.ts` — bloco de constantes e função `drawTableHeader`

- [ ] **Step 1: Substituir o bloco de constantes de layout**

Localize o trecho que começa em `const margin = 16;` e termina em `const rowHeight = 10;`. Substitua integralmente por:

```typescript
const margin = 12;
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const contentRight = pageWidth - margin;

// Column positions (mm)
const colCheckX = margin;
const checkSize = 3.5;
const colProdX = margin + 5;
const colQtdX = 110;
const colUnitX = 134;
const colSubtotalX = 195;

const rowHeight = 7;
const bottomLimit = pageHeight - margin - 20;
```

- [ ] **Step 2: Atualizar o cabeçalho do documento**

Localize o bloco `// ── Document header` e substitua:

```typescript
// ── Document header
doc.setFontSize(16);
doc.setFont('helvetica', 'bold');
doc.setTextColor(30);
doc.text(lista.nome, margin, 18);

doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.setTextColor(100);
const dataTexto = lista.finalizadaEm
  ? `Finalizada em ${formatarData(lista.finalizadaEm)}`
  : `Criada em ${formatarData(lista.criadaEm)}`;
doc.text(dataTexto, margin, 25);

doc.setDrawColor(210);
doc.line(margin, 29, contentRight, 29);

// ── Table header
let y = drawTableHeader(33);
```

- [ ] **Step 3: Atualizar `drawTableHeader`**

Substitua a função `drawTableHeader` completa:

```typescript
function drawTableHeader(yPos: number): number {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100);

  doc.text('Produto', colProdX, yPos);
  doc.text('Qtd.', colQtdX, yPos, { align: 'center' });
  doc.text('Unit.', colUnitX, yPos, { align: 'center' });
  doc.text('Subtotal', colSubtotalX, yPos, { align: 'right' });

  doc.setDrawColor(200);
  doc.line(margin, yPos + 3, contentRight, yPos + 3);
  return yPos + 8;
}
```

Nota: a linha `doc.text('Observação', colObsX, yPos);` é removida. O retorno muda de `yPos + 10` para `yPos + 8`.

- [ ] **Step 4: Verificar type-check**

```bash
npm run type-check
```

Esperado: zero erros. Se aparecer `colObsX is not defined`, é porque ainda há referência a essa variável no loop — será removida na Task 4.

- [ ] **Step 5: Commit**

```bash
git add src/utils/pdf.ts
git commit -m "refactor(pdf): comprime layout — margin 12mm, rowHeight 7mm, header menor"
```

---

## Task 4: Substituir sub-linha de R$/kg por annotation inline

**Files:**

- Modify: `src/utils/pdf.ts` — loop de renderização de itens

Esta é a mudança central. O loop atual calcula `subRowHeight`, renderiza uma sub-linha separada, e usa `rowHeight + subRowHeight` para avançar `y`. Tudo isso é substituído por uma annotation na mesma linha.

- [ ] **Step 1: Atualizar a fonte das linhas para 9pt**

No loop, logo após `doc.setFontSize(10);` (antes do `for`), troque para:

```typescript
doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.setTextColor(30);
```

- [ ] **Step 2: Substituir o bloco de cálculo de kg dentro do loop**

Localize e **remova** as linhas:

```typescript
// Derivação R$/kg quando unidade=Cx + peso da caixa definido
const pesoCx = item.pesoPorCaixaGramas ?? 0;
const temKgInfo = item.unidade === 'caixas' && pesoCx > 0 && unitCentavos > 0;
const valorPorKgCentavos = temKgInfo ? Math.round((unitCentavos * 1000) / pesoCx) : 0;
const totalGramas = temKgInfo ? pesoCx * item.quantidade : 0;
const subRowHeight = temKgInfo ? 5 : 0;
```

Substitua por:

```typescript
const kgAnnotation =
  item.unidade === 'caixas'
    ? buildKgAnnotation(unitCentavos, item.pesoPorCaixaGramas ?? 0, item.quantidade)
    : '';
```

- [ ] **Step 3: Atualizar o checkpoint de checkbox**

Localize `doc.rect(colCheckX, y - 3.5, checkSize, checkSize, 'S');` — não muda, mas agora `checkSize` é `3.5` (já atualizado na Task 3).

- [ ] **Step 4: Adicionar rendering da annotation inline após o nome do produto**

Localize o bloco que renderiza o nome do produto:

```typescript
doc.text(nomeFinal, colProdX, y);
doc.text(qtdLabel, colQtdX, y, { align: 'center' });
doc.text(unitLabel, colUnitX, y, { align: 'center' });
doc.text(subtotalLabel, colSubtotalX, y, { align: 'right' });
// Observação: célula vazia para escrita manual
```

Substitua por:

```typescript
doc.text(nomeFinal, colProdX, y);

if (kgAnnotation) {
  const annotX = colProdX + doc.getTextWidth(nomeFinal) + 3;
  doc.setFontSize(7);
  const annotFits = annotX + doc.getTextWidth(kgAnnotation) < colQtdX - 4;
  if (annotFits) {
    doc.setTextColor(140);
    doc.text(kgAnnotation, annotX, y);
  }
  doc.setFontSize(9);
  doc.setTextColor(30);
}

doc.text(qtdLabel, colQtdX, y, { align: 'center' });
doc.text(unitLabel, colUnitX, y, { align: 'center' });
doc.text(subtotalLabel, colSubtotalX, y, { align: 'right' });
```

- [ ] **Step 5: Remover o bloco da sub-linha**

Localize e **remova** o bloco inteiro:

```typescript
// Sublinha com R$/kg derivado + peso total (quando aplicável)
if (temKgInfo) {
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `~ ${formatarMoeda(valorPorKgCentavos)}/kg  •  ${formatarPeso(totalGramas)} no total`,
    colProdX,
    y + 5,
  );
  doc.setFontSize(10);
  doc.setTextColor(30);
}
```

- [ ] **Step 6: Atualizar separador e avanço de linha**

Localize:

```typescript
doc.setDrawColor(235);
doc.line(margin, y + 3 + subRowHeight, contentRight, y + 3 + subRowHeight);
y += rowHeight + subRowHeight;
```

Substitua por:

```typescript
doc.setDrawColor(235);
doc.line(margin, y + 3, contentRight, y + 3);
y += rowHeight;
```

- [ ] **Step 7: Atualizar fonte no cabeçalho de nova página**

Dentro do bloco `if (y > bottomLimit)`, localize `doc.setFontSize(10);` e troque para `doc.setFontSize(9);`.

---

## Task 5: Verificação final e commit

**Files:**

- Modify: nenhum — apenas execução de comandos

- [ ] **Step 1: Rodar todos os testes**

```bash
npm test
```

Esperado: todos os testes existentes passando (mínimo 41 + 5 novos = 46).

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Esperado: zero erros. Confirmar que `colObsX`, `subRowHeight`, `temKgInfo`, `valorPorKgCentavos`, `totalGramas` não aparecem mais como variáveis não utilizadas.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Esperado: zero warnings.

- [ ] **Step 4: Build**

```bash
npm run build
```

Esperado: build concluído sem erros. Arquivo `dist/` gerado.

- [ ] **Step 5: Commit final**

```bash
git add src/utils/pdf.ts
git commit -m "feat(pdf): layout compacto — R\$/kg inline, sem coluna obs, rowHeight 7mm"
```
