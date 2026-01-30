// Autosave Service - handles project recovery and autosave
import { AUTOSAVE_INTERVAL_MS, AUTOSAVE_DEBOUNCE_MS } from '../../shared/constants';
import type { Project } from '../../shared/types/project';

type AutosaveCallback = () => Project | null;

export class AutosaveService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private getProjectCallback: AutosaveCallback | null = null;
  private lastSavedHash: string = '';

  /**
   * Initialize autosave with a callback to get current project state
   */
  init(getProject: AutosaveCallback): void {
    this.getProjectCallback = getProject;
    this.startInterval();
    this.setupLifecycleHandlers();
  }

  /**
   * Start the autosave interval
   */
  private startInterval(): void {
    this.intervalId = setInterval(() => {
      this.save();
    }, AUTOSAVE_INTERVAL_MS);
  }

  /**
   * Setup app lifecycle handlers
   */
  private setupLifecycleHandlers(): void {
    // Handle app close
    window.electronAPI.onAppCloseRequested(() => {
      this.handleCloseRequest();
    });

    // Handle app quit
    window.electronAPI.onAppWillQuit(() => {
      this.markCleanExit();
    });
  }

  /**
   * Handle close request - save and confirm close
   */
  private async handleCloseRequest(): Promise<void> {
    await this.save();
    await this.markCleanExit();
    window.electronAPI.confirmClose();
  }

  /**
   * Trigger a debounced save
   */
  triggerSave(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.save();
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  /**
   * Save current project state
   */
  async save(): Promise<void> {
    if (!this.getProjectCallback) return;

    const project = this.getProjectCallback();
    if (!project || !project.isDirty) return;

    // Simple hash to detect changes
    const hash = JSON.stringify(project);
    if (hash === this.lastSavedHash) return;

    try {
      await window.electronAPI.saveRecoveryData(this.serializeProject(project));
      this.lastSavedHash = hash;
    } catch (error) {
      console.error('Failed to save recovery data:', error);
    }
  }

  /**
   * Serialize project for storage (remove transient data)
   */
  private serializeProject(project: Project): unknown {
    return {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      modifiedAt: project.modifiedAt,
      documents: project.documents.map(doc => ({
        id: doc.id,
        filePath: doc.filePath,
        fileName: doc.fileName,
        pageCount: doc.pageCount,
        fileSize: doc.fileSize,
        loadedAt: doc.loadedAt,
        pages: doc.pages.map(page => ({
          id: page.id,
          documentId: page.documentId,
          originalIndex: page.originalIndex,
          rotation: page.rotation,
          thumbnailCacheKey: page.thumbnailCacheKey
        }))
      })),
      outputPages: project.outputPages,
      isDirty: project.isDirty
    };
  }

  /**
   * Check for recovery data on startup
   */
  async checkRecovery(): Promise<{ hasRecovery: boolean; data: unknown }> {
    return window.electronAPI.getRecoveryData();
  }

  /**
   * Clear recovery data (after successful recovery or user dismissal)
   */
  async clearRecovery(): Promise<void> {
    await window.electronAPI.clearRecoveryData();
    this.lastSavedHash = '';
  }

  /**
   * Mark clean exit
   */
  async markCleanExit(): Promise<void> {
    await window.electronAPI.markCleanExit();
  }

  /**
   * Stop autosave
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }
}

// Singleton instance
export const autosaveService = new AutosaveService();
