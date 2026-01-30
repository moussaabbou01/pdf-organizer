// Hook for menu command handlers
import { useEffect } from 'react';
import { usePdfOperations } from './usePdfOperations';
import { useUndoRedo } from './useUndoRedo';
import { useSelection } from './useSelection';
import { useUIStore } from '../store/uiSlice';

export function useMenuCommands() {
  const { openFiles, exportPdf, deleteSelectedPages, rotateSelectedPages } = usePdfOperations();
  const { performUndo, performRedo } = useUndoRedo();
  const { selectAll, deselectAll } = useSelection();
  const uiStore = useUIStore();

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // File menu
    unsubscribers.push(
      window.electronAPI.onMenuCommand('open-file', openFiles)
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('export', exportPdf)
    );

    // Edit menu
    unsubscribers.push(
      window.electronAPI.onMenuCommand('undo', performUndo)
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('redo', performRedo)
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('select-all', selectAll)
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('deselect-all', deselectAll)
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('delete-selected', deleteSelectedPages)
    );

    // Page menu
    unsubscribers.push(
      window.electronAPI.onMenuCommand('rotate-cw', () => rotateSelectedPages(true))
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('rotate-ccw', () => rotateSelectedPages(false))
    );

    // View menu
    unsubscribers.push(
      window.electronAPI.onMenuCommand('zoom-in', () => uiStore.zoomIn())
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('zoom-out', () => uiStore.zoomOut())
    );
    unsubscribers.push(
      window.electronAPI.onMenuCommand('zoom-reset', () => uiStore.resetZoom())
    );

    // Help menu
    unsubscribers.push(
      window.electronAPI.onMenuCommand('about', () => uiStore.openAboutDialog())
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [
    openFiles,
    exportPdf,
    performUndo,
    performRedo,
    selectAll,
    deselectAll,
    deleteSelectedPages,
    rotateSelectedPages,
    uiStore
  ]);
}
