// Preload script - exposes safe APIs to renderer
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, ExportRequest, FileDialogResult, SaveDialogResult, ExportProgress } from '../shared/types/ipc';

// Type definitions for the exposed API
export interface ElectronAPI {
  // File dialogs
  openFileDialog: () => Promise<FileDialogResult>;
  saveFileDialog: (defaultPath?: string) => Promise<SaveDialogResult>;
  
  // File operations
  readFile: (filePath: string) => Promise<{ success: boolean; data?: Buffer; error?: string }>;
  writeFile: (filePath: string, data: Uint8Array) => Promise<{ success: boolean; error?: string }>;
  getFileInfo: (filePath: string) => Promise<{ success: boolean; size?: number; mtime?: number; error?: string }>;
  
  // PDF export
  exportPdf: (request: ExportRequest) => Promise<{ success: boolean; path?: string; error?: string }>;
  onExportProgress: (callback: (progress: ExportProgress) => void) => () => void;
  
  // Recovery
  getRecoveryData: () => Promise<{ hasRecovery: boolean; data: unknown }>;
  saveRecoveryData: (data: unknown) => Promise<{ success: boolean }>;
  clearRecoveryData: () => Promise<{ success: boolean }>;
  markCleanExit: () => Promise<{ success: boolean }>;
  
  // App lifecycle
  onAppCloseRequested: (callback: () => void) => () => void;
  onAppWillQuit: (callback: () => void) => () => void;
  confirmClose: () => void;
  
  // Menu events
  onMenuCommand: (command: string, callback: () => void) => () => void;
}

const electronAPI: ElectronAPI = {
  // File dialogs
  openFileDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_FILE_DIALOG, defaultPath),
  
  // File operations
  readFile: (filePath) => ipcRenderer.invoke(IPC_CHANNELS.READ_FILE, filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke(IPC_CHANNELS.WRITE_FILE, filePath, data),
  getFileInfo: (filePath) => ipcRenderer.invoke(IPC_CHANNELS.GET_FILE_INFO, filePath),
  
  // PDF export
  exportPdf: (request) => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_PDF, request),
  onExportProgress: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, progress: ExportProgress) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.EXPORT_PROGRESS, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EXPORT_PROGRESS, handler);
  },
  
  // Recovery
  getRecoveryData: () => ipcRenderer.invoke(IPC_CHANNELS.GET_RECOVERY_DATA),
  saveRecoveryData: (data) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_RECOVERY_DATA, data),
  clearRecoveryData: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_RECOVERY_DATA),
  markCleanExit: () => ipcRenderer.invoke(IPC_CHANNELS.MARK_CLEAN_EXIT),
  
  // App lifecycle
  onAppCloseRequested: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('app-close-requested', handler);
    return () => ipcRenderer.removeListener('app-close-requested', handler);
  },
  onAppWillQuit: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('app-will-quit', handler);
    return () => ipcRenderer.removeListener('app-will-quit', handler);
  },
  confirmClose: () => ipcRenderer.send('app-close-confirmed'),
  
  // Menu events
  onMenuCommand: (command, callback) => {
    const handler = () => callback();
    ipcRenderer.on(`menu-${command}`, handler);
    return () => ipcRenderer.removeListener(`menu-${command}`, handler);
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Also expose for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
