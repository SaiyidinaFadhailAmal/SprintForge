import { type DragEvent, useState } from 'react';
import { STATUS_ORDER } from '../../data/constants';
import type { Issue, IssueStatus } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { type DropTargetState, KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  issues: readonly Issue[];
  totalIssuesCount: number;
  selectedIssueId: string | null;
  hasActiveFilters: boolean;
  onSelectIssue: (issueId: string) => void;
  onMoveIssue: (
    issueId: string,
    targetStatus: IssueStatus,
    targetIndex: number,
  ) => void;
  onCreateInStatus: (status: IssueStatus) => void;
  onClearFilters: () => void;
}

export function KanbanBoard({
  issues,
  totalIssuesCount,
  selectedIssueId,
  hasActiveFilters,
  onSelectIssue,
  onMoveIssue,
  onCreateInStatus,
  onClearFilters,
}: KanbanBoardProps) {
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, issueId: string) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setDropTarget(null);
  };

  const handleDropAtTarget = (
    status: IssueStatus,
    index: number,
    fallbackId?: string | null,
  ) => {
    const issueId = draggedIssueId ?? fallbackId ?? null;
    if (issueId) {
      onMoveIssue(issueId, status, index);
    }
    setDraggedIssueId(null);
    setDropTarget(null);
  };

  if (issues.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <EmptyState
            title={
              totalIssuesCount === 0
                ? 'No issues in this sprint yet'
                : 'No issues match your filters'
            }
            description={
              totalIssuesCount === 0
                ? 'Create your first engineering issue to populate the SprintForge board.'
                : 'Try adjusting your search query, status, priority, or label filters.'
            }
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateIssue={() => onCreateInStatus('todo')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden sf-scrollbar p-3 sm:p-5">
      <div className="flex h-full min-w-max gap-3.5">
        {STATUS_ORDER.map((status) => {
          const columnIssues = issues.filter((issue) => issue.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              issues={columnIssues}
              selectedIssueId={selectedIssueId}
              draggedIssueId={draggedIssueId}
              dropTarget={dropTarget}
              hasActiveFilters={hasActiveFilters}
              onSelectIssue={onSelectIssue}
              onCreateInStatus={onCreateInStatus}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onUpdateDropTarget={setDropTarget}
              onDropAtTarget={handleDropAtTarget}
            />
          );
        })}
      </div>
    </div>
  );
}
