import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastItem } from '../types';
import { createId } from '../utils/formatters';

interface AddToastOptions {
  message: string;
  description?: string;
  variant?: ToastItem['variant'];
  undoAction?: () => void;
  undoLabel?: string;
  durationMs?: number;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (options: AddToastOptions): string => {
      const id = createId('toast');
      const nextToast: ToastItem = {
        id,
        message: options.message,
        description: options.description,
        variant: options.variant ?? 'info',
        undoAction: options.undoAction,
        undoLabel: options.undoLabel ?? 'Undo',
      };

      setToasts((prev) => [...prev.slice(-3), nextToast]);

      const timeout =
        options.durationMs ?? (options.undoAction ? 7000 : 3800);
      const timerId = window.setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, timeout);

      timersRef.current.set(id, timerId);
      return id;
    },
    [],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId);
      }
      timers.clear();
    };
  }, []);

  return {
    toasts,
    addToast,
    dismissToast,
  };
}
