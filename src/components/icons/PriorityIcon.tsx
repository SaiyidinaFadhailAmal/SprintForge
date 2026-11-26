import type { IssuePriority } from '../../types';
import { cn } from '../../utils/cn';

interface PriorityIconProps {
  priority: IssuePriority;
  className?: string;
}

export function PriorityIcon({ priority, className }: PriorityIconProps) {
  if (priority === 'urgent') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className={cn('h-3.5 w-3.5 shrink-0 text-red-500', className)}
        aria-hidden="true"
      >
        <rect x="2" y="2" width="12" height="12" rx="3" fill="currentColor" />
        <path
          d="M8 4.8V8.8"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.2" r="0.9" fill="#FFFFFF" />
      </svg>
    );
  }

  const activeBars = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
  const activeColor =
    priority === 'high'
      ? 'text-orange-500'
      : priority === 'medium'
        ? 'text-amber-400'
        : 'text-zinc-500';

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn('h-3.5 w-3.5 shrink-0', activeColor, className)}
      aria-hidden="true"
    >
      <rect
        x="2.2"
        y="9.5"
        width="2.5"
        height="4"
        rx="0.75"
        fill="currentColor"
      />
      <rect
        x="6.75"
        y="6.2"
        width="2.5"
        height="7.3"
        rx="0.75"
        fill="currentColor"
        fillOpacity={activeBars >= 2 ? 1 : 0.25}
      />
      <rect
        x="11.3"
        y="3"
        width="2.5"
        height="10.5"
        rx="0.75"
        fill="currentColor"
        fillOpacity={activeBars >= 3 ? 1 : 0.25}
      />
    </svg>
  );
}
