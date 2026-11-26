import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileJson,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { Issue } from '../../types';
import { getTodayIsoDate } from '../../utils/formatters';
import {
  buildExportPayload,
  parseImportedJson,
  type PersistedIssueStore,
} from '../../utils/storage';
import { Kbd } from '../ui/Badge';

interface SettingsDataModalProps {
  open: boolean;
  issues: readonly Issue[];
  nextNumber: number;
  onClose: () => void;
  onImportStore: (store: PersistedIssueStore) => void;
  onResetDemoData: () => void;
  onNotify: (message: string, variant?: 'info' | 'success' | 'warning') => void;
}

export function SettingsDataModal({
  open,
  issues,
  nextNumber,
  onClose,
  onImportStore,
  onResetDemoData,
  onNotify,
}: SettingsDataModalProps) {
  const [pasteText, setPasteText] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const handleExportDownload = () => {
    const payload = buildExportPayload(issues, nextNumber);
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sprintforge-issues-${getTodayIsoDate()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    onNotify(`Exported ${issues.length} issues to JSON`, 'success');
  };

  const handleCopyExport = async () => {
    const payload = buildExportPayload(issues, nextNumber);
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 1800);
      onNotify('Copied SprintForge JSON backup to clipboard', 'info');
    } catch {
      onNotify('Unable to access clipboard in this browser context', 'warning');
    }
  };

  const processJsonImport = (rawText: string) => {
    setImportError('');
    const result = parseImportedJson(rawText);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    onImportStore(result.data);
    setPasteText('');
    onNotify(
      `Imported ${result.data.issues.length} issues successfully`,
      'success',
    );
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    processJsonImport(text);
    e.target.value = '';
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onResetDemoData();
    setConfirmReset(false);
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
        aria-label="Settings and Data Controls"
        className="animate-sf-slide-up relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface"
        style={{ boxShadow: 'var(--sf-shadow-lg)' }}
      >
        <div className="flex items-center justify-between border-b border-border-hairline px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink">
              Workspace Data &amp; Backup
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
            className="inline-flex items-center gap-1.5 rounded-md p-1 text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <Kbd>Esc</Kbd>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto sf-scrollbar p-5 text-xs">
          {/* Persistence Summary */}
          <div className="rounded-xl border border-border-hairline bg-canvas/50 p-3.5 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">Local Browser Persistence</p>
              <p className="mt-0.5 text-[11px] text-ink-secondary">
                All changes are automatically saved to{' '}
                <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[10px]">
                  localStorage
                </code>
                .
              </p>
            </div>
            <span className="rounded-full border border-border-hairline bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-ink tabular-nums">
              {issues.length} issues
            </span>
          </div>

          {/* Export Section */}
          <section className="space-y-2.5">
            <h3 className="font-semibold text-ink">Export Sprint Data</h3>
            <p className="text-[11px] text-ink-secondary">
              Download a full JSON snapshot of your issues, sub-tasks, and
              activity logs.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white transition hover:bg-accent-hover"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON File
              </button>
              <button
                type="button"
                onClick={handleCopyExport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-surface-2 px-3 py-2 text-xs font-medium text-ink transition hover:border-border-strong"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-ink-muted" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Import Section */}
          <section className="space-y-2.5 border-t border-border-hairline pt-4">
            <h3 className="font-semibold text-ink">Import JSON Backup</h3>
            <p className="text-[11px] text-ink-secondary">
              Upload an exported SprintForge JSON file or paste raw JSON below
              to restore a workspace.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-surface-2 px-3 py-2 text-xs font-medium text-ink transition hover:border-border-strong hover:bg-surface-hover"
            >
              <Upload className="h-3.5 w-3.5 text-accent" />
              Choose JSON File...
            </button>

            <textarea
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (importError) setImportError('');
              }}
              rows={3}
              placeholder='Or paste exported JSON here ({"version": 1, "issues": [...]})'
              className="w-full rounded-lg border border-border-hairline bg-canvas/60 p-2.5 font-mono text-[11px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />

            {importError && (
              <p className="text-xs text-rose-400">{importError}</p>
            )}

            <button
              type="button"
              disabled={!pasteText.trim()}
              onClick={() => processJsonImport(pasteText)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-border bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent hover:text-white disabled:opacity-40"
            >
              Import Pasted JSON
            </button>
          </section>

          {/* Reset Demo Data */}
          <section className="space-y-2.5 border-t border-border-hairline pt-4">
            <h3 className="font-semibold text-ink">Reset to Demo Data</h3>
            <p className="text-[11px] text-ink-secondary">
              Restore the original 10 SprintForge engineering seed issues across
              all workflow columns.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/35 bg-amber-500/12 px-3.5 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20"
              >
                {confirmReset ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Confirm Reset Demo Data
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to Demo Data
                  </>
                )}
              </button>
              {confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg px-2.5 py-2 text-xs text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
