// Hook for autosave functionality
import { useEffect, useCallback } from 'react';
import { useProjectStore } from '../store/projectSlice';
import { autosaveService } from '../services/autosave-service';
import { useUIStore } from '../store/uiSlice';
import type { Project, Document, Page } from '../../shared/types/project';

export function useAutosave() {
  const projectStore = useProjectStore();
  const uiStore = useUIStore();

  // Initialize autosave
  useEffect(() => {
    autosaveService.init(() => projectStore.project);

    // Check for recovery data on startup
    autosaveService.checkRecovery().then((result) => {
      if (result.hasRecovery && result.data) {
        uiStore.openRecoveryDialog();
      }
    });

    return () => {
      autosaveService.stop();
    };
  }, []);

  // Trigger save when project changes
  useEffect(() => {
    if (projectStore.project.isDirty) {
      autosaveService.triggerSave();
    }
  }, [projectStore.project]);

  /**
   * Recover project from autosave data
   */
  const recoverProject = useCallback(async () => {
    const result = await autosaveService.checkRecovery();
    
    if (result.hasRecovery && result.data) {
      const recoveryData = result.data as { project: Project };
      
      if (recoveryData.project) {
        // Set the recovered project
        projectStore.setProject(recoveryData.project);
        
        // Note: Documents need to be reloaded from disk
        // This is a simplified recovery - full implementation would reload PDFs
      }
    }

    uiStore.closeRecoveryDialog();
  }, [projectStore, uiStore]);

  /**
   * Discard recovery data
   */
  const discardRecovery = useCallback(async () => {
    await autosaveService.clearRecovery();
    uiStore.closeRecoveryDialog();
  }, [uiStore]);

  return {
    recoverProject,
    discardRecovery
  };
}
