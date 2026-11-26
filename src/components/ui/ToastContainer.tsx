import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import type { ToastItem } from '../../types';
import { cn } from '../../utils/cn';

interface ToastContainerProps {
  toasts: readonly ToastItem[];
  onDismiss: (id: string) => void;
  hasBulkBar?: boolean;
}

export function ToastContainer({
  toasts,
  onDismiss,
  hasBulkBar = false,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 transition-all duration-200',
        hasBulkBar ? 'bottom-20' : 'bottom-4',
      )}
    >
      {toasts.map((toast) => {
        const Icon =
          toast.variant === 'success'
            ? CheckCircle2
            : toast.variant === 'warning'
              ? AlertTriangle
              : toast.variant === 'danger'
                ? Trash2
                : Info;

        const iconColor =
          toast.variant === 'success'
            ? 'text-emerald-400'
            : toast.variant === 'warning'
              ? 'text-amber-400'
              : toast.variant === 'danger'
                ? 'text-rose-400'
                : 'text-accent';

        return (
          <div
            key={toast.id}
            role="status"
            className="animate-sf-slide-up pointer-events-auto flex items-start gap-3 rounded-xl border border-border-strong bg-surface p-3.5 text-ink"
            style={{ boxShadow: 'var(--sf-shadow-lg)' }}
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-ink">{toast.message}</p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] text-ink-secondary">
                  {toast.description}
                </p>
              )}
            </div>
            {toast.undoAction && (
              <button
                type="button"
                onClick={() => {
                  toast.undoAction?.();
                  onDismiss(toast.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-accent-border bg-accent-soft px-2 py-1 text-xs font-medium text-accent transition hover:bg-accent hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                {toast.undoLabel ?? 'Undo'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 text-ink-muted transition hover:bg-surface-hover hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
