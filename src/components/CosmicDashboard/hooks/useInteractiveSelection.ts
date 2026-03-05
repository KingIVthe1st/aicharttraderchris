import { useState, useCallback } from 'react';

export function useInteractiveSelection<T>() {
  const [selected, setSelected] = useState<T | null>(null);
  const [hovered, setHovered] = useState<T | null>(null);

  const select = useCallback((item: T) => {
    setSelected(prev => (prev === item ? null : item));
  }, []);

  const clear = useCallback(() => {
    setSelected(null);
    setHovered(null);
  }, []);

  // The "active" item is selected (pinned) or hovered (preview)
  const active = selected ?? hovered;

  const getHandlers = useCallback((item: T) => ({
    onClick: () => select(item),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item); }
    },
    onMouseEnter: () => setHovered(item),
    onMouseLeave: () => setHovered(null),
    tabIndex: 0,
    role: 'button' as const,
  }), [select]);

  return { selected, hovered, active, select, clear, getHandlers };
}
