// Hook for undo/redo operations
import { useCallback, useEffect } from 'react';
import { useUndoStore } from '../store/undoSlice';
import { useProjectStore } from '../store/projectSlice';
import { useSelectionStore } from '../store/selectionSlice';
import { cacheService } from '../services/cache-service';
import { pdfService } from '../services/pdf-service';
import type { OperationPayload } from '../../shared/types/operations';

export function useUndoRedo() {
  const undoStore = useUndoStore();
  const projectStore = useProjectStore();
  const selectionStore = useSelectionStore();

  /**
   * Apply an operation payload to the project state
   */
  const applyOperation = useCallback(async (payload: OperationPayload) => {
    switch (payload.type) {
      case 'INSERT_PAGES':
        // Re-insert pages at their original positions
        for (const pageRef of payload.pageRefs) {
          const document = projectStore.getDocumentById(pageRef.documentId);
          if (document) {
            const page = document.pages.find((p) => p.id === pageRef.pageId);
            if (page) {
              projectStore.addPagesToOutput(
                pageRef.documentId,
                [page.id],
                payload.insertIndex
              );
            }
          }
        }
        break;

      case 'DELETE_PAGES':
        projectStore.removePagesFromOutput(payload.pageRefIds);
        selectionStore.deselectAll();
        break;

      case 'REORDER_PAGES':
        for (const move of payload.moves) {
          projectStore.reorderPages(move.pageRefId, move.pageRefId); // Simplified
        }
        break;

      case 'ROTATE_PAGES':
        for (const rotation of payload.rotations) {
          // Find the page and set its rotation directly
          const page = projectStore.getPageById(rotation.pageId);
          if (page) {
            // We need to calculate how many times to rotate
            const currentRotation = page.rotation;
            const targetRotation = rotation.newRotation;
            const diff = (targetRotation - currentRotation + 360) % 360;
            const rotations = diff / 90;
            
            for (let i = 0; i < rotations; i++) {
              projectStore.rotatePage(rotation.pageId, true);
            }
            
            // Invalidate cache
            cacheService.invalidatePage(page.documentId, page.originalIndex);
          }
        }
        break;

      case 'ADD_DOCUMENT':
        // Re-load document from disk
        try {
          const { document } = await pdfService.loadPdf(payload.filePath);
          projectStore.addDocument(document);
        } catch (error) {
          console.error('Failed to redo ADD_DOCUMENT:', error);
        }
        break;

      case 'REMOVE_DOCUMENT':
        projectStore.removeDocument(payload.documentId);
        break;
    }
  }, [projectStore, selectionStore]);

  /**
   * Perform undo
   */
  const performUndo = useCallback(async () => {
    const operation = undoStore.undo();
    if (!operation) return false;

    // Apply the inverse operation
    await applyOperation(operation.inverse);
    return true;
  }, [undoStore, applyOperation]);

  /**
   * Perform redo
   */
  const performRedo = useCallback(async () => {
    const operation = undoStore.redo();
    if (!operation) return false;

    // Re-apply the original operation
    await applyOperation(operation.payload);
    return true;
  }, [undoStore, applyOperation]);

  return {
    performUndo,
    performRedo,
    canUndo: undoStore.canUndo(),
    canRedo: undoStore.canRedo()
  };
}

/**
 * Hook to setup keyboard shortcuts for undo/redo
 */
export function useUndoRedoKeyboard() {
  const { performUndo, performRedo } = useUndoRedo();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      const isMod = e.ctrlKey || e.metaKey;
      
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      } else if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        performRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performUndo, performRedo]);
}
