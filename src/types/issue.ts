export type IssueStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low';

export type IssueLabel = 'Frontend' | 'Backend' | 'UI/UX' | 'Bug' | 'DevOps';

export type StoryPoints = 1 | 2 | 3 | 5 | 8;

export type WorkspaceView = 'board' | 'list' | 'analytics';

export type SortOption = 'order' | 'priority' | 'dueDate' | 'id';

export type ThemeMode = 'dark' | 'light';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'details_updated';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  message: string;
  fromValue?: string;
  toValue?: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  labels: IssueLabel[];
  storyPoints: StoryPoints;
  dueDate: string | null;
  order: number;
  subTasks: SubTask[];
  activityLog: ActivityEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  search: string;
  statuses: IssueStatus[];
  priorities: IssuePriority[];
  labels: IssueLabel[];
  sortBy: SortOption;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  labels: IssueLabel[];
  storyPoints: StoryPoints;
  dueDate: string | null;
  subTasks?: string[];
}

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
  undoAction?: () => void;
  undoLabel?: string;
}

export interface SprintForgeExportPayload {
  version: 1;
  exportedAt: string;
  nextNumber: number;
  issues: Issue[];
}
