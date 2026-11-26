import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Copy,
  History,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  LABEL_META,
  LABEL_OPTIONS,
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  STORY_POINT_OPTIONS,
} from '../../data/constants';
import type {
  Issue,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  StoryPoints,
} from '../../types';
import { cn } from '../../utils/cn';
import {
  formatExactTimestamp,
  formatRelativeTimestamp,
  isDueSoon,
  isOverdue,
} from '../../utils/formatters';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';
import { Kbd } from '../ui/Badge';
import { QuickMenu, type QuickMenuOption } from '../ui/QuickMenu';

interface IssueDetailDrawerProps {
  issue: Issue | null;
  onClose: () => void;
  onUpdateFields: (
    id: string,
    patch: Partial<{
      title: string;
      description: string;
      labels: IssueLabel[];
      storyPoints: StoryPoints;
      dueDate: string | null;
    }>,
  ) => void;
  onChangeStatus: (id: string, status: IssueStatus) => void;
  onChangePriority: (id: string, priority: IssuePriority) => void;
  onAddSubTask: (issueId: string, title: string) => void;
  onToggleSubTask: (issueId: string, subTaskId: string) => void;
  onDeleteSubTask: (issueId: string, subTaskId: string) => void;
  onDeleteIssue: (issueId: string) => void;
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

export function IssueDetailDrawer({
  issue,
  onClose,
  onUpdateFields,
  onChangeStatus,
  onChangePriority,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  onDeleteIssue,
}: IssueDetailDrawerProps) {
  const [titleDraft, setTitleDraft] = useState(issue?.title ?? '');
  const [descriptionDraft, setDescriptionDraft] = useState(
    issue?.description ?? '',
  );
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  if (!issue) return null;

  const completedSubTasks = issue.subTasks.filter((st) => st.completed).length;
  const totalSubTasks = issue.subTasks.length;
  const subTaskProgress =
    totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0;

  const overdue = isOverdue(issue.dueDate, issue.status);
  const dueSoon = isDueSoon(issue.dueDate, issue.status);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setTitleDraft(issue.title);
      return;
    }
    if (trimmed !== issue.title) {
      onUpdateFields(issue.id, { title: trimmed });
    }
  };

  const commitDescription = () => {
    if (descriptionDraft !== issue.description) {
      onUpdateFields(issue.id, { description: descriptionDraft });
    }
  };

  const handleToggleLabel = (label: IssueLabel) => {
    const exists = issue.labels.includes(label);
    const nextLabels = exists
      ? issue.labels.filter((l) => l !== label)
      : [...issue.labels, label];
    onUpdateFields(issue.id, { labels: nextLabels });
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubTaskTitle.trim();
    if (!trimmed) return;
    onAddSubTask(issue.id, trimmed);
    setNewSubTaskTitle('');
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(issue.id);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 1600);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="animate-sf-fade-in fixed inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Issue ${issue.id} details`}
        className="animate-sf-drawer-in relative z-10 flex h-full w-full flex-col border-l border-border-strong bg-surface sm:w-[540px]"
        style={{ boxShadow: 'var(--sf-shadow-lg)' }}
      >
        {/* Top Bar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-hairline px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy Issue ID"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-surface-2 px-2 py-1 font-mono text-xs font-medium text-ink tabular-nums transition hover:border-border-strong"
            >
              <span>{issue.id}</span>
              {copiedId ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-ink-muted" />
              )}
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <Clock className="h-3 w-3" />
              Updated {formatRelativeTimestamp(issue.updatedAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onDeleteIssue(issue.id)}
              title="Delete Issue"
              aria-label="Delete Issue"
              className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-rose-400 transition hover:border-rose-500/30 hover:bg-rose-500/12"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close issue drawer"
              className="inline-flex items-center gap-1.5 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-hover hover:text-ink"
            >
              <Kbd className="hidden sm:inline-flex">Esc</Kbd>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto sf-scrollbar p-5 space-y-6">
          {/* Editable Title & Description */}
          <div className="space-y-3">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              aria-label="Issue title"
              placeholder="Issue title..."
              className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 -mx-2 text-lg font-semibold tracking-tight text-ink placeholder:text-ink-muted focus:border-border-strong focus:bg-canvas/60 focus:outline-none"
            />

            <textarea
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              onBlur={commitDescription}
              rows={4}
              aria-label="Issue description"
              placeholder="Add acceptance criteria, architectural notes, or reproduction steps..."
              className="w-full resize-y rounded-lg border border-border-hairline bg-canvas/50 p-3 text-xs leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          {/* Properties Grid */}
          <div className="rounded-xl border border-border-hairline bg-canvas/40 p-4 space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-muted">
                  Status
                </span>
                <QuickMenu
                  ariaLabel="Change issue status"
                  options={statusOptions}
                  selectedValues={[issue.status]}
                  onSelect={(status) => onChangeStatus(issue.id, status)}
                  align="right"
                  widthClass="w-44"
                  trigger={
                    <span className="inline-flex h-8 min-w-[140px] items-center justify-between gap-2 rounded-lg border border-border-hairline bg-surface px-2.5 text-xs font-medium text-ink transition hover:border-border-strong">
                      <span className="flex items-center gap-2">
                        <StatusIcon status={issue.status} />
                        <span>{STATUS_META[issue.status].label}</span>
                      </span>
                    </span>
                  }
                />
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-muted">
                  Priority
                </span>
                <QuickMenu
                  ariaLabel="Change issue priority"
                  options={priorityOptions}
                  selectedValues={[issue.priority]}
                  onSelect={(priority) => onChangePriority(issue.id, priority)}
                  align="right"
                  widthClass="w-40"
                  trigger={
                    <span className="inline-flex h-8 min-w-[140px] items-center justify-between gap-2 rounded-lg border border-border-hairline bg-surface px-2.5 text-xs font-medium text-ink transition hover:border-border-strong">
                      <span className="flex items-center gap-2">
                        <PriorityIcon priority={issue.priority} />
                        <span>{PRIORITY_META[issue.priority].label}</span>
                      </span>
                    </span>
                  }
                />
              </div>
            </div>

            {/* Story Points */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline/60 pt-3">
              <span className="text-xs font-medium text-ink-muted">
                Story Points
              </span>
              <div className="flex items-center gap-1">
                {STORY_POINT_OPTIONS.map((pts) => {
                  const active = issue.storyPoints === pts;
                  return (
                    <button
                      key={pts}
                      type="button"
                      onClick={() =>
                        onUpdateFields(issue.id, { storyPoints: pts })
                      }
                      className={cn(
                        'h-7 min-w-[30px] rounded-md border px-2 font-mono text-xs font-medium tabular-nums transition',
                        active
                          ? 'border-accent bg-accent text-white'
                          : 'border-border-hairline bg-surface text-ink-secondary hover:border-border-strong hover:text-ink',
                      )}
                    >
                      {pts}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline/60 pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <Calendar className="h-3.5 w-3.5" />
                Due Date
              </span>
              <div className="flex items-center gap-2">
                {overdue && (
                  <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
                    Overdue
                  </span>
                )}
                {dueSoon && !overdue && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                    Due soon
                  </span>
                )}
                <input
                  type="date"
                  value={issue.dueDate ?? ''}
                  onChange={(e) =>
                    onUpdateFields(issue.id, {
                      dueDate: e.target.value ? e.target.value : null,
                    })
                  }
                  aria-label="Issue due date"
                  className="h-8 rounded-lg border border-border-hairline bg-surface px-2.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
                {issue.dueDate && (
                  <button
                    type="button"
                    onClick={() => onUpdateFields(issue.id, { dueDate: null })}
                    title="Clear due date"
                    className="rounded p-1 text-ink-muted hover:bg-surface-hover hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Labels */}
            <div className="border-t border-border-hairline/60 pt-3">
              <span className="block text-xs font-medium text-ink-muted mb-2">
                Labels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LABEL_OPTIONS.map((label) => {
                  const selected = issue.labels.includes(label);
                  const meta = LABEL_META[label];
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleToggleLabel(label)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition',
                        selected
                          ? meta.badgeClass
                          : 'border-border-hairline bg-surface text-ink-muted hover:border-border-strong hover:text-ink',
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: selected ? meta.color : 'currentColor',
                        }}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Sub-tasks Checklist */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-ink-muted" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Sub-tasks
                </h3>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-secondary tabular-nums">
                  {completedSubTasks}/{totalSubTasks}
                </span>
              </div>
              {totalSubTasks > 0 && (
                <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                  {subTaskProgress}%
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {totalSubTasks > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    subTaskProgress === 100 ? 'bg-emerald-500' : 'bg-accent',
                  )}
                  style={{ width: `${subTaskProgress}%` }}
                />
              </div>
            )}

            {/* Sub-tasks List */}
            <div className="space-y-1.5">
              {issue.subTasks.map((subTask) => (
                <div
                  key={subTask.id}
                  className="group flex items-center justify-between gap-2 rounded-lg border border-border-hairline bg-canvas/40 px-3 py-2 text-xs transition hover:border-border-strong"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      onChange={() => onToggleSubTask(issue.id, subTask.id)}
                      className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-border-strong accent-accent"
                    />
                    <span
                      className={cn(
                        'truncate transition',
                        subTask.completed
                          ? 'text-ink-muted line-through'
                          : 'text-ink',
                      )}
                    >
                      {subTask.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteSubTask(issue.id, subTask.id)}
                    aria-label={`Delete sub-task ${subTask.title}`}
                    className="rounded p-1 text-ink-muted opacity-70 transition hover:bg-surface-hover hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Sub-task Form */}
            <form onSubmit={handleAddSubTask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                placeholder="Add a sub-task and press Enter..."
                aria-label="New sub-task title"
                className="h-8 flex-1 rounded-lg border border-border-hairline bg-canvas/50 px-3 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newSubTaskTitle.trim()}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border-hairline bg-surface-2 px-3 text-xs font-medium text-ink transition hover:border-border-strong hover:bg-surface-hover disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </form>
          </section>

          {/* Automatic Activity Log */}
          <section className="space-y-3 border-t border-border-hairline pt-5">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-ink-muted" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Activity Log
              </h3>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-muted tabular-nums">
                {issue.activityLog.length}
              </span>
            </div>

            <div className="relative space-y-3 pl-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border-hairline">
              {issue.activityLog.map((entry) => {
                const dotColor =
                  entry.type === 'created'
                    ? 'bg-emerald-400'
                    : entry.type === 'status_changed'
                      ? 'bg-accent'
                      : entry.type === 'priority_changed'
                        ? 'bg-amber-400'
                        : 'bg-zinc-400';

                return (
                  <div
                    key={entry.id}
                    className="relative flex items-start justify-between gap-3 text-xs"
                  >
                    <span
                      className={cn(
                        'absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface',
                        dotColor,
                      )}
                    />
                    <span className="text-ink-secondary leading-relaxed">
                      {entry.message}
                    </span>
                    <time
                      dateTime={entry.timestamp}
                      title={formatExactTimestamp(entry.timestamp)}
                      className="shrink-0 font-mono text-[11px] text-ink-muted tabular-nums"
                    >
                      {formatRelativeTimestamp(entry.timestamp)}
                    </time>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
