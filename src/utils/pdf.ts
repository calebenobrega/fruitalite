import jsPDF from 'jspdf';
import type { Lista, Unidade } from '@t/index';
import { useCatalogoStore } from '@stores/catalogoStore';
import { formatarMoeda, formatarMoedaCompact } from '@utils/moeda';
import { formatarData } from '@utils/data';
import { formatarPeso } from '@utils/peso';

function labelUnidade(u: Unidade): string {
  return u === 'caixas' ? 'cx.' : u === 'kg' ? 'kg' : 'un.';
}

function nomeProduto(produtoId: string): string {
  const catalogo = useCatalogoStore.getState().produtos;
  return catalogo.find((p) => p.id === produtoId)?.nome ?? produtoId;
}

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

export async function gerarPDFLista(lista: Lista): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

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

  // ── Rows (alfabético por nome do produto)
  const itensOrdenados = [...lista.itens].sort((a, b) =>
    nomeProduto(a.produtoId).localeCompare(nomeProduto(b.produtoId), 'pt-BR', {
      sensitivity: 'base',
    }),
  );

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30);

  let totalGeral = 0;

  for (const item of itensOrdenados) {
    const nome = nomeProduto(item.produtoId);
    const qtdLabel = `${item.quantidade} ${labelUnidade(item.unidade)}`;
    const unitCentavos = item.valorUnitarioCentavos ?? 0;
    const unitLabel = unitCentavos > 0 ? formatarMoedaCompact(unitCentavos) : '—';
    const subtotal = unitCentavos * item.quantidade;
    totalGeral += subtotal;
    const subtotalLabel = subtotal > 0 ? formatarMoeda(subtotal) : '—';

    const kgAnnotation =
      item.unidade === 'caixas'
        ? buildKgAnnotation(unitCentavos, item.pesoPorCaixaGramas ?? 0, item.quantidade)
        : '';

    // Checkbox (square, 3.5×3.5mm, slightly above baseline)
    doc.setDrawColor(120);
    doc.setLineWidth(0.3);
    doc.rect(colCheckX, y - 3.5, checkSize, checkSize, 'S');
    doc.setLineWidth(0.2);

    // Truncate long names to product column width
    const maxNomeWidth = colQtdX - colProdX - 4;
    const nomeFinal =
      doc.getTextWidth(nome) > maxNomeWidth
        ? doc.splitTextToSize(nome, maxNomeWidth)[0] + '…'
        : nome;

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

    doc.setDrawColor(235);
    doc.line(margin, y + 3, contentRight, y + 3);
    y += rowHeight;

    if (y > bottomLimit) {
      doc.addPage();
      y = drawTableHeader(24);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30);
    }
  }

  // ── Total row
  y += 4;
  doc.setDrawColor(180);
  doc.line(margin, y - 2, contentRight, y - 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text('Total geral', colProdX, y + 6);
  doc.text(formatarMoeda(totalGeral), colSubtotalX, y + 6, { align: 'right' });

  const nomeArquivo =
    lista.nome
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_') || 'lista';
  const fileName = `${nomeArquivo}.pdf`;

  // Web Share API com arquivo PDF; fallback para download direto
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      const blob = doc.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });
      await navigator.share({
        title: lista.nome,
        text: `Lista de compras: ${lista.nome}`,
        files: [file],
      });
      return;
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
    }
  }

  doc.save(fileName);
}
