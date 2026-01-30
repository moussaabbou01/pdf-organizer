import React from 'react';
import { useUIStore } from '../../store/uiSlice';
import { APP_NAME, APP_VERSION } from '../../../shared/constants';
import './Dialog.css';

export function AboutDialog() {
  const uiStore = useUIStore();

  return (
    <div className="dialog-overlay" onClick={() => uiStore.closeAboutDialog()}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{APP_NAME}</h2>
        </div>

        <div className="dialog-content dialog-content--center">
          <div className="about-logo">📄</div>
          <p className="about-version">Version {APP_VERSION}</p>
          <p className="about-description">
            A powerful desktop application for organizing,<br />
            combining, and editing PDF documents.
          </p>
          
          <div className="about-features">
            <p>✓ Combine multiple PDFs</p>
            <p>✓ Drag-and-drop page reordering</p>
            <p>✓ Rotate, delete, and insert pages</p>
            <p>✓ Export merged PDFs</p>
          </div>
        </div>

        <div className="dialog-footer">
          <button
            className="dialog-button dialog-button--primary"
            onClick={() => uiStore.closeAboutDialog()}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
