import {
  LABEL_OPTIONS,
  PRIORITY_ORDER,
  STATUS_ORDER,
  STORY_POINT_OPTIONS,
} from '../data/constants';
import { cloneSeedIssues, SEED_NEXT_NUMBER } from '../data/seedIssues';
import type {
  ActivityEntry,
  ActivityType,
  Issue,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  SprintForgeExportPayload,
  StoryPoints,
  SubTask,
  ThemeMode,
  WorkspaceView,
} from '../types';

export const STORAGE_KEYS = {
  ISSUES: 'sprintforge.issues.v1',
  NEXT_NUMBER: 'sprintforge.nextNumber.v1',
  THEME: 'sprintforge.theme.v1',
  VIEW: 'sprintforge.view.v1',
  SIDEBAR_COLLAPSED: 'sprintforge.sidebarCollapsed.v1',
} as const;

export interface PersistedIssueStore {
  issues: Issue[];
  nextNumber: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === 'string' &&
    (STATUS_ORDER as readonly string[]).includes(value)
  );
}

function isValidPriority(value: unknown): value is IssuePriority {
  return (
    typeof value === 'string' &&
    (PRIORITY_ORDER as readonly string[]).includes(value)
  );
}

function isValidLabel(value: unknown): value is IssueLabel {
  return (
    typeof value === 'string' &&
    (LABEL_OPTIONS as readonly string[]).includes(value)
  );
}

function isValidStoryPoints(value: unknown): value is StoryPoints {
  return (
    typeof value === 'number' &&
    (STORY_POINT_OPTIONS as readonly number[]).includes(value)
  );
}

function isValidActivityType(value: unknown): value is ActivityType {
  return (
    value === 'created' ||
    value === 'status_changed' ||
    value === 'priority_changed' ||
    value === 'details_updated'
  );
}

function parseSubTask(raw: unknown): SubTask | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.completed !== 'boolean'
  ) {
    return null;
  }
  return {
    id: raw.id,
    title: raw.title,
    completed: raw.completed,
  };
}

function parseActivityEntry(raw: unknown): ActivityEntry | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.timestamp !== 'string' ||
    !isValidActivityType(raw.type) ||
    typeof raw.message !== 'string'
  ) {
    return null;
  }
  const entry: ActivityEntry = {
    id: raw.id,
    timestamp: raw.timestamp,
    type: raw.type,
    message: raw.message,
  };
  if (typeof raw.fromValue === 'string') {
    entry.fromValue = raw.fromValue;
  }
  if (typeof raw.toValue === 'string') {
    entry.toValue = raw.toValue;
  }
  return entry;
}

export function parseIssue(raw: unknown): Issue | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.number !== 'number' ||
    !Number.isFinite(raw.number) ||
    typeof raw.title !== 'string' ||
    typeof raw.description !== 'string' ||
    !isValidStatus(raw.status) ||
    !isValidPriority(raw.priority) ||
    !Array.isArray(raw.labels) ||
    !isValidStoryPoints(raw.storyPoints) ||
    typeof raw.order !== 'number' ||
    !Array.isArray(raw.subTasks) ||
    !Array.isArray(raw.activityLog) ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string'
  ) {
    return null;
  }

  const dueDate =
    raw.dueDate === null || typeof raw.dueDate === 'string'
      ? raw.dueDate
      : null;

  const labels: IssueLabel[] = [];
  for (const label of raw.labels) {
    if (isValidLabel(label) && !labels.includes(label)) {
      labels.push(label);
    }
  }

  const subTasks: SubTask[] = [];
  for (const st of raw.subTasks) {
    const parsed = parseSubTask(st);
    if (parsed) subTasks.push(parsed);
  }

  const activityLog: ActivityEntry[] = [];
  for (const act of raw.activityLog) {
    const parsed = parseActivityEntry(act);
    if (parsed) activityLog.push(parsed);
  }

  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    labels,
    storyPoints: raw.storyPoints,
    dueDate,
    order: raw.order,
    subTasks,
    activityLog,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function loadIssueStore(): PersistedIssueStore {
  try {
    const rawIssues = localStorage.getItem(STORAGE_KEYS.ISSUES);
    const rawNextNumber = localStorage.getItem(STORAGE_KEYS.NEXT_NUMBER);

    if (!rawIssues) {
      const seed = cloneSeedIssues();
      saveIssueStore({ issues: seed, nextNumber: SEED_NEXT_NUMBER });
      return { issues: seed, nextNumber: SEED_NEXT_NUMBER };
    }

    const parsedJson: unknown = JSON.parse(rawIssues);
    if (!Array.isArray(parsedJson)) {
      const seed = cloneSeedIssues();
      return { issues: seed, nextNumber: SEED_NEXT_NUMBER };
    }

    const issues: Issue[] = [];
    for (const item of parsedJson) {
      const valid = parseIssue(item);
      if (valid) issues.push(valid);
    }

    const maxExisting = issues.reduce(
      (max, issue) => Math.max(max, issue.number),
      100,
    );
    const parsedNext = rawNextNumber ? Number(rawNextNumber) : NaN;
    const nextNumber =
      Number.isFinite(parsedNext) && parsedNext > maxExisting
        ? parsedNext
        : maxExisting + 1;

    return { issues, nextNumber };
  } catch {
    return {
      issues: cloneSeedIssues(),
      nextNumber: SEED_NEXT_NUMBER,
    };
  }
}

