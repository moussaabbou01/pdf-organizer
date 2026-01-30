import React from 'react';
import { useProjectStore } from '../../store/projectSlice';
import { useSelectionStore } from '../../store/selectionSlice';
import './StatusBar.css';

export function StatusBar() {
  const projectStore = useProjectStore();
  const selectionStore = useSelectionStore();

  const { project } = projectStore;
  const selectedCount = selectionStore.getSelectedCount();
  const totalPages = project.outputPages.length;

  return (
    <div className="status-bar">
      <div className="status-section">
        <span className="status-item">
          {totalPages} page{totalPages !== 1 ? 's' : ''} in workspace
        </span>
        {selectedCount > 0 && (
          <span className="status-item status-item--highlight">
            {selectedCount} selected
          </span>
        )}
      </div>
      
      <div className="status-section">
        {project.isDirty && (
          <span className="status-item status-item--warning">
            ● Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
