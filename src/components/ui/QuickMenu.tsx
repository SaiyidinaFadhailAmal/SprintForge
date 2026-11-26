import { Check } from 'lucide-react';
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn';

export interface QuickMenuOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface QuickMenuProps<T extends string> {
  trigger: ReactNode;
  options: readonly QuickMenuOption<T>[];
  selectedValues: readonly T[];
  onSelect: (value: T) => void;
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
  ariaLabel: string;
  widthClass?: string;
}

export function QuickMenu<T extends string>({
  trigger,
  options,
  selectedValues,
  onSelect,
  align = 'left',
  direction = 'down',
  ariaLabel,
  widthClass = 'w-44',
}: QuickMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center bg-transparent p-0 text-left focus:outline-none"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'animate-sf-fade-in absolute z-40 rounded-lg border border-border-strong bg-surface p-1',
            widthClass,
            align === 'right' ? 'right-0' : 'left-0',
            direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          )}
          style={{ boxShadow: 'var(--sf-shadow-lg)' }}
        >
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition',
                  isSelected
                    ? 'bg-accent-soft text-ink font-medium'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
