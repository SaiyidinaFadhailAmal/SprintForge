import {
  AlertCircle,
  BarChart3,
  Columns3,
  Database,
  Flame,
  ListTodo,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react';
import type { ThemeMode, WorkspaceView } from '../../types';
import { cn } from '../../utils/cn';
import { SprintForgeLogo } from '../icons/SprintForgeLogo';
import { Kbd } from '../ui/Badge';

interface SidebarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenCreate: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onFilterUrgent: () => void;
  onFilterInProgress: () => void;
  onClearFilters: () => void;
  counts: {
    total: number;
    urgentOpen: number;
    inProgress: number;
    done: number;
  };
}

export function Sidebar({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  theme,
  onToggleTheme,
  onOpenCreate,
  onOpenCommandPalette,
  onOpenSettings,
  onFilterUrgent,
  onFilterInProgress,
  onClearFilters,
  counts,
}: SidebarProps) {
  const navItems: ReadonlyArray<{
    id: WorkspaceView;
    label: string;
    icon: typeof Columns3;
    badge?: number;
  }> = [
    { id: 'board', label: 'Board', icon: Columns3, badge: counts.total },
    { id: 'list', label: 'List', icon: ListTodo, badge: counts.total },
    { id: 'analytics', label: 'Sprint Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (view: WorkspaceView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarBody = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-hairline bg-surface select-none transition-[width] duration-200',
        collapsed ? 'w-[62px]' : 'w-[244px]',
      )}
    >
      {/* Workspace Brand Header */}
      <div
        className={cn(
          'flex h-12 shrink-0 items-center border-b border-border-hairline',
          collapsed ? 'justify-center px-2' : 'justify-between px-3.5',
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <SprintForgeLogo />
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold tracking-tight text-ink">
                  SprintForge
                </span>
                <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent">
                  C14
                </span>
              </div>
              <p className="truncate text-[11px] text-ink-muted">
                Core Platform · Q4
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-md p-1 text-ink-muted hover:bg-surface-hover hover:text-ink md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Quick Actions */}
      <div className={cn('space-y-1.5 p-2.5', collapsed && 'px-2')}>
        <button
          type="button"
          onClick={() => {
            onOpenCreate();
            onCloseMobile();
          }}
          title="Create New Issue (C)"
          className={cn(
            'flex w-full items-center rounded-lg bg-accent text-xs font-medium text-white shadow-xs transition hover:bg-accent-hover',
            collapsed ? 'justify-center p-2' : 'justify-between px-3 py-2',
          )}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>New Issue</span>}
          </span>
          {!collapsed && (
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
              C
            </kbd>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenCommandPalette();
            onCloseMobile();
          }}
          title="Command Palette (Ctrl/Cmd+K)"
          className={cn(
            'flex w-full items-center rounded-lg border border-border-hairline bg-surface-2 text-xs text-ink-secondary transition hover:border-border-strong hover:text-ink',
            collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5',
          )}
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
            {!collapsed && <span>Quick find...</span>}
          </span>
          {!collapsed && <Kbd>⌘K</Kbd>}
        </button>
      </div>

      {/* Views Navigation */}
      <div className="flex-1 overflow-y-auto sf-scrollbar px-2.5 py-1">
        {!collapsed && (
          <div className="px-2 pb-1.5 pt-2 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
            Workspace
          </div>
        )}
        <nav aria-label="Primary Workspace Views" className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={cn(
                  'flex w-full items-center rounded-lg text-xs font-medium transition',
                  collapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2',
                  active
                    ? 'bg-accent-soft text-ink'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
                )}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      active ? 'text-accent' : 'text-ink-muted',
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </span>
                {!collapsed && item.badge !== undefined && (
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-muted tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Focus Presets */}
        {!collapsed && (
          <>
            <div className="mt-5 px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
              Quick Focus
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onClearFilters();
                  onCloseMobile();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
              >
                <span className="flex items-center gap-2.5">
                  <Flame className="h-3.5 w-3.5 text-indigo-400" />
                  <span>All Sprint Issues</span>
                </span>
                <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                  {counts.total}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterUrgent();
                  onCloseMobile();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
              >
                <span className="flex items-center gap-2.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                  <span>Urgent Issues</span>
                </span>
                <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                  {counts.urgentOpen}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterInProgress();
                  onCloseMobile();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink"
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Active In Progress</span>
                </span>
                <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                  {counts.inProgress}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="border-t border-border-hairline p-2.5 space-y-1">
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={cn(
            'flex w-full items-center rounded-lg text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink',
            collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5',
          )}
        >
          <span className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="h-3.5 w-3.5 text-indigo-400" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-amber-500" />
            )}
            {!collapsed && (
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            )}
          </span>
          {!collapsed && (
            <span className="rounded border border-border-hairline bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-muted">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          title="Settings & Data (Export / Import / Reset)"
          className={cn(
            'flex w-full items-center rounded-lg text-xs text-ink-secondary transition hover:bg-surface-hover hover:text-ink',
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-1.5',
          )}
        >
          <Database className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          {!collapsed && <span>Settings & Data</span>}
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={cn(
            'hidden md:flex w-full items-center rounded-lg text-xs text-ink-muted transition hover:bg-surface-hover hover:text-ink',
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-1.5',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <>
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <div className="hidden h-full shrink-0 md:block">{sidebarBody}</div>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="animate-sf-fade-in fixed inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarBody}</div>
        </div>
      )}
    </>
  );
}
