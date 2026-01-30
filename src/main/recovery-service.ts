// Recovery service for autosave and crash recovery
import Store from 'electron-store';
import { app } from 'electron';
import { randomUUID } from 'crypto';

interface RecoveryData {
  project: unknown;
  timestamp: number;
  sessionId: string;
  wasCleanExit: boolean;
}

interface RecoveryStore {
  recovery?: RecoveryData;
}

export class RecoveryService {
  private store: Store<RecoveryStore>;
  private sessionId: string;

  constructor() {
    this.sessionId = randomUUID();
    this.store = new Store<RecoveryStore>({
      name: 'recovery',
      cwd: app.getPath('userData')
    });

    // Mark this session as active (not clean exit yet)
    this.markSessionActive();
  }

  private markSessionActive(): void {
    const existing = this.store.get('recovery');
    if (existing) {
      // Previous session didn't exit cleanly
      this.store.set('recovery.wasCleanExit', false);
    }
    this.store.set('recovery.sessionId', this.sessionId);
  }

  getRecoveryData(): { hasRecovery: boolean; data: RecoveryData | null } {
    const recovery = this.store.get('recovery');
    
    if (recovery && !recovery.wasCleanExit && recovery.project) {
      return {
        hasRecovery: true,
        data: recovery
      };
    }

    return {
      hasRecovery: false,
      data: null
    };
  }

  saveRecoveryData(project: unknown): void {
    this.store.set('recovery', {
      project,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      wasCleanExit: false
    });
  }

  clearRecoveryData(): void {
    this.store.delete('recovery');
  }

  markCleanExit(): void {
    this.store.set('recovery.wasCleanExit', true);
  }
}
