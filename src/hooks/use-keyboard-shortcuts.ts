'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onFocusInput?: () => void;
  onNewChat?: () => void;
  onStopStreaming?: () => void;
  onCloseSidebar?: () => void;
  onEditLastMessage?: () => void;
  isStreaming?: boolean;
  isSidebarOpen?: boolean;
}

export function useKeyboardShortcuts({
  onFocusInput,
  onNewChat,
  onStopStreaming,
  onCloseSidebar,
  onEditLastMessage,
  isStreaming = false,
  isSidebarOpen = false,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + K: Focus input
      if (modifier && e.key === 'k') {
        e.preventDefault();
        onFocusInput?.();
        return;
      }

      // Ctrl/Cmd + N: New chat
      if (modifier && e.key === 'n') {
        e.preventDefault();
        onNewChat?.();
        return;
      }

      // Escape: Stop streaming or close sidebar
      if (e.key === 'Escape') {
        if (isStreaming) {
          onStopStreaming?.();
        } else if (isSidebarOpen) {
          onCloseSidebar?.();
        }
        return;
      }
    },
    [
      onFocusInput,
      onNewChat,
      onStopStreaming,
      onCloseSidebar,
      isStreaming,
      isSidebarOpen,
      onEditLastMessage,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
