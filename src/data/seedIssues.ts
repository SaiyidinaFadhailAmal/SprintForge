import type { Issue } from '../types';

export const SEED_NEXT_NUMBER = 111;

export const SEED_ISSUES: readonly Issue[] = [
  {
    id: 'SF-101',
    number: 101,
    title: 'Configure OpenTelemetry distributed tracing & Honeycomb exporters',
    description:
      'Instrument HTTP gateway, background job workers, and PostgreSQL query spans with W3C traceparent propagation so p99 latency spikes can be correlated per tenant.',
    status: 'done',
    priority: 'high',
    labels: ['DevOps', 'Backend'],
    storyPoints: 3,
    dueDate: '2026-11-24',
    order: 0,
    subTasks: [
      {
        id: 'st-101-1',
        title: 'Add OTLP gRPC collector sidecar to staging manifest',
        completed: true,
      },
      {
        id: 'st-101-2',
        title: 'Propagate tracecontext headers across BullMQ worker jobs',
        completed: true,
      },
      {
        id: 'st-101-3',
        title: 'Verify sampling rate of 10% for healthcheck endpoints',
        completed: true,
      },
    ],
    activityLog: [
      {
        id: 'act-101-1',
        timestamp: '2026-11-18T09:15:00.000Z',
        type: 'created',
        message: 'Issue SF-101 created in Backlog',
      },
      {
        id: 'act-101-2',
        timestamp: '2026-11-20T14:22:00.000Z',
        type: 'status_changed',
        message: 'Status changed from Todo to In Progress',
        fromValue: 'todo',
        toValue: 'in_progress',
      },
      {
        id: 'act-101-3',
        timestamp: '2026-11-23T17:40:00.000Z',
        type: 'status_changed',
        message: 'Status changed from In Review to Done',
        fromValue: 'in_review',
        toValue: 'done',
      },
    ],
    createdAt: '2026-11-18T09:15:00.000Z',
    updatedAt: '2026-11-23T17:40:00.000Z',
  },
  {
    id: 'SF-102',
    number: 102,
    title: 'Implement OAuth2 PKCE token rotation with silent background refresh',
    description:
      'Replace legacy static refresh tokens with rotating single-use refresh tokens stored in HttpOnly SameSite=Lax cookies and coordinate multi-tab refresh locks.',
    status: 'in_review',
    priority: 'high',
    labels: ['Backend', 'Frontend'],
    storyPoints: 5,
    dueDate: '2026-11-27',
    order: 0,
    subTasks: [
      {
        id: 'st-102-1',
        title: 'Persist SHA-256 token family hashes with reuse detection',
        completed: true,
      },
      {
        id: 'st-102-2',
        title: 'Add BroadcastChannel lock to prevent duplicate refresh calls',
        completed: true,
      },
      {
        id: 'st-102-3',
        title: 'Write integration tests for concurrent expired-token bursts',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-102-1',
        timestamp: '2026-11-19T11:00:00.000Z',
        type: 'created',
        message: 'Issue SF-102 created in Todo',
      },
      {
        id: 'act-102-2',
        timestamp: '2026-11-24T16:12:00.000Z',
        type: 'status_changed',
        message: 'Status changed from In Progress to In Review',
        fromValue: 'in_progress',
        toValue: 'in_review',
      },
    ],
    createdAt: '2026-11-19T11:00:00.000Z',
    updatedAt: '2026-11-24T16:12:00.000Z',
  },
  {
    id: 'SF-103',
    number: 103,
    title: 'Zero-downtime PostgreSQL read-replica migration for billing ledger',
    description:
      'Switch invoice aggregation and usage metering queries onto dedicated NVMe read replicas with automatic lag-threshold fallback under 150ms replication delay.',
    status: 'in_progress',
    priority: 'urgent',
    labels: ['Backend', 'DevOps'],
    storyPoints: 8,
    dueDate: '2026-11-25',
    order: 0,
    subTasks: [
      {
        id: 'st-103-1',
        title: 'Configure pgBouncer read/write connection pool separation',
        completed: true,
      },
      {
        id: 'st-103-2',
        title: 'Add replication lag telemetry probe in connection router',
        completed: true,
      },
      {
        id: 'st-103-3',
        title: 'Canary 25% of invoice export traffic and validate checksums',
        completed: false,
      },
      {
        id: 'st-103-4',
        title: 'Cut over remaining reporting endpoints & update alerts',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-103-1',
        timestamp: '2026-11-19T08:30:00.000Z',
        type: 'created',
        message: 'Issue SF-103 created in Todo',
      },
      {
        id: 'act-103-2',
        timestamp: '2026-11-21T10:05:00.000Z',
        type: 'priority_changed',
        message: 'Priority changed from High to Urgent',
        fromValue: 'high',
        toValue: 'urgent',
      },
      {
        id: 'act-103-3',
        timestamp: '2026-11-22T09:45:00.000Z',
        type: 'status_changed',
        message: 'Status changed from Todo to In Progress',
        fromValue: 'todo',
        toValue: 'in_progress',
      },
    ],
    createdAt: '2026-11-19T08:30:00.000Z',
    updatedAt: '2026-11-22T09:45:00.000Z',
  },
  {
    id: 'SF-104',
    number: 104,
    title: 'Build token-efficient virtualized activity timeline drawer',
    description:
      'Create a slide-over issue inspector supporting inline markdown editing, optimistic sub-task toggles, and instant keyboard closure without layout thrash.',
    status: 'in_progress',
    priority: 'high',
    labels: ['Frontend', 'UI/UX'],
    storyPoints: 5,
    dueDate: '2026-11-28',
    order: 1,
    subTasks: [
      {
        id: 'st-104-1',
        title: 'Design hairline property grid with tabular numeric badges',
        completed: true,
      },
      {
        id: 'st-104-2',
        title: 'Wire automatic activity diffing on status and priority changes',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-104-1',
        timestamp: '2026-11-20T13:10:00.000Z',
        type: 'created',
        message: 'Issue SF-104 created in Backlog',
      },
      {
        id: 'act-104-2',
        timestamp: '2026-11-24T09:00:00.000Z',
        type: 'status_changed',
        message: 'Status changed from Todo to In Progress',
        fromValue: 'todo',
        toValue: 'in_progress',
      },
    ],
    createdAt: '2026-11-20T13:10:00.000Z',
    updatedAt: '2026-11-24T09:00:00.000Z',
  },
  {
    id: 'SF-105',
    number: 105,
    title: 'Resolve Safari sticky-header clipping inside horizontal Kanban scroll',
    description:
      'Column headers lose backdrop blur and clip 1px borders in WebKit 18 when horizontal overflow container scrolls past 4 columns.',
    status: 'in_progress',
    priority: 'medium',
    labels: ['Bug', 'Frontend'],
    storyPoints: 3,
    dueDate: '2026-11-29',
    order: 2,
    subTasks: [
      {
        id: 'st-105-1',
        title: 'Isolate scroll container overflow-y per column body',
        completed: true,
      },
      {
        id: 'st-105-2',
        title: 'Cross-check Retina 1px hairline border rendering in WebKit',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-105-1',
        timestamp: '2026-11-21T15:20:00.000Z',
        type: 'created',
        message: 'Issue SF-105 created in Todo',
      },
      {
        id: 'act-105-2',
        timestamp: '2026-11-25T11:30:00.000Z',
        type: 'status_changed',
        message: 'Status changed from Todo to In Progress',
        fromValue: 'todo',
        toValue: 'in_progress',
      },
    ],
    createdAt: '2026-11-21T15:20:00.000Z',
    updatedAt: '2026-11-25T11:30:00.000Z',
  },
  {
    id: 'SF-106',
    number: 106,
    title: 'Fix race condition in webhook idempotency lock under burst traffic',
    description:
      'Stripe and GitHub webhook retries arriving within 8ms bypass the read-then-insert check; migrate lock acquisition to INSERT ... ON CONFLICT DO NOTHING.',
    status: 'todo',
    priority: 'urgent',
    labels: ['Bug', 'Backend'],
    storyPoints: 5,
    dueDate: '2026-11-27',
    order: 0,
    subTasks: [
      {
        id: 'st-106-1',
        title: 'Reproduce duplicate event processing with k6 burst script',
        completed: true,
      },
      {
        id: 'st-106-2',
        title: 'Replace check-then-set with atomic upsert guard',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-106-1',
        timestamp: '2026-11-22T18:05:00.000Z',
        type: 'created',
        message: 'Issue SF-106 created in Todo',
      },
      {
        id: 'act-106-2',
        timestamp: '2026-11-23T09:15:00.000Z',
        type: 'priority_changed',
        message: 'Priority changed from High to Urgent',
        fromValue: 'high',
        toValue: 'urgent',
      },
    ],
    createdAt: '2026-11-22T18:05:00.000Z',
    updatedAt: '2026-11-23T09:15:00.000Z',
  },
  {
    id: 'SF-107',
    number: 107,
    title: 'Add optimistic drag-reorder drop indicators to sprint board columns',
    description:
      'Display an electric indigo insertion line between cards during HTML5 drag-and-drop and immediately persist per-column ordering to localStorage.',
    status: 'todo',
    priority: 'medium',
    labels: ['Frontend', 'UI/UX'],
    storyPoints: 2,
    dueDate: '2026-12-01',
    order: 1,
    subTasks: [
      {
        id: 'st-107-1',
        title: 'Compute mid-card pointer Y threshold for top/bottom insertion',
        completed: false,
      },
      {
        id: 'st-107-2',
        title: 'Prevent accidental click-to-open drawer immediately after drop',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-107-1',
        timestamp: '2026-11-23T12:00:00.000Z',
        type: 'created',
        message: 'Issue SF-107 created in Todo',
      },
    ],
    createdAt: '2026-11-23T12:00:00.000Z',
    updatedAt: '2026-11-23T12:00:00.000Z',
  },
  {
    id: 'SF-108',
    number: 108,
    title: 'Standardize tabular-nums alignment across metric badges and IDs',
    description:
      'Audit all issue identifiers (SF-xxx), story point pills, and analytics counters to enforce font-variant-numeric: tabular-nums.',
    status: 'done',
    priority: 'low',
    labels: ['UI/UX', 'Frontend'],
    storyPoints: 1,
    dueDate: '2026-11-23',
    order: 1,
    subTasks: [
      {
        id: 'st-108-1',
        title: 'Apply tabular-nums utility to list rows and board cards',
        completed: true,
      },
    ],
    activityLog: [
      {
        id: 'act-108-1',
        timestamp: '2026-11-18T14:45:00.000Z',
        type: 'created',
        message: 'Issue SF-108 created in Todo',
      },
      {
        id: 'act-108-2',
        timestamp: '2026-11-21T16:50:00.000Z',
        type: 'status_changed',
        message: 'Status changed from In Progress to Done',
        fromValue: 'in_progress',
        toValue: 'done',
      },
    ],
    createdAt: '2026-11-18T14:45:00.000Z',
    updatedAt: '2026-11-21T16:50:00.000Z',
  },
  {
    id: 'SF-109',
    number: 109,
    title: 'Multi-region Redis cluster failover runbook & chaos probes',
    description:
      'Automate weekly Toxiproxy latency injection tests for session store failover across us-east-1 and eu-central-1 clusters.',
    status: 'backlog',
    priority: 'low',
    labels: ['DevOps', 'Backend'],
    storyPoints: 8,
    dueDate: '2026-12-08',
    order: 0,
    subTasks: [
      {
        id: 'st-109-1',
        title: 'Define automated chaos schedule in GitHub Actions workflow',
        completed: false,
      },
      {
        id: 'st-109-2',
        title: 'Document manual sentinel promotion steps for on-call',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-109-1',
        timestamp: '2026-11-24T10:30:00.000Z',
        type: 'created',
        message: 'Issue SF-109 created in Backlog',
      },
    ],
    createdAt: '2026-11-24T10:30:00.000Z',
    updatedAt: '2026-11-24T10:30:00.000Z',
  },
  {
    id: 'SF-110',
    number: 110,
    title: 'Command palette fuzzy scoring & keyboard navigation hints',
    description:
      'Support non-contiguous character matching for issue titles and IDs alongside quick actions for view switching, urgent filtering, and theme toggling.',
    status: 'backlog',
    priority: 'medium',
    labels: ['Frontend', 'UI/UX'],
    storyPoints: 3,
    dueDate: '2026-12-04',
    order: 1,
    subTasks: [
      {
        id: 'st-110-1',
        title: 'Implement deterministic subsequence ranking algorithm',
        completed: false,
      },
      {
        id: 'st-110-2',
        title: 'Add keyboard shortcut glyphs for Cmd/Ctrl+K, C, and Esc',
        completed: false,
      },
    ],
    activityLog: [
      {
        id: 'act-110-1',
        timestamp: '2026-11-25T14:15:00.000Z',
        type: 'created',
        message: 'Issue SF-110 created in Backlog',
      },
    ],
    createdAt: '2026-11-25T14:15:00.000Z',
    updatedAt: '2026-11-25T14:15:00.000Z',
  },
];

export function cloneSeedIssues(): Issue[] {
  return SEED_ISSUES.map((issue) => ({
    ...issue,
    labels: [...issue.labels],
    subTasks: issue.subTasks.map((st) => ({ ...st })),
    activityLog: issue.activityLog.map((act) => ({ ...act })),
  }));
}
