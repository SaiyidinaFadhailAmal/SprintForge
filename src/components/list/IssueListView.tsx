import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { STATUS_META, STATUS_ORDER } from '../../data/constants';
import type { Issue, IssuePriority, IssueStatus } from '../../types';
import { StatusIcon } from '../icons/StatusIcon';
import { EmptyState } from '../ui/EmptyState';
import { BulkActionBar } from './BulkActionBar';
import { IssueListRow } from './IssueListRow';

interface IssueListViewProps {
  issues: readonly Issue[];
  totalIssuesCount: number;
  selectedIssueId: string | null;
  selectedBulkIds: readonly string[];
  hasActiveFilters: boolean;
  onToggleBulkId: (issueId: string) => void;
  onSetBulkIds: (ids: string[]) => void;
  onClearBulkSelection: () => void;
  onOpenDrawer: (issueId: string) => void;
  onChangeStatus: (issueId: string, status: IssueStatus) => void;
  onChangePriority: (issueId: string, priority: IssuePriority) => void;
  onBulkStatus: (status: IssueStatus) => void;
  onBulkPriority: (priority: IssuePriority) => void;
  onBulkDelete: () => void;
  onCreateInStatus: (status: IssueStatus) => void;
  onClearFilters: () => void;
}

export function IssueListView({
  issues,
  totalIssuesCount,
  selectedIssueId,
  selectedBulkIds,
  hasActiveFilters,
  onToggleBulkId,
  onSetBulkIds,
  onClearBulkSelection,
  onOpenDrawer,
  onChangeStatus,
  onChangePriority,
  onBulkStatus,
  onBulkPriority,
  onBulkDelete,
  onCreateInStatus,
  onClearFilters,
}: IssueListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<IssueStatus, boolean>
  >({
    backlog: false,
    todo: false,
    in_progress: false,
    in_review: false,
    done: false,
  });

  const bulkSet = new Set(selectedBulkIds);

  const toggleGroupCollapsed = (status: IssueStatus) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  if (issues.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <EmptyState
            title={
              totalIssuesCount === 0
                ? 'No issues created yet'
                : 'No issues match your filters'
            }
            description={
              totalIssuesCount === 0
                ? 'Create your first issue to start organizing tasks in List view.'
                : 'Clear your active filters or create a new issue.'
            }
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateIssue={() => onCreateInStatus('todo')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-y-auto sf-scrollbar p-3 pb-24 sm:p-5 sm:pb-24">
      <div className="mx-auto max-w-6xl space-y-4">
        {STATUS_ORDER.map((status) => {
          const groupIssues = issues.filter((issue) => issue.status === status);
          if (groupIssues.length === 0 && hasActiveFilters) {
            return null;
          }

          const isCollapsed = collapsedGroups[status];
          const meta = STATUS_META[status];
          const totalPoints = groupIssues.reduce(
            (sum, item) => sum + item.storyPoints,
            0,
          );
          const groupIds = groupIssues.map((i) => i.id);
          const allGroupSelected =
            groupIds.length > 0 && groupIds.every((id) => bulkSet.has(id));

          const handleToggleGroupSelect = () => {
            if (allGroupSelected) {
              onSetBulkIds(
                selectedBulkIds.filter((id) => !groupIds.includes(id)),
              );
            } else {
              const merged = new Set([...selectedBulkIds, ...groupIds]);
              onSetBulkIds(Array.from(merged));
            }
          };

          return (
            <section
              key={status}
              className="rounded-xl border border-border-hairline bg-surface"
            >
              {/* Collapsible Group Header */}
              <div
                className={`flex items-center justify-between gap-2 bg-surface-2/50 px-3 py-2 sm:px-4 ${
                  isCollapsed
                    ? 'rounded-xl'
                    : 'rounded-t-xl border-b border-border-hairline'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={allGroupSelected}
                    disabled={groupIssues.length === 0}
                    onChange={handleToggleGroupSelect}
                    aria-label={`Select all ${meta.label} issues`}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-border-strong accent-accent disabled:opacity-30"
                  />

                  <button
                    type="button"
                    onClick={() => toggleGroupCollapsed(status)}
                    className="flex items-center gap-2 text-left text-xs font-semibold text-ink hover:text-accent transition"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                    )}
                    <StatusIcon status={status} />
                    <span>{meta.label}</span>
                  </button>

                  <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-secondary tabular-nums">
                    {groupIssues.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                    {totalPoints} pt
                  </span>
                  <button
                    type="button"
                    onClick={() => onCreateInStatus(status)}
                    title={`Create issue in ${meta.label}`}
                    className="rounded-md p-1 text-ink-muted transition hover:bg-surface-hover hover:text-ink"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Group Rows */}
              {!isCollapsed && (
                <div>
                  {groupIssues.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-ink-muted">
                      No issues in {meta.label}.{' '}
                      <button
                        type="button"
                        onClick={() => onCreateInStatus(status)}
                        className="font-medium text-accent hover:underline"
                      >
                        Create one
                      </button>
                    </div>
                  ) : (
                    groupIssues.map((issue) => (
                      <IssueListRow
                        key={issue.id}
                        issue={issue}
                        checked={bulkSet.has(issue.id)}
                        isSelectedInDrawer={selectedIssueId === issue.id}
                        onToggleCheck={onToggleBulkId}
                        onOpenDrawer={onOpenDrawer}
                        onChangeStatus={onChangeStatus}
                        onChangePriority={onChangePriority}
                      />
                    ))
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <BulkActionBar
        selectedCount={selectedBulkIds.length}
        onClearSelection={onClearBulkSelection}
        onBulkStatus={onBulkStatus}
        onBulkPriority={onBulkPriority}
        onBulkDelete={onBulkDelete}
      />
    </div>
  );
}
