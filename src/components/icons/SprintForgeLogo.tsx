import { cn } from '../../utils/cn';

interface SprintForgeLogoProps {
  className?: string;
}

export function SprintForgeLogo({ className }: SprintForgeLogoProps) {
  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent shadow-xs',
        className,
      )}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M11.2 2.5L4.5 11.2H9.6L8.8 17.5L15.5 8.8H10.4L11.2 2.5Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
