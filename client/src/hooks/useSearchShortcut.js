import { useEffect, useState } from 'react';

/**
 * useSearchShortcut Hook
 * Provides global keyboard shortcut (Ctrl+K or Cmd+K) for search
 */
export const useSearchShortcut = (callback) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        callback();
      }
      
      // ESC to close
      if (event.key === 'Escape') {
        // Let individual components handle ESC
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
};

export default useSearchShortcut;
