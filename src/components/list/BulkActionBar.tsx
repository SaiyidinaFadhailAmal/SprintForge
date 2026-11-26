import { ChevronUp, Trash2, X } from 'lucide-react';
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from '../../data/constants';
import type { IssuePriority, IssueStatus } from '../../types';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';
import { QuickMenu, type QuickMenuOption } from '../ui/QuickMenu';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatus: (status: IssueStatus) => void;
  onBulkPriority: (priority: IssuePriority) => void;
  onBulkDelete: () => void;
}

const statusOptions: readonly QuickMenuOption<IssueStatus>[] =
  STATUS_ORDER.map((status) => ({
    value: status,
    label: STATUS_META[status].label,
    icon: <StatusIcon status={status} />,
  }));

const priorityOptions: readonly QuickMenuOption<IssuePriority>[] =
  PRIORITY_ORDER.map((priority) => ({
    value: priority,
    label: PRIORITY_META[priority].label,
    icon: <PriorityIcon priority={priority} />,
  }));

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkStatus,
  onBulkPriority,
  onBulkDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="animate-sf-slide-up fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs"
        style={{ boxShadow: 'var(--sf-shadow-lg)' }}
      >
        <div className="flex items-center gap-2 pr-1 border-r border-border-hairline">
          <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 font-mono text-[11px] font-semibold text-white tabular-nums">
            {selectedCount}
          </span>
          <span className="font-medium text-ink">selected</span>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            className="rounded p-1 text-ink-muted transition hover:bg-surface-hover hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <QuickMenu
          ariaLabel="Bulk change status"
          options={statusOptions}
          selectedValues={[]}
          onSelect={onBulkStatus}
          direction="up"
          widthClass="w-44"
          trigger={
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-surface-2 px-2.5 py-1.5 font-medium text-ink transition hover:border-border-strong hover:bg-surface-hover">
              <span>Set Status</span>
              <ChevronUp className="h-3.5 w-3.5 text-ink-muted" />
            </span>
          }
        />

        <QuickMenu
          ariaLabel="Bulk change priority"
          options={priorityOptions}
          selectedValues={[]}
          onSelect={onBulkPriority}
          direction="up"
          widthClass="w-40"
          trigger={
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-surface-2 px-2.5 py-1.5 font-medium text-ink transition hover:border-border-strong hover:bg-surface-hover">
              <span>Set Priority</span>
              <ChevronUp className="h-3.5 w-3.5 text-ink-muted" />
            </span>
          }
        />

        <button
          type="button"
          onClick={onBulkDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/12 px-2.5 py-1.5 font-medium text-rose-400 transition hover:bg-rose-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
