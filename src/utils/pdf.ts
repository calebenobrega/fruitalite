import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

export async function gerarPDFLista(lista: Lista): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentRight = pageWidth - margin;

  // Column positions (mm)
  const colCheckX = margin;
  const checkSize = 4;
  const colProdX = margin + 7;
  const colQtdX = margin + 77;
  const colUnitX = margin + 98;
  const colSubtotalX = margin + 124;
  const colObsX = margin + 128;

  const rowHeight = 10;
  const bottomLimit = pageHeight - margin - 20; // reserve space for total

  function drawTableHeader(yPos: number): number {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);

    doc.text('Produto', colProdX, yPos);
    doc.text('Qtd.', colQtdX, yPos, { align: 'center' });
    doc.text('Unit.', colUnitX, yPos, { align: 'center' });
    doc.text('Subtotal', colSubtotalX, yPos, { align: 'right' });
    doc.text('Observação', colObsX, yPos);

    doc.setDrawColor(200);
    doc.line(margin, yPos + 3, contentRight, yPos + 3);
    return yPos + 10;
  }

  // ── Document header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(lista.nome, margin, 24);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const dataTexto = lista.finalizadaEm
    ? `Finalizada em ${formatarData(lista.finalizadaEm)}`
    : `Criada em ${formatarData(lista.criadaEm)}`;
  doc.text(dataTexto, margin, 32);

  doc.setDrawColor(210);
  doc.line(margin, 37, contentRight, 37);

  // ── Table header
  let y = drawTableHeader(46);

  // ── Rows (alfabético por nome do produto)
  const itensOrdenados = [...lista.itens].sort((a, b) =>
    nomeProduto(a.produtoId).localeCompare(nomeProduto(b.produtoId), 'pt-BR', {
      sensitivity: 'base',
    }),
  );

  doc.setFontSize(10);
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

    // Derivação R$/kg quando unidade=Cx + peso da caixa definido
    const pesoCx = item.pesoPorCaixaGramas ?? 0;
    const temKgInfo =
      item.unidade === 'caixas' && pesoCx > 0 && unitCentavos > 0;
    const valorPorKgCentavos = temKgInfo
      ? Math.round((unitCentavos * 1000) / pesoCx)
      : 0;
    const totalGramas = temKgInfo ? pesoCx * item.quantidade : 0;
    const subRowHeight = temKgInfo ? 5 : 0;

    // Checkbox (square, 4×4mm, slightly above baseline)
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
    doc.text(qtdLabel, colQtdX, y, { align: 'center' });
    doc.text(unitLabel, colUnitX, y, { align: 'center' });
    doc.text(subtotalLabel, colSubtotalX, y, { align: 'right' });
    // Observação: célula vazia para escrita manual

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

    doc.setDrawColor(235);
    doc.line(margin, y + 3 + subRowHeight, contentRight, y + 3 + subRowHeight);
    y += rowHeight + subRowHeight;

    if (y > bottomLimit) {
      doc.addPage();
      y = drawTableHeader(24);
      doc.setFontSize(10);
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

  const nomeArquivo = lista.nome.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'lista';
  const fileName = `${nomeArquivo}.pdf`;

  // No app nativo (Android via Capacitor): gravar no cache interno + share sheet
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = doc.output('datauristring').split(',')[1];
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });
      const uriResult = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache,
      });
      await Share.share({
        title: lista.nome,
        url: uriResult.uri,
        dialogTitle: 'Compartilhar lista',
      });
    } catch {
      // Silently fail (user cancelou ou erro inesperado)
    }
    return;
  }

  // Web: Web Share API com arquivo, depois download como fallback
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
