import { LABEL_META } from '../../data/constants';
import type { IssueLabel, StoryPoints } from '../../types';
import { cn } from '../../utils/cn';

export function LabelBadge({
  label,
  compact = false,
}: {
  label: IssueLabel;
  compact?: boolean;
}) {
  const meta = LABEL_META[label];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium leading-none whitespace-nowrap',
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        meta.badgeClass,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.id}
    </span>
  );
}

export function StoryPointsBadge({
  points,
  compact = false,
}: {
  points: StoryPoints;
  compact?: boolean;
}) {
  return (
    <span
      title={`${points} story ${points === 1 ? 'point' : 'points'}`}
      className={cn(
        'inline-flex items-center gap-1 rounded border border-border-hairline bg-surface-2 font-mono text-ink-secondary tabular-nums',
        compact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs',
      )}
    >
      <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-accent/80" />
      <span>{points}</span>
    </span>
  );
}

export function Kbd({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border-strong bg-surface-2 px-1.5 font-mono text-[10px] font-medium text-ink-secondary',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
