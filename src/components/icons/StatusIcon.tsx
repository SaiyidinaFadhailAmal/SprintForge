import type { IssueStatus } from '../../types';
import { cn } from '../../utils/cn';

interface StatusIconProps {
  status: IssueStatus;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  switch (status) {
    case 'backlog':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={cn('h-4 w-4 shrink-0 text-zinc-500', className)}
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="5.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2.2 2.2"
          />
        </svg>
      );

    case 'todo':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={cn('h-4 w-4 shrink-0 text-zinc-400', className)}
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="5.75"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'in_progress':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={cn('h-4 w-4 shrink-0 text-amber-500', className)}
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="5.75"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 4.25A3.75 3.75 0 0 1 8 11.75V4.25Z"
            fill="currentColor"
          />
        </svg>
      );

    case 'in_review':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={cn('h-4 w-4 shrink-0 text-indigo-500', className)}
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="5.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
          <path
            d="M8 2.25A5.75 5.75 0 1 1 2.25 8"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <circle cx="8" cy="8" r="2.1" fill="currentColor" />
        </svg>
      );

    case 'done':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={cn('h-4 w-4 shrink-0 text-emerald-500', className)}
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6.25" fill="currentColor" />
          <path
            d="M5.4 8.2L7.15 9.95L10.75 6.2"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
