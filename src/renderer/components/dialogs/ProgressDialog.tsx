import React from 'react';
import { useUIStore } from '../../store/uiSlice';
import './Dialog.css';

export function ProgressDialog() {
  const uiStore = useUIStore();
  const { exportProgress } = uiStore;

  if (!exportProgress) return null;

  const percentage = exportProgress.total > 0
    ? Math.round((exportProgress.current / exportProgress.total) * 100)
    : 0;

  const isComplete = exportProgress.phase === 'complete';
  const isError = exportProgress.phase === 'error';

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">
            {isComplete ? '✓ Export Complete' : isError ? '✕ Export Failed' : 'Exporting PDF...'}
          </h2>
        </div>

        <div className="dialog-content">
          <div className="progress-bar">
            <div
              className={`progress-fill ${isComplete ? 'progress-fill--success' : ''} ${isError ? 'progress-fill--error' : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="progress-message">{exportProgress.message}</p>
          
          {exportProgress.error && (
            <p className="progress-error">{exportProgress.error}</p>
          )}
          
          <p className="progress-stats">
            {exportProgress.current} / {exportProgress.total} pages
          </p>
        </div>

        {(isComplete || isError) && (
          <div className="dialog-footer">
            <button
              className="dialog-button dialog-button--primary"
              onClick={() => uiStore.closeProgressDialog()}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
