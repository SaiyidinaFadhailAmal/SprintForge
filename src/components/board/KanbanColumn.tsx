import { Plus } from 'lucide-react';
import { type DragEvent, useRef } from 'react';
import { STATUS_META } from '../../data/constants';
import type { Issue, IssueStatus } from '../../types';
import { cn } from '../../utils/cn';
import { StatusIcon } from '../icons/StatusIcon';
import { IssueCard } from './IssueCard';

export interface DropTargetState {
  status: IssueStatus;
  index: number;
}

interface KanbanColumnProps {
  status: IssueStatus;
  issues: readonly Issue[];
  selectedIssueId: string | null;
  draggedIssueId: string | null;
  dropTarget: DropTargetState | null;
  hasActiveFilters: boolean;
  onSelectIssue: (issueId: string) => void;
  onCreateInStatus: (status: IssueStatus) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, issueId: string) => void;
  onDragEnd: () => void;
  onUpdateDropTarget: (target: DropTargetState | null) => void;
  onDropAtTarget: (
    status: IssueStatus,
    index: number,
    fallbackId?: string | null,
  ) => void;
}

export function KanbanColumn({
  status,
  issues,
  selectedIssueId,
  draggedIssueId,
  dropTarget,
  hasActiveFilters,
  onSelectIssue,
  onCreateInStatus,
  onDragStart,
  onDragEnd,
  onUpdateDropTarget,
  onDropAtTarget,
}: KanbanColumnProps) {
  const meta = STATUS_META[status];
  const totalPoints = issues.reduce((sum, issue) => sum + issue.storyPoints, 0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const isTargetColumn = dropTarget?.status === status;

  const computeDropIndex = (clientY: number): number => {
    const container = listRef.current;
    if (!container) return issues.length;

    const cardEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-issue-id]'),
    );

    let index = 0;
    for (const el of cardEls) {
      const cardId = el.getAttribute('data-issue-id');
      if (cardId === draggedIssueId) continue;
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (clientY > midY) {
        index += 1;
      }
    }
    return index;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    const hasPayload =
      draggedIssueId !== null || e.dataTransfer.types.includes('text/plain');
    if (!hasPayload) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const nextIndex = computeDropIndex(e.clientY);
    if (
      !dropTarget ||
      dropTarget.status !== status ||
      dropTarget.index !== nextIndex
    ) {
      onUpdateDropTarget({ status, index: nextIndex });
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedId = draggedIssueId ?? e.dataTransfer.getData('text/plain');
    const targetIndex =
      dropTarget && dropTarget.status === status
        ? dropTarget.index
        : computeDropIndex(e.clientY);
    onDropAtTarget(status, targetIndex, droppedId || null);
  };

  const visibleWithoutDragged = issues.filter((i) => i.id !== draggedIssueId);

  return (
    <section
      aria-label={`${meta.label} column`}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const outside =
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom;
        if (outside && dropTarget?.status === status) {
          onUpdateDropTarget(null);
        }
      }}
      onDrop={handleDrop}
      className={cn(
        'flex h-full w-[288px] shrink-0 flex-col rounded-xl border transition-colors duration-150 sm:w-[300px]',
        isTargetColumn
          ? 'border-accent/60 bg-accent-soft/20'
          : 'border-border-hairline bg-surface/40',
      )}
    >
      {/* Column Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-hairline px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <StatusIcon status={status} />
          <h2 className="truncate text-xs font-semibold text-ink">
            {meta.label}
          </h2>
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary tabular-nums">
            {issues.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            title={`${totalPoints} total story points`}
            className="rounded border border-border-hairline bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-muted tabular-nums"
          >
            {totalPoints} pt
          </span>
          <button
            type="button"
            onClick={() => onCreateInStatus(status)}
            title={`Add issue to ${meta.label}`}
            aria-label={`Add issue to ${meta.label}`}
            className="rounded-md p-1 text-ink-muted transition hover:bg-surface-hover hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Column Card List */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 space-y-2 overflow-y-auto sf-scrollbar p-2.5"
      >
        {issues.length === 0 && !isTargetColumn && (
          <div className="flex h-28 flex-col items-center justify-center rounded-lg border border-dashed border-border-hairline/80 px-3 text-center">
            <p className="text-xs text-ink-muted">
              {hasActiveFilters
                ? 'No matching issues'
                : `No issues in ${meta.label}`}
            </p>
            {!hasActiveFilters && (
              <button
                type="button"
                onClick={() => onCreateInStatus(status)}
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-border-hairline bg-surface px-2 py-1 text-[11px] font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
              >
                <Plus className="h-3 w-3" />
                Add issue
              </button>
            )}
          </div>
        )}

        {issues.map((issue) => {
          const idxWithoutDragged = visibleWithoutDragged.findIndex(
            (i) => i.id === issue.id,
          );
          const showIndicatorBefore =
            isTargetColumn &&
            issue.id !== draggedIssueId &&
            dropTarget.index === idxWithoutDragged;

          return (
            <div key={issue.id}>
              {showIndicatorBefore && <DropLine />}
              <IssueCard
                issue={issue}
                isSelected={selectedIssueId === issue.id}
                isDragging={draggedIssueId === issue.id}
                onSelect={onSelectIssue}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          );
        })}

        {isTargetColumn &&
          dropTarget.index >= visibleWithoutDragged.length && <DropLine />}
      </div>
    </section>
  );
}

function DropLine() {
  return (
    <div className="my-1.5 flex items-center gap-1" aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-accent" />
      <div className="h-0.5 flex-1 rounded-full bg-accent shadow-[0_0_8px_rgba(99,102,241,0.75)]" />
    </div>
  );
}
