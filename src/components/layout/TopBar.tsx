import {
  BarChart3,
  Command,
  Columns3,
  ListTodo,
  Menu,
  Moon,
  Plus,
  Sun,
} from 'lucide-react';
import type { ThemeMode, WorkspaceView } from '../../types';
import { cn } from '../../utils/cn';
import { Kbd } from '../ui/Badge';

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenCreate: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  filteredCount: number;
  totalCount: number;
}

const VIEW_TABS: ReadonlyArray<{
  id: WorkspaceView;
  label: string;
  icon: typeof Columns3;
}> = [
  { id: 'board', label: 'Board', icon: Columns3 },
  { id: 'list', label: 'List', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function TopBar({
  activeView,
  onSelectView,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenCreate,
  theme,
  onToggleTheme,
  filteredCount,
  totalCount,
}: TopBarProps) {
  const viewTitle =
    activeView === 'board'
      ? 'Sprint Board'
      : activeView === 'list'
        ? 'Issue List'
        : 'Sprint Analytics';

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border-hairline bg-surface/80 px-3 sm:px-5 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-hairline text-ink-secondary hover:bg-surface-hover hover:text-ink md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <h1 className="whitespace-nowrap text-sm font-semibold tracking-tight text-ink">
            {viewTitle}
          </h1>
          <span className="hidden xl:inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-border-hairline bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-secondary tabular-nums">
            {filteredCount === totalCount
              ? `${totalCount} issues`
              : `${filteredCount} / ${totalCount}`}
          </span>
        </div>
      </div>

      {/* View Switcher + Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <div
          role="tablist"
          aria-label="Workspace view"
          className="inline-flex shrink-0 items-center rounded-lg border border-border-hairline bg-canvas p-0.5"
        >
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectView(tab.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition',
                  active
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                <Icon
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    active ? 'text-accent' : 'text-ink-muted',
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Open Command Palette (Ctrl/Cmd + K)"
          className="hidden xl:inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-hairline bg-surface-2 px-2.5 py-1.5 text-xs text-ink-secondary transition hover:border-border-strong hover:text-ink"
        >
          <Command className="h-3.5 w-3.5 text-ink-muted" />
          <span>Command</span>
          <Kbd>⌘K</Kbd>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-hairline bg-surface-2 text-ink-secondary transition hover:border-border-strong hover:text-ink"
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenCreate}
          title="Create Issue (C)"
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">New Issue</span>
        </button>
      </div>
    </header>
  );
}
