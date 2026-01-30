import React from 'react';
import { usePdfOperations } from '../../hooks/usePdfOperations';
import './EmptyState.css';

export function EmptyState() {
  const { openFiles } = usePdfOperations();

  return (
    <div className="empty-state">
      <div className="empty-state-icon">📄</div>
      <h2 className="empty-state-title">No PDF pages yet</h2>
      <p className="empty-state-description">
        Open PDF files to start organizing pages.
        You can combine multiple PDFs and reorder pages with drag and drop.
      </p>
      <button className="empty-state-button" onClick={openFiles}>
        Open PDF Files
      </button>
      <p className="empty-state-hint">
        Or press <kbd>Ctrl</kbd> + <kbd>O</kbd>
      </p>
    </div>
  );
}
