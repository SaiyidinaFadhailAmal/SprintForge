import {
  ArrowUpDown,
  Check,
  Filter,
  RotateCcw,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import {
  LABEL_META,
  LABEL_OPTIONS,
  PRIORITY_META,
  PRIORITY_ORDER,
  SORT_OPTIONS,
  STATUS_META,
  STATUS_ORDER,
} from '../../data/constants';
import type {
  FilterState,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  SortOption,
} from '../../types';
import { cn } from '../../utils/cn';
import { hasActiveFilters } from '../../utils/filterSort';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';

interface FilterBarProps {
  filters: FilterState;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onSearchChange: (search: string) => void;
  onToggleStatus: (status: IssueStatus) => void;
  onTogglePriority: (priority: IssuePriority) => void;
  onToggleLabel: (label: IssueLabel) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

type ActiveDropdown = 'status' | 'priority' | 'label' | 'sort' | null;

export function FilterBar({
  filters,
  searchInputRef,
  onSearchChange,
  onToggleStatus,
  onTogglePriority,
  onToggleLabel,
  onSortChange,
  onClearFilters,
}: FilterBarProps) {
  const [openMenu, setOpenMenu] = useState<ActiveDropdown>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    function handleOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc, true);
    };
  }, [openMenu]);

  const activeFilterCount =
    filters.statuses.length +
    filters.priorities.length +
    filters.labels.length +
    (filters.search.trim() ? 1 : 0);

  const isFiltered = hasActiveFilters(filters);
  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === filters.sortBy)?.label ?? 'Manual Order';

  return (
    <div
      ref={barRef}
      className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline bg-canvas px-3 py-2 sm:px-5"
    >
      {/* Left: Search + Multi-criteria Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-ink-muted" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search issues or SF-101..."
            aria-label="Search issues"
            className="h-8 w-48 rounded-lg border border-border-hairline bg-surface pl-8 pr-7 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none sm:w-64"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 rounded p-0.5 text-ink-muted hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-2 hidden rounded border border-border-hairline bg-surface-2 px-1 font-mono text-[10px] text-ink-muted sm:inline">
              /
            </span>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'status' ? null : 'status'))
            }
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition',
              filters.statuses.length > 0
                ? 'border-accent-border bg-accent-soft text-accent'
                : 'border-border-hairline bg-surface text-ink-secondary hover:border-border-strong hover:text-ink',
            )}
          >
            <Filter className="h-3 w-3" />
            <span>Status</span>
            {filters.statuses.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.2 font-mono text-[10px] text-white tabular-nums">
                {filters.statuses.length}
              </span>
            )}
          </button>

          {openMenu === 'status' && (
            <div
              className="animate-sf-fade-in absolute left-0 top-full z-30 mt-1.5 w-48 rounded-lg border border-border-strong bg-surface p-1"
              style={{ boxShadow: 'var(--sf-shadow-lg)' }}
            >
              {STATUS_ORDER.map((status) => {
                const selected = filters.statuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onToggleStatus(status)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <StatusIcon status={status} />
                      <span>{STATUS_META[status].label}</span>
                    </span>
                    {selected && <Check className="h-3.5 w-3.5 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'priority' ? null : 'priority'))
            }
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition',
              filters.priorities.length > 0
                ? 'border-accent-border bg-accent-soft text-accent'
                : 'border-border-hairline bg-surface text-ink-secondary hover:border-border-strong hover:text-ink',
            )}
          >
            <span>Priority</span>
            {filters.priorities.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.2 font-mono text-[10px] text-white tabular-nums">
                {filters.priorities.length}
              </span>
            )}
          </button>

          {openMenu === 'priority' && (
            <div
              className="animate-sf-fade-in absolute left-0 top-full z-30 mt-1.5 w-44 rounded-lg border border-border-strong bg-surface p-1"
              style={{ boxShadow: 'var(--sf-shadow-lg)' }}
            >
              {PRIORITY_ORDER.map((priority) => {
                const selected = filters.priorities.includes(priority);
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => onTogglePriority(priority)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <PriorityIcon priority={priority} />
                      <span>{PRIORITY_META[priority].label}</span>
                    </span>
                    {selected && <Check className="h-3.5 w-3.5 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Label Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'label' ? null : 'label'))
            }
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition',
              filters.labels.length > 0
                ? 'border-accent-border bg-accent-soft text-accent'
                : 'border-border-hairline bg-surface text-ink-secondary hover:border-border-strong hover:text-ink',
            )}
          >
            <Tag className="h-3 w-3" />
            <span>Label</span>
            {filters.labels.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.2 font-mono text-[10px] text-white tabular-nums">
                {filters.labels.length}
              </span>
            )}
          </button>

          {openMenu === 'label' && (
            <div
              className="animate-sf-fade-in absolute left-0 top-full z-30 mt-1.5 w-44 rounded-lg border border-border-strong bg-surface p-1"
              style={{ boxShadow: 'var(--sf-shadow-lg)' }}
            >
              {LABEL_OPTIONS.map((label) => {
                const selected = filters.labels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onToggleLabel(label)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: LABEL_META[label].color }}
                      />
                      <span>{label}</span>
                    </span>
                    {selected && <Check className="h-3.5 w-3.5 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active filter reset */}
        {isFiltered && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border-hairline bg-surface-2 px-2.5 text-xs text-ink-secondary transition hover:border-border-strong hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Right: Sort Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpenMenu((prev) => (prev === 'sort' ? null : 'sort'))
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-hairline bg-surface px-2.5 text-xs font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
        >
          <ArrowUpDown className="h-3 w-3 text-ink-muted" />
          <span className="hidden sm:inline text-ink-muted">Sort:</span>
          <span className="text-ink">{currentSortLabel}</span>
        </button>

        {openMenu === 'sort' && (
          <div
            className="animate-sf-fade-in absolute right-0 top-full z-30 mt-1.5 w-44 rounded-lg border border-border-strong bg-surface p-1"
            style={{ boxShadow: 'var(--sf-shadow-lg)' }}
          >
            {SORT_OPTIONS.map((option) => {
              const active = filters.sortBy === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSortChange(option.id);
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
                >
                  <span>{option.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
