import { useCallback, useMemo, useRef, useState } from 'react';
import { SprintAnalyticsView } from './components/analytics/SprintAnalyticsView';
import { KanbanBoard } from './components/board/KanbanBoard';
import { IssueDetailDrawer } from './components/drawer/IssueDetailDrawer';
import { FilterBar } from './components/layout/FilterBar';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { IssueListView } from './components/list/IssueListView';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { CreateIssueModal } from './components/modals/CreateIssueModal';
import { SettingsDataModal } from './components/modals/SettingsDataModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { DEFAULT_FILTER_STATE } from './data/constants';
import { useIssues } from './hooks/useIssues';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useToasts } from './hooks/useToasts';
import type {
  CreateIssueInput,
  FilterState,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  SortOption,
  WorkspaceView,
} from './types';
import { filterAndSortIssues, hasActiveFilters } from './utils/filterSort';
import {
  loadSidebarCollapsed,
  loadWorkspaceView,
  saveSidebarCollapsed,
  saveWorkspaceView,
} from './utils/storage';

function toggleArrayItem<T>(list: readonly T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((entry) => entry !== item)
    : [...list, item];
}

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, dismissToast } = useToasts();
  const {
    issues,
    nextNumber,
    createIssue,
    updateIssueFields,
    changeIssueStatus,
    changeIssuePriority,
    moveIssue,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    deleteIssues,
    restoreIssues,
    bulkUpdateStatus,
    bulkUpdatePriority,
    importIssues,
    resetDemoData,
  } = useIssues();

  const [activeView, setActiveView] = useState<WorkspaceView>(() =>
    loadWorkspaceView(),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    loadSidebarCollapsed(),
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] =
    useState<IssueStatus>('todo');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectView = useCallback((view: WorkspaceView) => {
    setActiveView(view);
    saveWorkspaceView(view);
  }, []);

  const handleToggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      saveSidebarCollapsed(next);
      return next;
    });
  }, []);

  const filteredIssues = useMemo(
    () => filterAndSortIssues(issues, filters),
    [issues, filters],
  );

  const isFiltered = useMemo(() => hasActiveFilters(filters), [filters]);

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId],
  );

  const sidebarCounts = useMemo(
    () => ({
      total: issues.length,
      urgentOpen: issues.filter(
        (i) => i.priority === 'urgent' && i.status !== 'done',
      ).length,
      inProgress: issues.filter((i) => i.status === 'in_progress').length,
      done: issues.filter((i) => i.status === 'done').length,
    }),
    [issues],
  );

  const handleOpenCreateModal = useCallback((status: IssueStatus = 'todo') => {
    setCreateDefaultStatus(status);
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateIssue = useCallback(
    (input: CreateIssueInput) => {
      const created = createIssue(input);
      addToast({
        message: `Created ${created.id}`,
        description: created.title,
        variant: 'success',
      });
    },
    [createIssue, addToast],
  );

  const handleDeleteSingleIssue = useCallback(
    (issueId: string) => {
      const snapshots = deleteIssues([issueId]);
      if (snapshots.length === 0) return;

      const deleted = snapshots[0];
      if (selectedIssueId === issueId) {
        setSelectedIssueId(null);
      }
      setSelectedBulkIds((prev) => prev.filter((id) => id !== issueId));

      addToast({
        message: `Deleted ${deleted.id}`,
        description: deleted.title,
        variant: 'danger',
        undoLabel: 'Undo',
        undoAction: () => {
          restoreIssues(snapshots);
          addToast({
            message: `Restored ${deleted.id}`,
            description: `${deleted.subTasks.length} sub-tasks preserved`,
            variant: 'info',
          });
        },
      });
    },
    [deleteIssues, restoreIssues, selectedIssueId, addToast],
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedBulkIds.length === 0) return;
    const snapshots = deleteIssues(selectedBulkIds);
    if (snapshots.length === 0) return;

    if (selectedIssueId && selectedBulkIds.includes(selectedIssueId)) {
      setSelectedIssueId(null);
    }
    setSelectedBulkIds([]);

    addToast({
      message: `Deleted ${snapshots.length} ${snapshots.length === 1 ? 'issue' : 'issues'}`,
      description: snapshots.map((s) => s.id).join(', '),
      variant: 'danger',
      undoLabel: 'Undo',
      undoAction: () => {
        restoreIssues(snapshots);
        addToast({
          message: `Restored ${snapshots.length} ${snapshots.length === 1 ? 'issue' : 'issues'}`,
          variant: 'info',
        });
      },
    });
  }, [
    selectedBulkIds,
    deleteIssues,
    restoreIssues,
    selectedIssueId,
    addToast,
  ]);

  const handleBulkStatus = useCallback(
    (status: IssueStatus) => {
      if (selectedBulkIds.length === 0) return;
      bulkUpdateStatus(selectedBulkIds, status);
      addToast({
        message: `Updated status for ${selectedBulkIds.length} ${selectedBulkIds.length === 1 ? 'issue' : 'issues'}`,
        variant: 'success',
      });
    },
    [selectedBulkIds, bulkUpdateStatus, addToast],
  );

  const handleBulkPriority = useCallback(
    (priority: IssuePriority) => {
      if (selectedBulkIds.length === 0) return;
      bulkUpdatePriority(selectedBulkIds, priority);
      addToast({
        message: `Updated priority for ${selectedBulkIds.length} ${selectedBulkIds.length === 1 ? 'issue' : 'issues'}`,
        variant: 'success',
      });
    },
    [selectedBulkIds, bulkUpdatePriority, addToast],
  );

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  const handleFilterUrgent = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      priorities: ['urgent'],
      statuses: [],
    }));
    if (activeView === 'analytics') {
      handleSelectView('list');
    }
  }, [activeView, handleSelectView]);

  const handleFilterInProgress = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      statuses: ['in_progress'],
      priorities: [],
    }));
    if (activeView === 'analytics') {
      handleSelectView('board');
    }
  }, [activeView, handleSelectView]);

  const handleResetDemoData = useCallback(() => {
    resetDemoData();
    setSelectedIssueId(null);
    setSelectedBulkIds([]);
    setFilters(DEFAULT_FILTER_STATE);
    addToast({
      message: 'Demo data restored',
      description: 'Reset to 10 realistic software engineering issues',
      variant: 'info',
    });
  }, [resetDemoData, addToast]);

  const handleEscape = useCallback(() => {
    if (isCommandPaletteOpen) {
      setIsCommandPaletteOpen(false);
      return;
    }
    if (isCreateModalOpen) {
      setIsCreateModalOpen(false);
      return;
    }
    if (isSettingsModalOpen) {
      setIsSettingsModalOpen(false);
      return;
    }
    if (selectedIssueId) {
      setSelectedIssueId(null);
    }
  }, [
    isCommandPaletteOpen,
    isCreateModalOpen,
    isSettingsModalOpen,
    selectedIssueId,
  ]);

  const handleFocusSearch = useCallback(() => {
    if (activeView === 'analytics') {
      handleSelectView('board');
    }
    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 20);
  }, [activeView, handleSelectView]);

  useKeyboardShortcuts({
    isCommandPaletteOpen,
    isCreateModalOpen,
    isSettingsModalOpen,
    isDrawerOpen: selectedIssue !== null,
    onToggleCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onOpenCreateModal: () => handleOpenCreateModal('todo'),
    onEscape: handleEscape,
    onFocusSearch: handleFocusSearch,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-ink">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCreate={() => handleOpenCreateModal('todo')}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onFilterUrgent={handleFilterUrgent}
        onFilterInProgress={handleFilterInProgress}
        onClearFilters={handleClearFilters}
        counts={sidebarCounts}
      />

      {/* Main Workspace Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCreate={() => handleOpenCreateModal('todo')}
          theme={theme}
          onToggleTheme={toggleTheme}
          filteredCount={filteredIssues.length}
          totalCount={issues.length}
        />

        {activeView !== 'analytics' && (
          <FilterBar
            filters={filters}
            searchInputRef={searchInputRef}
            onSearchChange={(search) =>
              setFilters((prev) => ({ ...prev, search }))
            }
            onToggleStatus={(status: IssueStatus) =>
              setFilters((prev) => ({
                ...prev,
                statuses: toggleArrayItem(prev.statuses, status),
              }))
            }
            onTogglePriority={(priority: IssuePriority) =>
              setFilters((prev) => ({
                ...prev,
                priorities: toggleArrayItem(prev.priorities, priority),
              }))
            }
            onToggleLabel={(label: IssueLabel) =>
              setFilters((prev) => ({
                ...prev,
                labels: toggleArrayItem(prev.labels, label),
              }))
            }
            onSortChange={(sortBy: SortOption) =>
              setFilters((prev) => ({ ...prev, sortBy }))
            }
            onClearFilters={handleClearFilters}
          />
        )}

        {activeView === 'board' && (
          <KanbanBoard
            issues={filteredIssues}
            totalIssuesCount={issues.length}
            selectedIssueId={selectedIssueId}
            hasActiveFilters={isFiltered}
            onSelectIssue={setSelectedIssueId}
            onMoveIssue={moveIssue}
            onCreateInStatus={handleOpenCreateModal}
            onClearFilters={handleClearFilters}
          />
        )}

        {activeView === 'list' && (
          <IssueListView
            issues={filteredIssues}
            totalIssuesCount={issues.length}
            selectedIssueId={selectedIssueId}
            selectedBulkIds={selectedBulkIds}
            hasActiveFilters={isFiltered}
            onToggleBulkId={(id) =>
              setSelectedBulkIds((prev) => toggleArrayItem(prev, id))
            }
            onSetBulkIds={setSelectedBulkIds}
            onClearBulkSelection={() => setSelectedBulkIds([])}
            onOpenDrawer={setSelectedIssueId}
            onChangeStatus={changeIssueStatus}
            onChangePriority={changeIssuePriority}
            onBulkStatus={handleBulkStatus}
            onBulkPriority={handleBulkPriority}
            onBulkDelete={handleBulkDelete}
            onCreateInStatus={handleOpenCreateModal}
            onClearFilters={handleClearFilters}
          />
        )}

        {activeView === 'analytics' && (
          <SprintAnalyticsView
            issues={issues}
            onSelectIssue={setSelectedIssueId}
          />
        )}
      </div>

      {/* Rich Issue Detail Slide-Over Drawer */}
      {selectedIssue && (
        <IssueDetailDrawer
          key={selectedIssue.id}
          issue={selectedIssue}
          onClose={() => setSelectedIssueId(null)}
          onUpdateFields={updateIssueFields}
          onChangeStatus={changeIssueStatus}
          onChangePriority={changeIssuePriority}
          onAddSubTask={addSubTask}
          onToggleSubTask={toggleSubTask}
          onDeleteSubTask={deleteSubTask}
          onDeleteIssue={handleDeleteSingleIssue}
        />
      )}

      {/* Create Issue Modal */}
      {isCreateModalOpen && (
        <CreateIssueModal
          open={isCreateModalOpen}
          defaultStatus={createDefaultStatus}
          nextIssueNumber={nextNumber}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateIssue}
        />
      )}

      {/* Global Command Palette (Ctrl/Cmd + K) */}
      {isCommandPaletteOpen && (
        <CommandPaletteModal
          open={isCommandPaletteOpen}
          issues={issues}
          theme={theme}
          activeView={activeView}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectIssue={setSelectedIssueId}
          onCreateIssue={() => handleOpenCreateModal('todo')}
          onSwitchView={handleSelectView}
          onFilterUrgent={handleFilterUrgent}
          onClearFilters={handleClearFilters}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onResetDemoData={handleResetDemoData}
        />
      )}

      {/* Settings & JSON Backup Modal */}
      {isSettingsModalOpen && (
        <SettingsDataModal
          open={isSettingsModalOpen}
          issues={issues}
          nextNumber={nextNumber}
          onClose={() => setIsSettingsModalOpen(false)}
          onImportStore={(store) => {
            importIssues(store);
            setSelectedIssueId(null);
            setSelectedBulkIds([]);
          }}
          onResetDemoData={handleResetDemoData}
          onNotify={(message, variant = 'info') =>
            addToast({ message, variant })
          }
        />
      )}

      {/* Toast Notifications with Undo */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        hasBulkBar={activeView === 'list' && selectedBulkIds.length > 0}
      />
    </div>
  );
}

export default App;
