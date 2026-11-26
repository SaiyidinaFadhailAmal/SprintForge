import type { IssueStatus } from '../types';

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return 'No due date';
  const parts = dueDate.split('-');
  if (parts.length !== 3) return dueDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return dueDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function isOverdue(dueDate: string | null, status: IssueStatus): boolean {
  if (!dueDate || status === 'done') return false;
  return dueDate < getTodayIsoDate();
}

export function isDueSoon(dueDate: string | null, status: IssueStatus): boolean {
  if (!dueDate || status === 'done') return false;
  const today = getTodayIsoDate();
  if (dueDate < today) return false;
  const [ty, tm, td] = today.split('-').map(Number);
  const [dy, dm, dd] = dueDate.split('-').map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);
  const dueMs = Date.UTC(dy, dm - 1, dd);
  const diffDays = (dueMs - todayMs) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
}

export function formatRelativeTimestamp(isoTimestamp: string): string {
  const target = new Date(isoTimestamp);
  if (Number.isNaN(target.getTime())) return isoTimestamp;

  const diffSeconds = Math.floor((Date.now() - target.getTime()) / 1000);
  if (diffSeconds < 45) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 86400 * 7) return `${Math.floor(diffSeconds / 86400)}d ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(target);
}

export function formatExactTimestamp(isoTimestamp: string): string {
  const target = new Date(isoTimestamp);
  if (Number.isNaN(target.getTime())) return isoTimestamp;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(target);
}
