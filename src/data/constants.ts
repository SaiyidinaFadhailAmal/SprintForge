import type {
  FilterState,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  SortOption,
  StoryPoints,
} from '../types';

export interface StatusConfig {
  id: IssueStatus;
  label: string;
  shortLabel: string;
  color: string;
  dotColor: string;
  barClass: string;
}

export const STATUS_ORDER: readonly IssueStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
] as const;

export const STATUS_META: Record<IssueStatus, StatusConfig> = {
  backlog: {
    id: 'backlog',
    label: 'Backlog',
    shortLabel: 'Backlog',
    color: '#71717A',
    dotColor: '#71717A',
    barClass: 'bg-zinc-500',
  },
  todo: {
    id: 'todo',
    label: 'Todo',
    shortLabel: 'Todo',
    color: '#A1A1AA',
    dotColor: '#A1A1AA',
    barClass: 'bg-zinc-400',
  },
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    shortLabel: 'In Progress',
    color: '#F59E0B',
    dotColor: '#F59E0B',
    barClass: 'bg-amber-500',
  },
  in_review: {
    id: 'in_review',
    label: 'In Review',
    shortLabel: 'Review',
    color: '#6366F1',
    dotColor: '#6366F1',
    barClass: 'bg-indigo-500',
  },
  done: {
    id: 'done',
    label: 'Done',
    shortLabel: 'Done',
    color: '#10B981',
    dotColor: '#10B981',
    barClass: 'bg-emerald-500',
  },
};

export interface PriorityConfig {
  id: IssuePriority;
  label: string;
  weight: number;
  color: string;
  badgeClass: string;
  barClass: string;
}

export const PRIORITY_ORDER: readonly IssuePriority[] = [
  'urgent',
  'high',
  'medium',
  'low',
] as const;

export const PRIORITY_META: Record<IssuePriority, PriorityConfig> = {
  urgent: {
    id: 'urgent',
    label: 'Urgent',
    weight: 0,
    color: '#EF4444',
    badgeClass:
      'text-red-700 dark:text-red-400 bg-red-500/12 border-red-500/30',
    barClass: 'bg-red-500',
  },
  high: {
    id: 'high',
    label: 'High',
    weight: 1,
    color: '#F97316',
    badgeClass:
      'text-orange-700 dark:text-orange-400 bg-orange-500/12 border-orange-500/30',
    barClass: 'bg-orange-500',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    weight: 2,
    color: '#EAB308',
    badgeClass:
      'text-amber-700 dark:text-amber-400 bg-amber-500/12 border-amber-500/30',
    barClass: 'bg-amber-400',
  },
  low: {
    id: 'low',
    label: 'Low',
    weight: 3,
    color: '#71717A',
    badgeClass:
      'text-zinc-700 dark:text-zinc-400 bg-zinc-500/12 border-zinc-500/30',
    barClass: 'bg-zinc-500',
  },
};

export interface LabelConfig {
  id: IssueLabel;
  color: string;
  badgeClass: string;
  barClass: string;
}

export const LABEL_OPTIONS: readonly IssueLabel[] = [
  'Frontend',
  'Backend',
  'UI/UX',
  'Bug',
  'DevOps',
] as const;

export const LABEL_META: Record<IssueLabel, LabelConfig> = {
  Frontend: {
    id: 'Frontend',
    color: '#38BDF8',
    badgeClass:
      'text-sky-700 dark:text-sky-400 bg-sky-500/12 border-sky-500/30',
    barClass: 'bg-sky-400',
  },
  Backend: {
    id: 'Backend',
    color: '#818CF8',
    badgeClass:
      'text-indigo-700 dark:text-indigo-400 bg-indigo-500/12 border-indigo-500/30',
    barClass: 'bg-indigo-400',
  },
  'UI/UX': {
    id: 'UI/UX',
    color: '#C084FC',
    badgeClass:
      'text-purple-700 dark:text-purple-400 bg-purple-500/12 border-purple-500/30',
    barClass: 'bg-purple-400',
  },
  Bug: {
    id: 'Bug',
    color: '#F43F5E',
    badgeClass:
      'text-rose-700 dark:text-rose-400 bg-rose-500/12 border-rose-500/30',
    barClass: 'bg-rose-400',
  },
  DevOps: {
    id: 'DevOps',
    color: '#34D399',
    badgeClass:
      'text-emerald-700 dark:text-emerald-400 bg-emerald-500/12 border-emerald-500/30',
    barClass: 'bg-emerald-400',
  },
};

export const STORY_POINT_OPTIONS: readonly StoryPoints[] = [1, 2, 3, 5, 8] as const;

export const SORT_OPTIONS: ReadonlyArray<{ id: SortOption; label: string }> = [
  { id: 'order', label: 'Manual Order' },
  { id: 'priority', label: 'Priority' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'id', label: 'Issue ID' },
] as const;

export const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  statuses: [],
  priorities: [],
  labels: [],
  sortBy: 'order',
};
