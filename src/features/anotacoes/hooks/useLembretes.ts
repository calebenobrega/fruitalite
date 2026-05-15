import { useEffect, useRef } from 'react';
import { useAnotacoesStore } from '@stores/anotacoesStore';

export function useLembretes() {
  const anotacoes = useAnotacoesStore((s) => s.anotacoes);
  const marcarDisparado = useAnotacoesStore((s) => s.marcarDisparado);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    const agora = Date.now();
    const pendentes = anotacoes.filter(
      (a) => a.lembrete !== null && !a.lembrete.disparado,
    );

    const timeouts = timeoutsRef.current;
    timeouts.forEach((tid) => clearTimeout(tid));
    timeouts.clear();

    for (const anotacao of pendentes) {
      const lembrete = anotacao.lembrete!;
      const ms = new Date(lembrete.dataHora).getTime() - agora;

      if (ms <= 0) {
        marcarDisparado(anotacao.id);
      } else {
        const tid = setTimeout(() => {
          marcarDisparado(anotacao.id);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(anotacao.titulo || 'Lembrete', {
              body: anotacao.conteudo || 'Você tem um lembrete no FruitaLite.',
              icon: '/brand/05_icone_app_rounded.svg',
            });
          }
        }, ms);
        timeouts.set(anotacao.id, tid);
      }
    }

    return () => {
      timeouts.forEach((tid) => clearTimeout(tid));
      timeouts.clear();
    };
  }, [anotacoes, marcarDisparado]);
}
