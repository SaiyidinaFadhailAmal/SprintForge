import { PRIORITY_META, STATUS_META } from '../data/constants';
import type { FilterState, Issue } from '../types';

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.labels.length > 0
  );
}

export function filterAndSortIssues(
  issues: readonly Issue[],
  filters: FilterState,
): Issue[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = issues.filter((issue) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) {
      return false;
    }
    if (
      filters.priorities.length > 0 &&
      !filters.priorities.includes(issue.priority)
    ) {
      return false;
    }
    if (
      filters.labels.length > 0 &&
      !filters.labels.some((label) => issue.labels.includes(label))
    ) {
      return false;
    }
    if (query) {
      const searchable = [
        issue.id,
        issue.title,
        issue.description,
        STATUS_META[issue.status].label,
        PRIORITY_META[issue.priority].label,
        ...issue.labels,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'priority': {
        const diff =
          PRIORITY_META[a.priority].weight - PRIORITY_META[b.priority].weight;
        return diff !== 0 ? diff : a.order - b.order;
      }
      case 'dueDate': {
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          return cmp !== 0 ? cmp : a.number - b.number;
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return a.number - b.number;
      }
      case 'id':
        return a.number - b.number;
      case 'order':
      default:
        return a.order !== b.order ? a.order - b.order : a.number - b.number;
    }
  });
}
