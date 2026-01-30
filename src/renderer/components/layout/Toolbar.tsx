import React from 'react';
import { usePdfOperations } from '../../hooks/usePdfOperations';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useUIStore } from '../../store/uiSlice';
import { useSelectionStore } from '../../store/selectionSlice';
import './Toolbar.css';

export function Toolbar() {
  const { openFiles, exportPdf, deleteSelectedPages, rotateSelectedPages } = usePdfOperations();
  const { performUndo, performRedo, canUndo, canRedo } = useUndoRedo();
  const uiStore = useUIStore();
  const selectionStore = useSelectionStore();

  const hasSelection = selectionStore.getSelectedCount() > 0;

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={openFiles}
          title="Open PDF files (Ctrl+O)"
        >
          <span className="toolbar-icon">📁</span>
          <span className="toolbar-label">Open</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={exportPdf}
          title="Export merged PDF (Ctrl+E)"
        >
          <span className="toolbar-icon">💾</span>
          <span className="toolbar-label">Export</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={performUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <span className="toolbar-icon">↩️</span>
          <span className="toolbar-label">Undo</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={performRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <span className="toolbar-icon">↪️</span>
          <span className="toolbar-label">Redo</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={() => rotateSelectedPages(false)}
          disabled={!hasSelection}
          title="Rotate counter-clockwise (Ctrl+Shift+R)"
        >
          <span className="toolbar-icon">↺</span>
          <span className="toolbar-label">Rotate Left</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={() => rotateSelectedPages(true)}
          disabled={!hasSelection}
          title="Rotate clockwise (Ctrl+R)"
        >
          <span className="toolbar-icon">↻</span>
          <span className="toolbar-label">Rotate Right</span>
        </button>
        
        <button 
          className="toolbar-button toolbar-button--danger"
          onClick={deleteSelectedPages}
          disabled={!hasSelection}
          title="Delete selected pages (Delete)"
        >
          <span className="toolbar-icon">🗑️</span>
          <span className="toolbar-label">Delete</span>
        </button>
      </div>

      <div className="toolbar-spacer" />

      <div className="toolbar-group">
        <button 
          className="toolbar-button toolbar-button--icon"
          onClick={() => uiStore.zoomOut()}
          title="Zoom out (Ctrl+-)"
        >
          <span className="toolbar-icon">−</span>
        </button>
        
        <span className="toolbar-zoom-level">
          {Math.round(uiStore.zoom * 100)}%
        </span>
        
        <button 
          className="toolbar-button toolbar-button--icon"
          onClick={() => uiStore.zoomIn()}
          title="Zoom in (Ctrl++)"
        >
          <span className="toolbar-icon">+</span>
        </button>
      </div>
    </div>
  );
}
