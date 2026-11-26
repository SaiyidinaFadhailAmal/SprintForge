import { useCallback, useEffect, useReducer } from 'react';
import { PRIORITY_META, STATUS_META } from '../data/constants';
import { cloneSeedIssues, SEED_NEXT_NUMBER } from '../data/seedIssues';
import type {
  ActivityEntry,
  CreateIssueInput,
  Issue,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  StoryPoints,
} from '../types';
import { createId } from '../utils/formatters';
import {
  loadIssueStore,
  type PersistedIssueStore,
  saveIssueStore,
} from '../utils/storage';

type IssueAction =
  | { type: 'ADD_ISSUE'; issue: Issue }
  | {
      type: 'UPDATE_FIELDS';
      id: string;
      patch: Partial<
        Pick<Issue, 'title' | 'description' | 'labels' | 'storyPoints' | 'dueDate'>
      >;
    }
  | { type: 'CHANGE_STATUS'; id: string; status: IssueStatus }
  | { type: 'CHANGE_PRIORITY'; id: string; priority: IssuePriority }
  | {
      type: 'MOVE_ISSUE';
      id: string;
      targetStatus: IssueStatus;
      targetIndex: number;
    }
  | { type: 'ADD_SUBTASK'; issueId: string; title: string }
  | { type: 'TOGGLE_SUBTASK'; issueId: string; subTaskId: string }
  | { type: 'DELETE_SUBTASK'; issueId: string; subTaskId: string }
  | { type: 'DELETE_ISSUES'; ids: string[] }
  | { type: 'RESTORE_ISSUES'; snapshots: Issue[] }
  | { type: 'BULK_STATUS'; ids: string[]; status: IssueStatus }
  | { type: 'BULK_PRIORITY'; ids: string[]; priority: IssuePriority }
  | { type: 'REPLACE_ALL'; store: PersistedIssueStore };

function makeActivity(
  type: ActivityEntry['type'],
  message: string,
  fromValue?: string,
  toValue?: string,
): ActivityEntry {
  const entry: ActivityEntry = {
    id: createId('act'),
    timestamp: new Date().toISOString(),
    type,
    message,
  };
  if (fromValue !== undefined) entry.fromValue = fromValue;
  if (toValue !== undefined) entry.toValue = toValue;
  return entry;
}

function normalizeColumnOrders(
  issues: Issue[],
  status: IssueStatus,
  orderedIds?: string[],
): Issue[] {
  if (orderedIds) {
    const orderLookup = new Map<string, number>();
    orderedIds.forEach((id, idx) => orderLookup.set(id, idx));
    return issues.map((issue) => {
      const nextOrder = orderLookup.get(issue.id);
      if (nextOrder !== undefined) {
        return { ...issue, order: nextOrder };
      }
      return issue;
    });
  }

  const colSorted = issues
    .filter((i) => i.status === status)
    .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.number - b.number));

  const indexMap = new Map<string, number>();
  colSorted.forEach((item, idx) => indexMap.set(item.id, idx));

  return issues.map((issue) => {
    const idx = indexMap.get(issue.id);
    return idx !== undefined ? { ...issue, order: idx } : issue;
  });
}

