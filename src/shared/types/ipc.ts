// IPC message types for main <-> renderer communication

export interface ThumbnailRequest {
  documentId: string;
  pageIndex: number;
  width: number;
  cacheKey: string;
  filePath: string;
}

export interface ThumbnailResult {
  cacheKey: string;
  dataUrl: string;
  width: number;
  height: number;
  success: boolean;
  error?: string;
}

export interface ExportRequest {
  outputPath: string;
  pages: ExportPageInfo[];
}

export interface ExportPageInfo {
  filePath: string;
  pageIndex: number;
  rotation: number;
}

export interface ExportProgress {
  phase: 'loading' | 'processing' | 'saving' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
  error?: string;
}

export interface FileDialogResult {
  canceled: boolean;
  filePaths: string[];
}

export interface SaveDialogResult {
  canceled: boolean;
  filePath?: string;
}

// IPC Channel names
export const IPC_CHANNELS = {
  // File operations
  OPEN_FILE_DIALOG: 'dialog:openFile',
  SAVE_FILE_DIALOG: 'dialog:saveFile',
  READ_FILE: 'file:read',
  WRITE_FILE: 'file:write',
  GET_FILE_INFO: 'file:info',
  
  // PDF operations
  EXPORT_PDF: 'pdf:export',
  EXPORT_PROGRESS: 'pdf:exportProgress',
  CANCEL_EXPORT: 'pdf:cancelExport',
  
  // App lifecycle
  APP_READY: 'app:ready',
  APP_WILL_QUIT: 'app:willQuit',
  
  // Recovery
  GET_RECOVERY_DATA: 'recovery:get',
  SAVE_RECOVERY_DATA: 'recovery:save',
  CLEAR_RECOVERY_DATA: 'recovery:clear',
  MARK_CLEAN_EXIT: 'recovery:markCleanExit'
} as const;
