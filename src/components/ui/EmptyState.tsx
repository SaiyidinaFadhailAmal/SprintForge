import { Plus, RotateCcw, SearchX } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onCreateIssue?: () => void;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  hasActiveFilters = false,
  onClearFilters,
  onCreateIssue,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border-hairline bg-surface/40 text-center',
        compact ? 'px-4 py-8' : 'px-6 py-14',
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border-hairline bg-surface-2 text-ink-muted">
        <SearchX className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-ink-secondary">{description}</p>
      {(hasActiveFilters || onCreateIssue) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-hover"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
          {onCreateIssue && (
            <button
              type="button"
              onClick={onCreateIssue}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Issue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
