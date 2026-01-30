import React from 'react';
import { useProjectStore } from '../../store/projectSlice';
import { usePdfOperations } from '../../hooks/usePdfOperations';
import './Sidebar.css';

export function Sidebar() {
  const projectStore = useProjectStore();
  const { removeDocument } = usePdfOperations();

  const { documents } = projectStore.project;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Documents</h3>
        <span className="sidebar-count">{documents.length}</span>
      </div>
      
      <div className="sidebar-content">
        {documents.length === 0 ? (
          <div className="sidebar-empty">
            <p>No documents loaded</p>
            <p className="sidebar-hint">Click "Open" to add PDF files</p>
          </div>
        ) : (
          <ul className="document-list">
            {documents.map((doc) => (
              <li key={doc.id} className="document-item">
                <div className="document-info">
                  <span className="document-icon">📄</span>
                  <div className="document-details">
                    <span className="document-name" title={doc.filePath}>
                      {doc.fileName}
                    </span>
                    <span className="document-pages">
                      {doc.pageCount} page{doc.pageCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button
                  className="document-remove"
                  onClick={() => removeDocument(doc.id)}
                  title="Remove document"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
