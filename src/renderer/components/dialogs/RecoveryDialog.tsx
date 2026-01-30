import React from 'react';
import { useAutosave } from '../../hooks/useAutosave';
import { useUIStore } from '../../store/uiSlice';
import './Dialog.css';

export function RecoveryDialog() {
  const { recoverProject, discardRecovery } = useAutosave();
  const uiStore = useUIStore();

  const handleRecover = async () => {
    await recoverProject();
  };

  const handleDiscard = async () => {
    await discardRecovery();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">🔄 Recover Unsaved Work?</h2>
        </div>

        <div className="dialog-content">
          <p>
            PDF Organizer found unsaved changes from your last session.
          </p>
          <p className="dialog-subtext">
            Would you like to recover your previous work or start fresh?
          </p>
        </div>

        <div className="dialog-footer">
          <button
            className="dialog-button dialog-button--secondary"
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            className="dialog-button dialog-button--primary"
            onClick={handleRecover}
          >
            Recover
          </button>
        </div>
      </div>
    </div>
  );
}
