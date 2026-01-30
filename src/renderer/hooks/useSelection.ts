// Hook for page selection with keyboard modifiers
import { useCallback, useEffect } from 'react';
import { useSelectionStore } from '../store/selectionSlice';
import { useProjectStore } from '../store/projectSlice';

export function useSelection() {
  const selectionStore = useSelectionStore();
  const projectStore = useProjectStore();

  /**
   * Handle page click with modifier keys
   */
  const handlePageClick = useCallback((
    pageRefId: string,
    event: React.MouseEvent
  ) => {
    const allIds = projectStore.project.outputPages.map((p) => p.id);
    
    selectionStore.select(
      pageRefId,
      event.ctrlKey || event.metaKey,  // multiSelect
      event.shiftKey,                   // rangeSelect
      allIds                            // for range selection
    );
  }, [selectionStore, projectStore]);

  /**
   * Select all pages
   */
  const selectAll = useCallback(() => {
    const allIds = projectStore.project.outputPages.map((p) => p.id);
    selectionStore.selectAll(allIds);
  }, [selectionStore, projectStore]);

  /**
   * Deselect all
   */
  const deselectAll = useCallback(() => {
    selectionStore.deselectAll();
  }, [selectionStore]);

  /**
   * Check if a page is selected
   */
  const isSelected = useCallback((pageRefId: string) => {
    return selectionStore.isSelected(pageRefId);
  }, [selectionStore]);

  return {
    selectedIds: selectionStore.getSelectedIds(),
    selectedCount: selectionStore.getSelectedCount(),
    handlePageClick,
    selectAll,
    deselectAll,
    isSelected
  };
}

/**
 * Hook for selection keyboard shortcuts
 */
export function useSelectionKeyboard() {
  const { selectAll, deselectAll } = useSelection();
  const projectStore = useProjectStore();
  const selectionStore = useSelectionStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 'a') {
        e.preventDefault();
        selectAll();
      } else if (e.key === 'Escape') {
        deselectAll();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete is handled by the PDF operations hook
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, deselectAll]);
}
