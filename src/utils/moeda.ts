const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtCompact = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata centavos inteiros como R$ 1.234,56 */
export function formatarMoeda(centavos: number): string {
  return fmt.format(centavos / 100);
}

/** Formata centavos inteiros como 1.234,56 (sem símbolo R$) */
export function formatarMoedaCompact(centavos: number): string {
  return fmtCompact.format(centavos / 100);
}

/** Converte string de input "1234,56" ou "1234.56" para centavos inteiros */
export function parseMoeda(input: string): number {
  const normalizado = input.replace(/\./g, '').replace(',', '.');
  const valor = parseFloat(normalizado);
  if (isNaN(valor)) return 0;
  return Math.round(valor * 100);
}

/** Centavos → reais (float, só pra cálculos) */
export function centavosParaReais(centavos: number): number {
  return centavos / 100;
}

/** Reais (float) → centavos inteiros */
export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}
