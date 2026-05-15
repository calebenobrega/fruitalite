const fmtKg = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

/** Formata gramas para exibição: abaixo de 1 kg mostra "500 g", acima mostra "1,5 kg" */
export function formatarPeso(gramas: number): string {
  if (gramas < 1000) return `${gramas} g`;
  return `${fmtKg.format(gramas / 1000)} kg`;
}

/** Gramas → kg (float) */
export function gramasParaKg(gramas: number): number {
  return gramas / 1000;
}

/** Kg (float) → gramas inteiros */
export function kgParaGramas(kg: number): number {
  return Math.round(kg * 1000);
}