export function saveIssueStore(store: PersistedIssueStore): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(store.issues));
    localStorage.setItem(
      STORAGE_KEYS.NEXT_NUMBER,
      String(store.nextNumber),
    );
  } catch {
    // Ignore storage quota issues cleanly
  }
}

export function loadThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'dark';
}

export function saveThemeMode(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore storage access errors
  }
}

export function loadWorkspaceView(): WorkspaceView {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW);
    if (stored === 'board' || stored === 'list' || stored === 'analytics') {
      return stored;
    }
  } catch {
    // Ignore
  }
  return 'board';
}

export function saveWorkspaceView(view: WorkspaceView): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW, view);
  } catch {
    // Ignore
  }
}

export function loadSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  } catch {
    return false;
  }
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
  } catch {
    // Ignore
  }
}

export function buildExportPayload(
  issues: readonly Issue[],
  nextNumber: number,
): SprintForgeExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    nextNumber,
    issues: issues.map((issue) => ({ ...issue })),
  };
}

export function parseImportedJson(
  jsonText: string,
): { ok: true; data: PersistedIssueStore } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax. Please verify the file.' };
  }

  let candidateIssues: unknown = null;
  let candidateNextNumber: number | undefined;

  if (Array.isArray(parsed)) {
    candidateIssues = parsed;
  } else if (isRecord(parsed) && Array.isArray(parsed.issues)) {
    candidateIssues = parsed.issues;
    if (typeof parsed.nextNumber === 'number' && Number.isFinite(parsed.nextNumber)) {
      candidateNextNumber = parsed.nextNumber;
    }
  } else {
    return {
      ok: false,
      error:
        'JSON must be a SprintForge export object with an "issues" array or a raw array of issues.',
    };
  }

  if (!Array.isArray(candidateIssues)) {
    return { ok: false, error: 'Expected an array of issues.' };
  }

  const validIssues: Issue[] = [];
  for (const item of candidateIssues) {
    const issue = parseIssue(item);
    if (issue) {
      validIssues.push(issue);
    }
  }

  if (candidateIssues.length > 0 && validIssues.length === 0) {
    return {
      ok: false,
      error:
        'None of the entries matched the SprintForge issue schema (id, number, title, status, priority, storyPoints).',
    };
  }

  const maxNumber = validIssues.reduce(
    (max, issue) => Math.max(max, issue.number),
    100,
  );
  const nextNumber =
    candidateNextNumber && candidateNextNumber > maxNumber
      ? candidateNextNumber
      : maxNumber + 1;

  return {
    ok: true,
    data: {
      issues: validIssues,
      nextNumber,
    },
  };
}
