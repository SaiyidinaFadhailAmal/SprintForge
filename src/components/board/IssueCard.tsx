import { Calendar, CheckSquare } from 'lucide-react';
import { type DragEvent, useRef } from 'react';
import type { Issue } from '../../types';
import { cn } from '../../utils/cn';
import { formatDueDate, isDueSoon, isOverdue } from '../../utils/formatters';
import { PriorityIcon } from '../icons/PriorityIcon';
import { LabelBadge, StoryPointsBadge } from '../ui/Badge';

interface IssueCardProps {
  issue: Issue;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (issueId: string) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, issueId: string) => void;
  onDragEnd: () => void;
}

export function IssueCard({
  issue,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onDragEnd,
}: IssueCardProps) {
  const dragActiveRef = useRef(false);
  const completedSubTasks = issue.subTasks.filter((st) => st.completed).length;
  const totalSubTasks = issue.subTasks.length;
  const overdue = isOverdue(issue.dueDate, issue.status);
  const dueSoon = isDueSoon(issue.dueDate, issue.status);

  return (
    <div
      draggable
      data-issue-id={issue.id}
      onDragStart={(e) => {
        dragActiveRef.current = true;
        onDragStart(e, issue.id);
      }}
      onDragEnd={() => {
        onDragEnd();
        window.setTimeout(() => {
          dragActiveRef.current = false;
        }, 60);
      }}
      onClick={() => {
        if (dragActiveRef.current) return;
        onSelect(issue.id);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(issue.id);
        }
      }}
      className={cn(
        'group cursor-grab active:cursor-grabbing rounded-xl border bg-surface p-3 text-left transition-all duration-150 select-none',
        isSelected
          ? 'border-accent ring-1 ring-accent/40'
          : 'border-border-hairline hover:border-border-strong hover:bg-surface-hover/50',
        isDragging && 'opacity-40 scale-[0.98]',
      )}
      style={{ boxShadow: 'var(--sf-shadow-sm)' }}
    >
      {/* Top Row: ID + Priority + Story Points */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PriorityIcon priority={issue.priority} />
          <span className="font-mono text-[11px] font-medium text-ink-muted tabular-nums">
            {issue.id}
          </span>
        </div>
        <StoryPointsBadge points={issue.storyPoints} compact />
      </div>

      {/* Title */}
      <h3 className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-ink">
        {issue.title}
      </h3>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {issue.labels.map((label) => (
            <LabelBadge key={label} label={label} compact />
          ))}
        </div>
      )}

      {/* Footer Meta: Subtasks & Due Date */}
      {(totalSubTasks > 0 || issue.dueDate) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-hairline/70 pt-2 text-[11px] text-ink-muted">
          {totalSubTasks > 0 ? (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3 w-3 text-ink-muted" />
              <span className="font-mono tabular-nums">
                {completedSubTasks}/{totalSubTasks}
              </span>
              <div className="h-1 w-10 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    completedSubTasks === totalSubTasks
                      ? 'bg-emerald-500'
                      : 'bg-accent',
                  )}
                  style={{
                    width: `${Math.round((completedSubTasks / totalSubTasks) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <span />
          )}

          {issue.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono tabular-nums',
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
          )}
        </div>
      )}
    </div>
  );
}
