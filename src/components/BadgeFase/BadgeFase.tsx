import { Chip, type ChipSize, type ChipVariant } from '../Chip';
import type { Fase } from '@/types';

type BadgeFaseProps = {
  fase: Fase;
  size?: ChipSize;
};

const config: Record<Fase, { label: string; emoji: string; variant: ChipVariant }> = {
  planejamento: { label: 'Planejamento', emoji: '📋', variant: 'primary' },
  comprando: { label: 'Comprando', emoji: '🛒', variant: 'warning' },
  concluida: { label: 'Concluída', emoji: '✓', variant: 'success' },
};

export function BadgeFase({ fase, size = 'md' }: BadgeFaseProps) {
  const { label, emoji, variant } = config[fase];
  return (
    <Chip variant={variant} size={size} icon={<span aria-hidden="true">{emoji}</span>}>
      {label}
    </Chip>
  );
}
