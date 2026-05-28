import { useParams, Navigate } from 'react-router-dom';
import { useListasStore } from '@stores/listasStore';
import { ListaComprando } from './ListaComprando';
import { ListaConcluida } from './ListaConcluida';

export function ListaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const lista = useListasStore((s) => s.listas.find((l) => l.id === id) ?? null);

  if (!lista) return <Navigate to="/" replace />;
  if (lista.fase === 'concluida') return <ListaConcluida lista={lista} />;
  return <ListaComprando lista={lista} />;
}
