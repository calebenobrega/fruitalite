import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function saudacao(): string {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Ex: "13/05/2025" */
export function formatarData(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: ptBR });
}

/** Ex: "13 de mai." */
export function formatarDataCurta(iso: string): string {
  return format(new Date(iso), "d 'de' MMM.", { locale: ptBR });
}

/** Ex: "há 2 dias" */
export function tempoRelativo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: ptBR, addSuffix: true });
}

/** Nome automático da lista: "Lista 13/05" */
export function nomeLista(): string {
  return `Lista ${format(new Date(), 'dd/MM', { locale: ptBR })}`;
}
