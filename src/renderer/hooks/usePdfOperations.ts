// Hook for PDF operations - loading, exporting, etc.
import { useCallback } from 'react';
import { useProjectStore } from '../store/projectSlice';
import { useUIStore } from '../store/uiSlice';
import { useUndoStore } from '../store/undoSlice';
import { useSelectionStore } from '../store/selectionSlice';
import { pdfService } from '../services/pdf-service';
import { cacheService } from '../services/cache-service';
import type { ExportRequest, ExportPageInfo } from '../../shared/types/ipc';
import type { Rotation } from '../../shared/types/project';

export function usePdfOperations() {
  const projectStore = useProjectStore();
  const uiStore = useUIStore();
  const undoStore = useUndoStore();
  const selectionStore = useSelectionStore();

  /**
   * Open file dialog and load selected PDFs
   */
  const openFiles = useCallback(async () => {
    const result = await window.electronAPI.openFileDialog();
    
    if (result.canceled || result.filePaths.length === 0) {
      return;
    }

    uiStore.setLoading(true, 'Loading PDFs...');

    try {
      for (const filePath of result.filePaths) {
        const { document } = await pdfService.loadPdf(filePath);
        projectStore.addDocument(document);
        
        // Record for undo
        undoStore.execute(
          'ADD_DOCUMENT',
          { type: 'ADD_DOCUMENT', documentId: document.id, filePath },
          { type: 'REMOVE_DOCUMENT', documentId: document.id }
        );
      }
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert(`Failed to load PDF: ${(error as Error).message}`);
    } finally {
      uiStore.setLoading(false);
    }
  }, [projectStore, uiStore, undoStore]);

  /**
   * Export merged PDF
   */
  const exportPdf = useCallback(async () => {
    const { project } = projectStore;
    
    if (project.outputPages.length === 0) {
      alert('No pages to export. Please add some PDFs first.');
      return;
    }

    // Get save path
    const result = await window.electronAPI.saveFileDialog('merged.pdf');
    
    if (result.canceled || !result.filePath) {
      return;
    }

    // Build export request
    const pages: ExportPageInfo[] = project.outputPages.map((pageRef) => {
      const document = project.documents.find((d) => d.id === pageRef.documentId);
      const page = document?.pages.find((p) => p.id === pageRef.pageId);
      
      if (!document || !page) {
        throw new Error('Invalid page reference');
      }

      return {
        filePath: document.filePath,
        pageIndex: page.originalIndex,
        rotation: page.rotation
      };
    });

    const request: ExportRequest = {
      outputPath: result.filePath,
      pages
    };

    // Setup progress listener
    const unsubscribe = window.electronAPI.onExportProgress((progress) => {
      uiStore.setExportProgress(progress);
    });

    uiStore.openProgressDialog();

    try {
      const exportResult = await window.electronAPI.exportPdf(request);
      
      // Unsubscribe from progress updates
      unsubscribe();
      
      if (exportResult.success) {
        projectStore.markClean();
        // Show complete state
        uiStore.setExportProgress({
          phase: 'complete',
          current: pages.length,
          total: pages.length,
          message: 'Export complete!'
        });
      } else {
        // Show error state
        uiStore.setExportProgress({
          phase: 'error',
          current: 0,
          total: pages.length,
          message: 'Export failed',
          error: exportResult.error
        });
      }
      
      // Close dialog after a short delay
      setTimeout(() => {
        uiStore.closeProgressDialog();
        uiStore.setExportProgress(null);
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      unsubscribe();
      uiStore.setExportProgress({
        phase: 'error',
        current: 0,
        total: pages.length,
        message: 'Export failed',
        error: (error as Error).message
      });
      setTimeout(() => {
        uiStore.closeProgressDialog();
        uiStore.setExportProgress(null);
      }, 1500);
    }
  }, [projectStore, uiStore]);

  /**
   * Delete selected pages
   */
  const deleteSelectedPages = useCallback(() => {
    const selectedIds = selectionStore.getSelectedIds();
    
    if (selectedIds.length === 0) return;

    // Store previous state for undo
    const previousState = selectedIds.map((id) => {
      const pageRef = projectStore.getPageRefById(id);
      return pageRef ? { pageRef: { ...pageRef }, position: pageRef.position } : null;
    }).filter((s): s is { pageRef: any; position: number } => s !== null);

    // Execute delete
    projectStore.removePagesFromOutput(selectedIds);
    selectionStore.deselectAll();

    // Record for undo
    undoStore.execute(
      'DELETE_PAGES',
      { type: 'DELETE_PAGES', pageRefIds: selectedIds, previousState },
      { type: 'INSERT_PAGES', pageRefs: previousState.map((s) => s.pageRef), insertIndex: Math.min(...previousState.map((s) => s.position)) }
    );
  }, [projectStore, selectionStore, undoStore]);

  /**
   * Rotate selected pages
   */
  const rotateSelectedPages = useCallback((clockwise: boolean) => {
    const selectedIds = selectionStore.getSelectedIds();
    
    if (selectedIds.length === 0) return;

    // Get current rotations for undo
    const previousRotations = selectedIds.map((id) => {
      const pageRef = projectStore.getPageRefById(id);
      const page = pageRef ? projectStore.getPageById(pageRef.pageId) : undefined;
      return page ? { pageId: page.id, oldRotation: page.rotation } : null;
    }).filter((r): r is { pageId: string; oldRotation: Rotation } => r !== null);

    // Execute rotation
    projectStore.rotateSelectedPages(selectedIds, clockwise);

    // Invalidate thumbnail cache for rotated pages
    for (const pageRef of projectStore.project.outputPages) {
      if (selectedIds.includes(pageRef.id)) {
        const page = projectStore.getPageById(pageRef.pageId);
        if (page) {
          cacheService.invalidatePage(pageRef.documentId, page.originalIndex);
        }
      }
    }

    // Get new rotations
    const newRotations = previousRotations.map((prevRot) => {
      const page = projectStore.getPageById(prevRot.pageId);
      return { pageId: prevRot.pageId, newRotation: page?.rotation ?? 0 };
    });

    // Record for undo
    undoStore.execute(
      'ROTATE_PAGES',
      { type: 'ROTATE_PAGES', rotations: newRotations as any, previousRotations: previousRotations as any },
      { type: 'ROTATE_PAGES', rotations: previousRotations as any, previousRotations: newRotations as any }
    );
  }, [projectStore, selectionStore, undoStore]);

  /**
   * Remove a document and all its pages
   */
  const removeDocument = useCallback((documentId: string) => {
    const document = projectStore.getDocumentById(documentId);
    if (!document) return;

    // Unload from services
    pdfService.unloadDoc(documentId);
    cacheService.invalidateDocument(documentId);

    // Remove from project
    projectStore.removeDocument(documentId);

    // Deselect any selected pages from this document
    const selectedIds = selectionStore.getSelectedIds();
    const toDeselect = selectedIds.filter((id) => {
      const pageRef = projectStore.getPageRefById(id);
      return pageRef?.documentId === documentId;
    });
    
    for (const id of toDeselect) {
      selectionStore.deselect(id);
    }

    // Record for undo
    undoStore.execute(
      'REMOVE_DOCUMENT',
      { type: 'REMOVE_DOCUMENT', documentId },
      { type: 'ADD_DOCUMENT', documentId, filePath: document.filePath }
    );
  }, [projectStore, selectionStore, undoStore]);

  return {
    openFiles,
    exportPdf,
    deleteSelectedPages,
    rotateSelectedPages,
    removeDocument
  };
}