function issueReducer(
  state: PersistedIssueStore,
  action: IssueAction,
): PersistedIssueStore {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_ISSUE': {
      const nextIssues = [...state.issues, action.issue];
      return {
        issues: nextIssues,
        nextNumber: Math.max(state.nextNumber, action.issue.number + 1),
      };
    }

    case 'UPDATE_FIELDS': {
      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.id
            ? {
                ...issue,
                ...action.patch,
                updatedAt: now,
              }
            : issue,
        ),
      };
    }

    case 'CHANGE_STATUS': {
      const target = state.issues.find((i) => i.id === action.id);
      if (!target || target.status === action.status) return state;

      const maxOrderInTarget = state.issues
        .filter((i) => i.status === action.status)
        .reduce((max, i) => Math.max(max, i.order), -1);

      const activity = makeActivity(
        'status_changed',
        `Status changed from ${STATUS_META[target.status].label} to ${STATUS_META[action.status].label}`,
        target.status,
        action.status,
      );

      let updated = state.issues.map((issue) =>
        issue.id === action.id
          ? {
              ...issue,
              status: action.status,
              order: maxOrderInTarget + 1,
              updatedAt: now,
              activityLog: [...issue.activityLog, activity],
            }
          : issue,
      );

      updated = normalizeColumnOrders(updated, target.status);
      updated = normalizeColumnOrders(updated, action.status);
      return { ...state, issues: updated };
    }

    case 'CHANGE_PRIORITY': {
      const target = state.issues.find((i) => i.id === action.id);
      if (!target || target.priority === action.priority) return state;

      const activity = makeActivity(
        'priority_changed',
        `Priority changed from ${PRIORITY_META[target.priority].label} to ${PRIORITY_META[action.priority].label}`,
        target.priority,
        action.priority,
      );

      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.id
            ? {
                ...issue,
                priority: action.priority,
                updatedAt: now,
                activityLog: [...issue.activityLog, activity],
              }
            : issue,
        ),
      };
    }

    case 'MOVE_ISSUE': {
      const dragged = state.issues.find((i) => i.id === action.id);
      if (!dragged) return state;

      const sourceStatus = dragged.status;
      const targetStatus = action.targetStatus;

      const targetColumnIssues = state.issues
        .filter((i) => i.status === targetStatus && i.id !== action.id)
        .sort((a, b) =>
          a.order !== b.order ? a.order - b.order : a.number - b.number,
        );

      const clampedIndex = Math.max(
        0,
        Math.min(action.targetIndex, targetColumnIssues.length),
      );

      const statusChanged = sourceStatus !== targetStatus;
      const updatedDragged: Issue = statusChanged
        ? {
            ...dragged,
            status: targetStatus,
            updatedAt: now,
            activityLog: [
              ...dragged.activityLog,
              makeActivity(
                'status_changed',
                `Status changed from ${STATUS_META[sourceStatus].label} to ${STATUS_META[targetStatus].label}`,
                sourceStatus,
                targetStatus,
              ),
            ],
          }
        : dragged;

      const reorderedTarget = [...targetColumnIssues];
      reorderedTarget.splice(clampedIndex, 0, updatedDragged);
      const targetIds = reorderedTarget.map((i) => i.id);

      let nextIssues = state.issues.map((issue) =>
        issue.id === action.id ? updatedDragged : issue,
      );

      nextIssues = normalizeColumnOrders(nextIssues, targetStatus, targetIds);
      if (statusChanged) {
        nextIssues = normalizeColumnOrders(nextIssues, sourceStatus);
      }

      return { ...state, issues: nextIssues };
    }

    case 'ADD_SUBTASK': {
      const trimmed = action.title.trim();
      if (!trimmed) return state;

      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.issueId
            ? {
                ...issue,
                updatedAt: now,
                subTasks: [
                  ...issue.subTasks,
                  {
                    id: createId('st'),
                    title: trimmed,
                    completed: false,
                  },
                ],
              }
            : issue,
        ),
      };
    }

    case 'TOGGLE_SUBTASK': {
      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.issueId
            ? {
                ...issue,
                updatedAt: now,
                subTasks: issue.subTasks.map((st) =>
                  st.id === action.subTaskId
                    ? { ...st, completed: !st.completed }
                    : st,
                ),
              }
            : issue,
        ),
      };
    }

    case 'DELETE_SUBTASK': {
      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.issueId
            ? {
                ...issue,
                updatedAt: now,
                subTasks: issue.subTasks.filter(
                  (st) => st.id !== action.subTaskId,
                ),
              }
            : issue,
        ),
      };
    }

    case 'DELETE_ISSUES': {
      const idSet = new Set(action.ids);
      return {
        ...state,
        issues: state.issues.filter((issue) => !idSet.has(issue.id)),
      };
    }

    case 'RESTORE_ISSUES': {
      const existingIds = new Set(state.issues.map((i) => i.id));
      const toRestore = action.snapshots.filter((i) => !existingIds.has(i.id));
      if (toRestore.length === 0) return state;

      const maxNum = toRestore.reduce(
        (max, issue) => Math.max(max, issue.number),
        state.nextNumber - 1,
      );

      return {
        issues: [...state.issues, ...toRestore],
        nextNumber: Math.max(state.nextNumber, maxNum + 1),
      };
    }

    case 'BULK_STATUS': {
      const idSet = new Set(action.ids);
      let nextOrder = state.issues
        .filter((i) => i.status === action.status)
        .reduce((max, i) => Math.max(max, i.order), -1);

      const updated = state.issues.map((issue) => {
        if (!idSet.has(issue.id) || issue.status === action.status) {
          return issue;
        }
        nextOrder += 1;
        return {
          ...issue,
          status: action.status,
          order: nextOrder,
          updatedAt: now,
          activityLog: [
            ...issue.activityLog,
            makeActivity(
              'status_changed',
              `Status changed from ${STATUS_META[issue.status].label} to ${STATUS_META[action.status].label}`,
              issue.status,
              action.status,
            ),
          ],
        };
      });

      return { ...state, issues: updated };
    }

    case 'BULK_PRIORITY': {
      const idSet = new Set(action.ids);
      return {
        ...state,
        issues: state.issues.map((issue) => {
          if (!idSet.has(issue.id) || issue.priority === action.priority) {
            return issue;
          }
          return {
            ...issue,
            priority: action.priority,
            updatedAt: now,
            activityLog: [
              ...issue.activityLog,
              makeActivity(
                'priority_changed',
                `Priority changed from ${PRIORITY_META[issue.priority].label} to ${PRIORITY_META[action.priority].label}`,
                issue.priority,
                action.priority,
              ),
            ],
          };
        }),
      };
    }

    case 'REPLACE_ALL': {
      return action.store;
    }
  }
}

