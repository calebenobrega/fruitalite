import { useCallback, useRef, type PointerEvent } from 'react';

type Bind = {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerMove: () => void;
  onPointerCancel: () => void;
  onContextMenu: (e: { preventDefault: () => void }) => void;
};

/**
 * Detecta long-press (~500ms por padrão) em qualquer elemento via Pointer Events.
 *
 * Uso:
 *   const { bind, swallowClickIfLongPress } = useLongPress(() => abrirMenu());
 *   <button {...bind} onClick={(e) => { if (swallowClickIfLongPress(e)) return; navegar(); }}>
 */
export function useLongPress(onLongPress: () => void, ms = 500) {
  const timerRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    triggeredRef.current = false;
    clear();
    timerRef.current = window.setTimeout(() => {
      triggeredRef.current = true;
      onLongPress();
    }, ms);
  }, [clear, onLongPress, ms]);

  const bind: Bind = {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerMove: clear,
    onPointerCancel: clear,
    // Bloqueia o menu de contexto nativo (long-press no Android pode disparar)
    onContextMenu: (e) => e.preventDefault(),
  };

  /** Chame no início do `onClick` — retorna true e impede a navegação se o long-press disparou. */
  function swallowClickIfLongPress(e: { preventDefault: () => void; stopPropagation: () => void }) {
    if (triggeredRef.current) {
      triggeredRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    return false;
  }

  return { bind, swallowClickIfLongPress };
}
