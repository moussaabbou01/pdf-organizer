// Test setup file
import { vi } from 'vitest';

// Mock window.electronAPI
const mockElectronAPI = {
  openFileDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
  saveFileDialog: vi.fn().mockResolvedValue({ canceled: true, filePath: undefined }),
  readFile: vi.fn().mockResolvedValue({ success: false, error: 'Not implemented' }),
  writeFile: vi.fn().mockResolvedValue({ success: true }),
  getFileInfo: vi.fn().mockResolvedValue({ success: false, error: 'Not implemented' }),
  exportPdf: vi.fn().mockResolvedValue({ success: true }),
  onExportProgress: vi.fn().mockReturnValue(() => {}),
  getRecoveryData: vi.fn().mockResolvedValue({ hasRecovery: false, data: null }),
  saveRecoveryData: vi.fn().mockResolvedValue({ success: true }),
  clearRecoveryData: vi.fn().mockResolvedValue({ success: true }),
  markCleanExit: vi.fn().mockResolvedValue({ success: true }),
  onAppCloseRequested: vi.fn().mockReturnValue(() => {}),
  onAppWillQuit: vi.fn().mockReturnValue(() => {}),
  confirmClose: vi.fn(),
  onMenuCommand: vi.fn().mockReturnValue(() => {})
};

// @ts-ignore
global.window = {
  ...global.window,
  electronAPI: mockElectronAPI
};

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 15)
  } as any;
}
