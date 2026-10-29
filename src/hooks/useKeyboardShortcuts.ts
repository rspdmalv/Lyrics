/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

export interface ShortcutHandlers {
  onTogglePlay?: () => void;
  onNudgeDown?: () => void;
  onNudgeUp?: () => void;
  onSpeedUp?: () => void;
  onSpeedDown?: () => void;
  onFontSizeIncrease?: () => void;
  onFontSizeDecrease?: () => void;
  onResetToTop?: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  onToggleFullscreen?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts if typing inside an editable field
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlers.onTogglePlay?.();
          break;

        case 'ArrowDown':
          e.preventDefault();
          handlers.onNudgeDown?.();
          break;

        case 'ArrowUp':
          e.preventDefault();
          handlers.onNudgeUp?.();
          break;

        case 'Equal': // '+' key on most keyboards
        case 'NumpadAdd':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.onFontSizeIncrease?.();
          }
          break;

        case 'Minus': // '-' key
        case 'NumpadSubtract':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.onFontSizeDecrease?.();
          }
          break;

        case 'Home':
          e.preventDefault();
          handlers.onResetToTop?.();
          break;

        case 'KeyF':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.onToggleFullscreen?.();
          }
          break;

        case 'BracketRight':
        case 'KeyD': // also allow D / A for quick speed
          handlers.onSpeedUp?.();
          break;

        case 'BracketLeft':
        case 'KeyA':
          handlers.onSpeedDown?.();
          break;

        case 'KeyN':
          if (!e.ctrlKey && !e.metaKey) {
            handlers.onNextSong?.();
          }
          break;

        case 'KeyP':
          if (!e.ctrlKey && !e.metaKey) {
            handlers.onPrevSong?.();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, enabled]);
}
