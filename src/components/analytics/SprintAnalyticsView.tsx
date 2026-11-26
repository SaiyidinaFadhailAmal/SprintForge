import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Layers,
  TrendingUp,
} from 'lucide-react';
import {
  LABEL_META,
  LABEL_OPTIONS,
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from '../../data/constants';
import type { Issue } from '../../types';
import {
  formatRelativeTimestamp,
  isOverdue,
} from '../../utils/formatters';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';

interface SprintAnalyticsViewProps {
  issues: readonly Issue[];
  onSelectIssue: (issueId: string) => void;
}

export function SprintAnalyticsView({
  issues,
  onSelectIssue,
}: SprintAnalyticsViewProps) {
  const totalIssues = issues.length;
  const doneIssues = issues.filter((i) => i.status === 'done');
  const inFlightIssues = issues.filter(
    (i) => i.status === 'in_progress' || i.status === 'in_review',
  );
  const urgentOpen = issues.filter(
    (i) => i.priority === 'urgent' && i.status !== 'done',
  );
  const overdueIssues = issues.filter((i) => isOverdue(i.dueDate, i.status));

  const totalPoints = issues.reduce((sum, i) => sum + i.storyPoints, 0);
  const completedPoints = doneIssues.reduce(
    (sum, i) => sum + i.storyPoints,
    0,
  );
  const inFlightPoints = inFlightIssues.reduce(
    (sum, i) => sum + i.storyPoints,
    0,
  );

  const issueCompletionPct =
    totalIssues > 0 ? Math.round((doneIssues.length / totalIssues) * 100) : 0;
  const pointsCompletionPct =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Sub-task completion across sprint
  const totalSubTasks = issues.reduce((sum, i) => sum + i.subTasks.length, 0);
  const completedSubTasks = issues.reduce(
    (sum, i) => sum + i.subTasks.filter((st) => st.completed).length,
    0,
  );

  // SVG Ring Math
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const issueOffset =
    ringCircumference - (issueCompletionPct / 100) * ringCircumference;

  const innerRadius = 40;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const pointsOffset =
    innerCircumference - (pointsCompletionPct / 100) * innerCircumference;

  // Status breakdown
  const statusBreakdown = STATUS_ORDER.map((status) => {
    const items = issues.filter((i) => i.status === status);
    const points = items.reduce((s, i) => s + i.storyPoints, 0);
    return {
      status,
      meta: STATUS_META[status],
      count: items.length,
      points,
    };
  });
  const maxStatusCount = Math.max(
    1,
    ...statusBreakdown.map((item) => item.count),
  );

  // Priority breakdown
  const priorityBreakdown = PRIORITY_ORDER.map((priority) => {
    const items = issues.filter((i) => i.priority === priority);
    const points = items.reduce((s, i) => s + i.storyPoints, 0);
    return {
      priority,
      meta: PRIORITY_META[priority],
      count: items.length,
      points,
    };
  });
  const maxPriorityCount = Math.max(
    1,
    ...priorityBreakdown.map((item) => item.count),
  );

  // Label workload distribution (story points)
  const labelDistribution = LABEL_OPTIONS.map((label) => {
    const matching = issues.filter((i) => i.labels.includes(label));
    const points = matching.reduce((s, i) => s + i.storyPoints, 0);
    const completedPts = matching
      .filter((i) => i.status === 'done')
      .reduce((s, i) => s + i.storyPoints, 0);
    return {
      label,
      meta: LABEL_META[label],
      count: matching.length,
      points,
      completedPts,
    };
  });
  const totalLabelPoints = Math.max(
    1,
    labelDistribution.reduce((sum, item) => sum + item.points, 0),
  );

  // Recent Activity Feed across sprint
  const recentActivity = issues
    .flatMap((issue) =>
      issue.activityLog.map((entry) => ({
        issueId: issue.id,
        issueTitle: issue.title,
        entry,
      })),
    )
    .sort((a, b) => b.entry.timestamp.localeCompare(a.entry.timestamp))
    .slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto sf-scrollbar p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Top Row: Completion Progress Ring + Velocity Summary Cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Completion Ring Card */}
          <div className="flex flex-col justify-between rounded-xl border border-border-hairline bg-surface p-5 lg:col-span-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Sprint Completion Rate
                </h2>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Cycle 14 progress across issues and story points
                </p>
              </div>
              <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] font-medium text-accent">
                Active Cycle
              </span>
            </div>

            <div className="my-5 flex flex-wrap items-center justify-center gap-6 sm:justify-start">
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                <svg
                  viewBox="0 0 140 140"
                  className="h-36 w-36 -rotate-90"
                  role="img"
                  aria-label={`Sprint completion ${issueCompletionPct}% issues, ${pointsCompletionPct}% story points`}
                >
                  {/* Outer Track (Issues) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-surface-2"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={issueOffset}
                    className="transition-all duration-500"
                  />
                  {/* Inner Track (Story Points) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={innerRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-surface-2"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={innerRadius}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={innerCircumference}
                    strokeDashoffset={pointsOffset}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-xl font-bold text-ink tabular-nums">
                    {pointsCompletionPct}%
                  </span>
                  <span className="text-[10px] font-medium text-ink-muted">
                    Points Done
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <div>
                    <div className="text-ink-secondary">Issue Completion</div>
                    <div className="font-mono font-semibold text-ink tabular-nums">
                      {issueCompletionPct}% ({doneIssues.length}/{totalIssues})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-ink-secondary">Velocity Delivered</div>
                    <div className="font-mono font-semibold text-ink tabular-nums">
                      {completedPoints} / {totalPoints} pts
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div>
                    <div className="text-ink-secondary">Sub-tasks Closed</div>
                    <div className="font-mono font-semibold text-ink tabular-nums">
                      {completedSubTasks} / {totalSubTasks}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Velocity KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            <div className="rounded-xl border border-border-hairline bg-surface p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-secondary">
                  Sprint Velocity Scope
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-2xl font-bold text-ink tabular-nums">
                  {totalPoints}{' '}
                  <span className="text-sm font-normal text-ink-muted">
                    pts
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">
                  Across{' '}
                  <span className="font-mono font-medium text-ink tabular-nums">
                    {totalIssues}
                  </span>{' '}
                  tracked engineering issues
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border-hairline bg-surface p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-secondary">
                  Delivered This Cycle
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-2xl font-bold text-ink tabular-nums">
                  {completedPoints}{' '}
                  <span className="text-sm font-normal text-ink-muted">
                    pts
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">
                  <span className="font-mono font-medium text-emerald-400 tabular-nums">
                    {doneIssues.length}
                  </span>{' '}
                  issues shipped to Done
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border-hairline bg-surface p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-secondary">
                  Active Work In Flight
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-2xl font-bold text-ink tabular-nums">
                  {inFlightIssues.length}{' '}
                  <span className="text-sm font-normal text-ink-muted">
                    issues
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">
                  <span className="font-mono font-medium text-ink tabular-nums">
                    {inFlightPoints} pts
                  </span>{' '}
                  in Progress &amp; Review
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border-hairline bg-surface p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-secondary">
                  Risk &amp; Urgency Radar
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-2xl font-bold text-ink tabular-nums">
                  {urgentOpen.length}{' '}
                  <span className="text-sm font-normal text-ink-muted">
                    urgent
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">
                  <span className="font-mono font-medium text-rose-400 tabular-nums">
                    {overdueIssues.length}
                  </span>{' '}
                  overdue open{' '}
                  {overdueIssues.length === 1 ? 'issue' : 'issues'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Status Breakdown & Priority Breakdown Bar Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Status Breakdown */}
          <section className="rounded-xl border border-border-hairline bg-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Issue Breakdown by Status
                </h3>
                <p className="text-xs text-ink-secondary">
                  Live distribution across sprint workflow columns
                </p>
              </div>
              <Layers className="h-4 w-4 text-ink-muted" />
            </div>

            <div className="space-y-3.5">
              {statusBreakdown.map((row) => {
                const widthPct = Math.round((row.count / maxStatusCount) * 100);
                const sharePct =
                  totalIssues > 0
                    ? Math.round((row.count / totalIssues) * 100)
                    : 0;
                return (
                  <div key={row.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={row.status} />
                        <span className="font-medium text-ink">
                          {row.meta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-secondary tabular-nums">
                        <span>{row.points} pt</span>
                        <span className="text-ink-muted">·</span>
                        <span className="font-semibold text-ink">
                          {row.count}
                        </span>
                        <span className="w-9 text-right text-ink-muted">
                          ({sharePct}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${row.meta.barClass}`}
                        style={{
                          width: `${row.count > 0 ? Math.max(4, widthPct) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Priority Breakdown (Custom SVG Bar Chart + Crisp Legend) */}
          <section className="rounded-xl border border-border-hairline bg-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Issue Breakdown by Priority
                </h3>
                <p className="text-xs text-ink-secondary">
                  Volume and story point allocation per severity tier
                </p>
              </div>
            </div>

            {/* Custom SVG Vertical Column Chart */}
            <div className="rounded-lg border border-border-hairline bg-canvas/50 p-4">
              <svg
                viewBox="0 0 360 150"
                className="h-40 w-full"
                role="img"
                aria-label="Issue breakdown bar chart by priority"
              >
                {/* Horizontal grid hairlines */}
                {[20, 50, 80, 110].map((y) => (
                  <line
                    key={y}
                    x1="16"
                    y1={y}
                    x2="344"
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-border-hairline"
                  />
                ))}

                {priorityBreakdown.map((item, idx) => {
                  const slotWidth = 80;
                  const barWidth = 36;
                  const x = 32 + idx * slotWidth;
                  const maxBarHeight = 90;
                  const barHeight =
                    item.count > 0
                      ? Math.max(8, (item.count / maxPriorityCount) * maxBarHeight)
                      : 2;
                  const y = 114 - barHeight;

                  return (
                    <g key={item.priority}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        fill={item.meta.color}
                        fillOpacity={item.count > 0 ? 0.9 : 0.2}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        className="fill-ink font-mono text-[11px] font-semibold"
                      >
                        {item.count}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y="134"
                        textAnchor="middle"
                        className="fill-ink-secondary text-[11px] font-medium"
                      >
                        {item.meta.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {priorityBreakdown.map((item) => (
                <div
                  key={item.priority}
                  className="flex items-center justify-between rounded-lg border border-border-hairline bg-surface-2/40 px-2.5 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-ink-secondary">
                    <PriorityIcon priority={item.priority} />
                    <span>{item.meta.label}</span>
                  </span>
                  <span className="font-mono text-[11px] font-medium text-ink tabular-nums">
                    {item.points}p
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Row: Workload by Label + Recent Sprint Activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Story Points Workload by Tag/Category */}
          <section className="rounded-xl border border-border-hairline bg-surface p-5 lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Story Points Workload by Category
                </h3>
                <p className="text-xs text-ink-secondary">
                  Proportional effort across engineering disciplines
                </p>
              </div>
              <span className="font-mono text-xs text-ink-muted tabular-nums">
                {totalLabelPoints} tag-pts
              </span>
            </div>

            {/* Stacked Distribution Bar */}
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
              {labelDistribution.map((item) => {
                if (item.points === 0) return null;
                const widthPct = (item.points / totalLabelPoints) * 100;
                return (
                  <div
                    key={item.label}
                    title={`${item.label}: ${item.points} pts`}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: item.meta.color,
                    }}
                    className="h-full border-r border-surface last:border-r-0 transition-all duration-500"
                  />
                );
              })}
            </div>

            {/* Category Cards */}
            <div className="mt-4 space-y-2.5">
              {labelDistribution.map((item) => {
                const pct = Math.round((item.points / totalLabelPoints) * 100);
                const donePct =
                  item.points > 0
                    ? Math.round((item.completedPts / item.points) * 100)
                    : 0;
                return (
                  <div
                    key={item.label}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-hairline bg-surface-2/30 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-[120px]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.meta.color }}
                      />
                      <span className="font-medium text-ink">{item.label}</span>
                      <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                        ({item.count})
                      </span>
                    </div>

                    <div className="flex flex-1 items-center gap-3 max-w-xs">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.meta.color,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-[11px] text-ink-secondary tabular-nums">
                        {pct}%
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-ink-secondary tabular-nums">
                      <span className="font-semibold text-ink">
                        {item.points}
                      </span>{' '}
                      pts ·{' '}
                      <span className="text-emerald-400">{donePct}% done</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Sprint Activity */}
          <section className="rounded-xl border border-border-hairline bg-surface p-5 lg:col-span-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Recent Activity Feed
                </h3>
                <p className="text-xs text-ink-secondary">
                  Live sprint state transitions
                </p>
              </div>
              <Activity className="h-4 w-4 text-ink-muted" />
            </div>

            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-muted">
                No activity recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(({ issueId, issueTitle, entry }) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onSelectIssue(issueId)}
                    className="flex w-full items-start gap-2.5 rounded-lg border border-transparent p-2 text-left transition hover:border-border-hairline hover:bg-surface-hover/60"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-medium text-accent tabular-nums">
                          {issueId}
                        </span>
                        <span className="font-mono text-[10px] text-ink-muted tabular-nums">
                          {formatRelativeTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-ink">
                        {entry.message}
                      </p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {issueTitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
