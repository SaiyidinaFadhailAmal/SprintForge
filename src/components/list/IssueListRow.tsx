import { Calendar, CheckSquare, ChevronDown } from 'lucide-react';
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from '../../data/constants';
import type { Issue, IssuePriority, IssueStatus } from '../../types';
import { cn } from '../../utils/cn';
import { formatDueDate, isDueSoon, isOverdue } from '../../utils/formatters';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';
import { LabelBadge, StoryPointsBadge } from '../ui/Badge';
import { QuickMenu, type QuickMenuOption } from '../ui/QuickMenu';

interface IssueListRowProps {
  issue: Issue;
  checked: boolean;
  isSelectedInDrawer: boolean;
  onToggleCheck: (issueId: string) => void;
  onOpenDrawer: (issueId: string) => void;
  onChangeStatus: (issueId: string, status: IssueStatus) => void;
  onChangePriority: (issueId: string, priority: IssuePriority) => void;
}

const statusMenuOptions: readonly QuickMenuOption<IssueStatus>[] =
  STATUS_ORDER.map((status) => ({
    value: status,
    label: STATUS_META[status].label,
    icon: <StatusIcon status={status} />,
  }));

const priorityMenuOptions: readonly QuickMenuOption<IssuePriority>[] =
  PRIORITY_ORDER.map((priority) => ({
    value: priority,
    label: PRIORITY_META[priority].label,
    icon: <PriorityIcon priority={priority} />,
  }));

export function IssueListRow({
  issue,
  checked,
  isSelectedInDrawer,
  onToggleCheck,
  onOpenDrawer,
  onChangeStatus,
  onChangePriority,
}: IssueListRowProps) {
  const completedSubTasks = issue.subTasks.filter((st) => st.completed).length;
  const totalSubTasks = issue.subTasks.length;
  const overdue = isOverdue(issue.dueDate, issue.status);
  const dueSoon = isDueSoon(issue.dueDate, issue.status);

  return (
    <div
      onClick={() => onOpenDrawer(issue.id)}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDrawer(issue.id);
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center gap-3 border-b border-border-hairline px-3 py-2.5 text-xs transition last:rounded-b-xl last:border-b-0 sm:px-4',
        checked
          ? 'bg-accent-soft/45'
          : isSelectedInDrawer
            ? 'bg-surface-hover'
            : 'hover:bg-surface-hover/65',
      )}
    >
      {/* Multi-select checkbox */}
      <div
        className="flex shrink-0 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggleCheck(issue.id)}
          aria-label={`Select ${issue.id}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-border-strong accent-accent"
        />
      </div>

      {/* Inline Priority Quick-Edit Dropdown */}
      <QuickMenu
        ariaLabel={`Change priority for ${issue.id}`}
        options={priorityMenuOptions}
        selectedValues={[issue.priority]}
        onSelect={(priority) => onChangePriority(issue.id, priority)}
        widthClass="w-36"
        trigger={
          <span
            title={`Priority: ${PRIORITY_META[issue.priority].label}`}
            className="inline-flex h-6 items-center gap-1 rounded-md border border-transparent px-1.5 transition hover:border-border-hairline hover:bg-surface-2"
          >
            <PriorityIcon priority={issue.priority} />
            <span className="hidden lg:inline text-[11px] text-ink-secondary">
              {PRIORITY_META[issue.priority].label}
            </span>
            <ChevronDown className="h-3 w-3 text-ink-muted opacity-0 transition group-hover:opacity-100" />
          </span>
        }
      />

      {/* Issue ID */}
      <span className="w-14 shrink-0 font-mono text-[11px] font-medium text-ink-muted tabular-nums">
        {issue.id}
      </span>

      {/* Inline Status Quick-Edit Dropdown */}
      <QuickMenu
        ariaLabel={`Change status for ${issue.id}`}
        options={statusMenuOptions}
        selectedValues={[issue.status]}
        onSelect={(status) => onChangeStatus(issue.id, status)}
        widthClass="w-40"
        trigger={
          <span
            title={`Status: ${STATUS_META[issue.status].label}`}
            className="inline-flex h-6 items-center gap-1.5 rounded-md border border-border-hairline/70 bg-surface-2/60 px-2 text-[11px] font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
          >
            <StatusIcon status={issue.status} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {STATUS_META[issue.status].shortLabel}
            </span>
            <ChevronDown className="h-3 w-3 text-ink-muted" />
          </span>
        }
      />

      {/* Issue Title & Subtasks */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-ink">
            {issue.title}
          </span>
          {totalSubTasks > 0 && (
            <span className="hidden md:inline-flex shrink-0 items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted tabular-nums">
              <CheckSquare className="h-2.5 w-2.5" />
              {completedSubTasks}/{totalSubTasks}
            </span>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="hidden xl:flex shrink-0 items-center gap-1">
        {issue.labels.slice(0, 2).map((label) => (
          <LabelBadge key={label} label={label} compact />
        ))}
        {issue.labels.length > 2 && (
          <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted tabular-nums">
            +{issue.labels.length - 2}
          </span>
        )}
      </div>

      {/* Due Date */}
      <div className="hidden sm:flex w-20 shrink-0 items-center justify-end">
        {issue.dueDate ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-mono text-[11px] tabular-nums',
              overdue
                ? 'text-rose-400 font-medium'
                : dueSoon
                  ? 'text-amber-400'
                  : 'text-ink-muted',
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDueDate(issue.dueDate)}
          </span>
        ) : (
          <span className="text-[11px] text-ink-muted/50">—</span>
        )}
      </div>

      {/* Story Points */}
      <div className="shrink-0">
        <StoryPointsBadge points={issue.storyPoints} compact />
      </div>
    </div>
  );
}
