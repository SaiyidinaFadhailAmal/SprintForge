import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  LABEL_META,
  LABEL_OPTIONS,
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  STORY_POINT_OPTIONS,
} from '../../data/constants';
import type {
  CreateIssueInput,
  IssueLabel,
  IssuePriority,
  IssueStatus,
  StoryPoints,
} from '../../types';
import { cn } from '../../utils/cn';
import { PriorityIcon } from '../icons/PriorityIcon';
import { StatusIcon } from '../icons/StatusIcon';
import { Kbd } from '../ui/Badge';

interface CreateIssueModalProps {
  open: boolean;
  defaultStatus: IssueStatus;
  nextIssueNumber: number;
  onClose: () => void;
  onCreate: (input: CreateIssueInput) => void;
}

export function CreateIssueModal({
  open,
  defaultStatus,
  nextIssueNumber,
  onClose,
  onCreate,
}: CreateIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>(defaultStatus);
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [labels, setLabels] = useState<IssueLabel[]>(['Frontend']);
  const [storyPoints, setStoryPoints] = useState<StoryPoints>(3);
  const [dueDate, setDueDate] = useState('');
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [subTaskDraft, setSubTaskDraft] = useState('');
  const [error, setError] = useState('');

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => titleInputRef.current?.focus(), 20);
    }
  }, [open]);

  if (!open) return null;

  const toggleLabel = (label: IssueLabel) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleAddSubTaskDraft = () => {
    const trimmed = subTaskDraft.trim();
    if (!trimmed) return;
    setSubTasks((prev) => [...prev, trimmed]);
    setSubTaskDraft('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter an issue title.');
      titleInputRef.current?.focus();
      return;
    }

    onCreate({
      title: trimmedTitle,
      description,
      status,
      priority,
      labels,
      storyPoints,
      dueDate: dueDate || null,
      subTasks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-sf-fade-in fixed inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create new issue"
        className="animate-sf-slide-up relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface"
        style={{ boxShadow: 'var(--sf-shadow-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs font-medium text-accent tabular-nums">
              SF-{nextIssueNumber}
            </span>
            <h2 className="text-sm font-semibold text-ink">Create New Issue</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex items-center gap-1.5 rounded-md p-1 text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <Kbd>Esc</Kbd>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto sf-scrollbar"
        >
          <div className="space-y-4 p-5">
            <div>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Issue title (e.g., Implement webhook retry backoff queue)"
                aria-label="Issue title"
                className="w-full rounded-lg border border-border-hairline bg-canvas/60 px-3 py-2 text-sm font-medium text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
              {error && (
                <p className="mt-1 text-xs text-rose-400">{error}</p>
              )}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add description, technical context, or acceptance criteria..."
              aria-label="Issue description"
              className="w-full resize-y rounded-lg border border-border-hairline bg-canvas/60 px-3 py-2 text-xs leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />

            {/* Status & Priority Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-ink-muted">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IssueStatus)}
                    className="h-9 w-full rounded-lg border border-border-hairline bg-canvas/60 px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <StatusIcon status={status} className="h-3.5 w-3.5" />
                  <span>Selected: {STATUS_META[status].label}</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-ink-muted">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="h-9 w-full rounded-lg border border-border-hairline bg-canvas/60 px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
                >
                  {PRIORITY_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <PriorityIcon priority={priority} />
                  <span>Selected: {PRIORITY_META[priority].label}</span>
                </div>
              </div>
            </div>

            {/* Story Points & Due Date */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-[11px] font-medium text-ink-muted">
                  Story Points
                </span>
                <div className="flex items-center gap-1.5">
                  {STORY_POINT_OPTIONS.map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setStoryPoints(pts)}
                      className={cn(
                        'h-8 flex-1 rounded-lg border font-mono text-xs font-medium tabular-nums transition',
                        storyPoints === pts
                          ? 'border-accent bg-accent text-white'
                          : 'border-border-hairline bg-canvas/60 text-ink-secondary hover:border-border-strong hover:text-ink',
                      )}
                    >
                      {pts}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-ink-muted">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 w-full rounded-lg border border-border-hairline bg-canvas/60 px-2.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <span className="mb-1.5 block text-[11px] font-medium text-ink-muted">
                Labels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LABEL_OPTIONS.map((label) => {
                  const selected = labels.includes(label);
                  const meta = LABEL_META[label];
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition',
                        selected
                          ? meta.badgeClass
                          : 'border-border-hairline bg-canvas/60 text-ink-muted hover:border-border-strong hover:text-ink',
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: selected ? meta.color : 'currentColor',
                        }}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Initial Sub-tasks */}
            <div>
              <span className="mb-1.5 block text-[11px] font-medium text-ink-muted">
                Sub-tasks (optional)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subTaskDraft}
                  onChange={(e) => setSubTaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubTaskDraft();
                    }
                  }}
                  placeholder="Add initial sub-task item..."
                  className="h-8 flex-1 rounded-lg border border-border-hairline bg-canvas/60 px-3 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubTaskDraft}
                  disabled={!subTaskDraft.trim()}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border-hairline bg-surface-2 px-2.5 text-xs font-medium text-ink transition hover:border-border-strong disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              {subTasks.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {subTasks.map((item, idx) => (
                    <li
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between rounded-md border border-border-hairline bg-canvas/40 px-2.5 py-1.5 text-xs text-ink"
                    >
                      <span className="truncate">{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSubTasks((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="text-ink-muted hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border-hairline bg-surface-2/40 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-hairline bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
