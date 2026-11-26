import {
  AlertCircle,
  BarChart3,
  Columns3,
  CornerDownLeft,
  Database,
  ListTodo,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { PRIORITY_META, STATUS_META } from '../../data/constants';
import type { Issue, ThemeMode, WorkspaceView } from '../../types';
import { cn } from '../../utils/cn';
import { fuzzyMatchScore } from '../../utils/fuzzySearch';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';
import { Kbd } from '../ui/Badge';

interface CommandPaletteModalProps {
  open: boolean;
  issues: readonly Issue[];
  theme: ThemeMode;
  activeView: WorkspaceView;
  onClose: () => void;
  onSelectIssue: (issueId: string) => void;
  onCreateIssue: () => void;
  onSwitchView: (view: WorkspaceView) => void;
  onFilterUrgent: () => void;
  onClearFilters: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onResetDemoData: () => void;
}

interface PaletteEntry {
  id: string;
  section: 'actions' | 'issues';
  label: string;
  subtitle?: string;
  icon: ReactNode;
  shortcut?: string;
  score: number;
  run: () => void;
}

export function CommandPaletteModal({
  open,
  issues,
  theme,
  activeView,
  onClose,
  onSelectIssue,
  onCreateIssue,
  onSwitchView,
  onFilterUrgent,
  onClearFilters,
  onToggleTheme,
  onOpenSettings,
  onResetDemoData,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 15);
    }
  }, [open]);

  const results = useMemo<PaletteEntry[]>(() => {
    const actions: Array<Omit<PaletteEntry, 'score'> & { keywords: string }> = [
      {
        id: 'act-create',
        section: 'actions',
        label: 'Create New Issue',
        subtitle: 'Open issue creation modal',
        keywords: 'create new issue add task c',
        icon: <Plus className="h-4 w-4 text-accent" />,
        shortcut: 'C',
        run: () => {
          onClose();
          onCreateIssue();
        },
      },
      {
        id: 'act-board',
        section: 'actions',
        label: 'Switch to Board View',
        subtitle: activeView === 'board' ? 'Current view' : 'Kanban drag-and-drop columns',
        keywords: 'switch board kanban columns view',
        icon: <Columns3 className="h-4 w-4 text-ink-secondary" />,
        run: () => {
          onSwitchView('board');
          onClose();
        },
      },
      {
        id: 'act-list',
        section: 'actions',
        label: 'Switch to List View',
        subtitle: activeView === 'list' ? 'Current view' : 'Grouped rows with bulk actions',
        keywords: 'switch list table rows bulk view',
        icon: <ListTodo className="h-4 w-4 text-ink-secondary" />,
        run: () => {
          onSwitchView('list');
          onClose();
        },
      },
      {
        id: 'act-analytics',
        section: 'actions',
        label: 'Switch to Sprint Analytics View',
        subtitle: activeView === 'analytics' ? 'Current view' : 'Velocity, breakdown, and workload',
        keywords: 'switch analytics metrics charts sprint progress view',
        icon: <BarChart3 className="h-4 w-4 text-ink-secondary" />,
        run: () => {
          onSwitchView('analytics');
          onClose();
        },
      },
      {
        id: 'act-urgent',
        section: 'actions',
        label: 'Filter Urgent Issues',
        subtitle: 'Show only urgent priority issues',
        keywords: 'filter urgent critical priority high',
        icon: <AlertCircle className="h-4 w-4 text-rose-400" />,
        run: () => {
          onFilterUrgent();
          onClose();
        },
      },
      {
        id: 'act-clear-filters',
        section: 'actions',
        label: 'Clear Active Filters',
        subtitle: 'Reset search, status, priority, and label filters',
        keywords: 'clear reset filters show all issues',
        icon: <X className="h-4 w-4 text-ink-secondary" />,
        run: () => {
          onClearFilters();
          onClose();
        },
      },
      {
        id: 'act-theme',
        section: 'actions',
        label:
          theme === 'dark'
            ? 'Toggle Theme: Switch to Light Mode'
            : 'Toggle Theme: Switch to Dark Mode',
        subtitle: 'Persisted automatically in localStorage',
        keywords: 'toggle theme dark light appearance mode',
        icon:
          theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          ),
        run: () => {
          onToggleTheme();
          onClose();
        },
      },
      {
        id: 'act-settings',
        section: 'actions',
        label: 'Export / Import JSON Data',
        subtitle: 'Open SprintForge backup & data management',
        keywords: 'export import json backup settings data',
        icon: <Database className="h-4 w-4 text-ink-secondary" />,
        run: () => {
          onClose();
          onOpenSettings();
        },
      },
      {
        id: 'act-reset',
        section: 'actions',
        label: 'Reset Demo Data',
        subtitle: 'Restore the 10 realistic software engineering seed issues',
        keywords: 'reset demo seed data restore default',
        icon: <RotateCcw className="h-4 w-4 text-amber-400" />,
        run: () => {
          onResetDemoData();
          onClose();
        },
      },
    ];

    const trimmed = query.trim();

    const matchedActions: PaletteEntry[] = actions
      .map((act) => {
        const s = trimmed
          ? Math.max(
              fuzzyMatchScore(trimmed, act.label),
              fuzzyMatchScore(trimmed, act.keywords) * 0.85,
            )
          : 100;
        return {
          id: act.id,
          section: act.section,
          label: act.label,
          subtitle: act.subtitle,
          icon: act.icon,
          shortcut: act.shortcut,
          score: s,
          run: act.run,
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const matchedIssues: PaletteEntry[] = issues
      .map((issue) => {
        const searchable = `${issue.id} ${issue.title} ${STATUS_META[issue.status].label} ${PRIORITY_META[issue.priority].label} ${issue.labels.join(' ')}`;
        const score = trimmed
          ? Math.max(
              fuzzyMatchScore(trimmed, issue.id) * 1.4,
              fuzzyMatchScore(trimmed, issue.title) * 1.2,
              fuzzyMatchScore(trimmed, searchable),
            )
          : 50;
        return {
          id: `issue-${issue.id}`,
          section: 'issues' as const,
          label: `${issue.id} · ${issue.title}`,
          subtitle: `${STATUS_META[issue.status].label} · ${PRIORITY_META[issue.priority].label} · ${issue.storyPoints} pt`,
          icon: (
            <div className="flex items-center gap-1.5">
              <PriorityIcon priority={issue.priority} />
              <StatusIcon status={issue.status} className="h-3.5 w-3.5" />
            </div>
          ),
          score,
          run: () => {
            onSelectIssue(issue.id);
            onClose();
          },
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, trimmed ? 10 : 6);

    if (!trimmed) {
      return [...matchedActions, ...matchedIssues];
    }

    return [...matchedIssues, ...matchedActions].sort(
      (a, b) => b.score - a.score,
    );
  }, [
    query,
    issues,
    theme,
    activeView,
    onClose,
    onSelectIssue,
    onCreateIssue,
    onSwitchView,
    onFilterUrgent,
    onClearFilters,
    onToggleTheme,
    onOpenSettings,
    onResetDemoData,
  ]);

  if (!open) return null;

  const safeIndex = Math.min(activeIndex, Math.max(0, results.length - 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        results.length === 0 ? 0 : (prev + 1) % results.length,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        results.length === 0 ? 0 : (prev - 1 + results.length) % results.length,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[safeIndex];
      if (target) {
        target.run();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="animate-sf-fade-in fixed inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onKeyDown={handleKeyDown}
        className="animate-sf-slide-up relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface"
        style={{ boxShadow: 'var(--sf-shadow-lg)' }}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 border-b border-border-hairline px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-accent" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search issues (SF-101, auth, postgres) or type a command..."
            aria-label="Command palette search"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(0);
              }}
              aria-label="Clear command search"
              className="rounded p-1 text-ink-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Kbd>Esc</Kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto sf-scrollbar p-2">
          {results.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink-muted">
              No matching issues or commands for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={item.run}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition',
                      isSelected
                        ? 'bg-accent-soft text-ink'
                        : 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex shrink-0 items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-ink">
                          {item.label}
                        </div>
                        {item.subtitle && (
                          <div className="truncate text-[11px] text-ink-muted">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                        {item.section === 'issues' ? 'Issue' : 'Action'}
                      </span>
                      {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
                      {isSelected && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-accent" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-border-hairline bg-surface-2/40 px-4 py-2 text-[11px] text-ink-muted">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd>
              Execute
            </span>
          </div>
          <span className="font-mono tabular-nums">
            {results.length} results
          </span>
        </div>
      </div>
    </div>
  );
}