export function useIssues() {
  const [state, dispatch] = useReducer(issueReducer, undefined, loadIssueStore);

  useEffect(() => {
    saveIssueStore(state);
  }, [state]);

  const createIssue = useCallback(
    (input: CreateIssueInput): Issue => {
      const now = new Date().toISOString();
      const num = state.nextNumber;
      const id = `SF-${num}`;
      const columnOrder =
        state.issues
          .filter((i) => i.status === input.status)
          .reduce((max, i) => Math.max(max, i.order), -1) + 1;

      const subTasks = (input.subTasks ?? [])
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title) => ({
          id: createId('st'),
          title,
          completed: false,
        }));

      const newIssue: Issue = {
        id,
        number: num,
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
        labels: [...input.labels],
        storyPoints: input.storyPoints,
        dueDate: input.dueDate,
        order: columnOrder,
        subTasks,
        activityLog: [
          makeActivity(
            'created',
            `Issue ${id} created in ${STATUS_META[input.status].label}`,
          ),
        ],
        createdAt: now,
        updatedAt: now,
      };

      dispatch({ type: 'ADD_ISSUE', issue: newIssue });
      return newIssue;
    },
    [state.issues, state.nextNumber],
  );

  const updateIssueFields = useCallback(
    (
      id: string,
      patch: Partial<{
        title: string;
        description: string;
        labels: IssueLabel[];
        storyPoints: StoryPoints;
        dueDate: string | null;
      }>,
    ) => {
      dispatch({ type: 'UPDATE_FIELDS', id, patch });
    },
    [],
  );

  const changeIssueStatus = useCallback((id: string, status: IssueStatus) => {
    dispatch({ type: 'CHANGE_STATUS', id, status });
  }, []);

  const changeIssuePriority = useCallback(
    (id: string, priority: IssuePriority) => {
      dispatch({ type: 'CHANGE_PRIORITY', id, priority });
    },
    [],
  );

  const moveIssue = useCallback(
    (id: string, targetStatus: IssueStatus, targetIndex: number) => {
      dispatch({ type: 'MOVE_ISSUE', id, targetStatus, targetIndex });
    },
    [],
  );

  const addSubTask = useCallback((issueId: string, title: string) => {
    dispatch({ type: 'ADD_SUBTASK', issueId, title });
  }, []);

  const toggleSubTask = useCallback((issueId: string, subTaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', issueId, subTaskId });
  }, []);

  const deleteSubTask = useCallback((issueId: string, subTaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', issueId, subTaskId });
  }, []);

  const deleteIssues = useCallback(
    (ids: string[]): Issue[] => {
      const idSet = new Set(ids);
      const snapshots = state.issues
        .filter((issue) => idSet.has(issue.id))
        .map((issue) => ({
          ...issue,
          labels: [...issue.labels],
          subTasks: issue.subTasks.map((st) => ({ ...st })),
          activityLog: issue.activityLog.map((act) => ({ ...act })),
        }));

      if (snapshots.length > 0) {
        dispatch({ type: 'DELETE_ISSUES', ids });
      }
      return snapshots;
    },
    [state.issues],
  );

  const restoreIssues = useCallback((snapshots: Issue[]) => {
    dispatch({ type: 'RESTORE_ISSUES', snapshots });
  }, []);

  const bulkUpdateStatus = useCallback(
    (ids: string[], status: IssueStatus) => {
      dispatch({ type: 'BULK_STATUS', ids, status });
    },
    [],
  );

  const bulkUpdatePriority = useCallback(
    (ids: string[], priority: IssuePriority) => {
      dispatch({ type: 'BULK_PRIORITY', ids, priority });
    },
    [],
  );

  const importIssues = useCallback((store: PersistedIssueStore) => {
    dispatch({ type: 'REPLACE_ALL', store });
  }, []);

  const resetDemoData = useCallback(() => {
    dispatch({
      type: 'REPLACE_ALL',
      store: {
        issues: cloneSeedIssues(),
        nextNumber: SEED_NEXT_NUMBER,
      },
    });
  }, []);

  return {
    issues: state.issues,
    nextNumber: state.nextNumber,
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
  };
}
