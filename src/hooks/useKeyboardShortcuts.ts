import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  isCommandPaletteOpen: boolean;
  isCreateModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isDrawerOpen: boolean;
  onToggleCommandPalette: () => void;
  onOpenCreateModal: () => void;
  onEscape: () => void;
  onFocusSearch: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  if (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  ) {
    return true;
  }
  return target.isContentEditable || target.closest('[contenteditable="true"]') !== null;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const {
    isCommandPaletteOpen,
    isCreateModalOpen,
    isSettingsModalOpen,
    isDrawerOpen,
    onToggleCommandPalette,
    onOpenCreateModal,
    onEscape,
    onFocusSearch,
  } = options;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onToggleCommandPalette();
        return;
      }

      if (event.key === 'Escape') {
        if (
          isCommandPaletteOpen ||
          isCreateModalOpen ||
          isSettingsModalOpen ||
          isDrawerOpen
        ) {
          event.preventDefault();
          onEscape();
        }
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (
        isCommandPaletteOpen ||
        isCreateModalOpen ||
        isSettingsModalOpen
      ) {
        return;
      }

      if (
        event.key.toLowerCase() === 'c' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        window.setTimeout(() => {
          onOpenCreateModal();
        }, 0);
        return;
      }

      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        window.setTimeout(() => {
          onFocusSearch();
        }, 0);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommandPaletteOpen,
    isCreateModalOpen,
    isSettingsModalOpen,
    isDrawerOpen,
    onToggleCommandPalette,
    onOpenCreateModal,
    onEscape,
    onFocusSearch,
  ]);
}
