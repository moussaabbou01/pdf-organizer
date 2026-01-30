// IPC handlers for main process
import { ipcMain, dialog, BrowserWindow } from 'electron';
import { readFile, writeFile, stat } from 'fs/promises';
import { PDFDocument, degrees } from 'pdf-lib';
import { IPC_CHANNELS, ExportRequest, ExportProgress, ExportPageInfo } from '../shared/types/ipc';
import { PDF_FILE_FILTER } from '../shared/constants';
import { RecoveryService } from './recovery-service';
import { getMainWindow, forceQuit } from './index';

export function setupIpcHandlers(recoveryService: RecoveryService): void {
  // File dialog handlers
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [PDF_FILE_FILTER]
    });
    return {
      canceled: result.canceled,
      filePaths: result.filePaths
    };
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_FILE_DIALOG, async (_, defaultPath?: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultPath || 'merged.pdf',
      filters: [PDF_FILE_FILTER]
    });
    return {
      canceled: result.canceled,
      filePath: result.filePath
    };
  });

  // File operations
  ipcMain.handle(IPC_CHANNELS.READ_FILE, async (_, filePath: string) => {
    try {
      const buffer = await readFile(filePath);
      return { success: true, data: buffer };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WRITE_FILE, async (_, filePath: string, data: Uint8Array) => {
    try {
      await writeFile(filePath, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_FILE_INFO, async (_, filePath: string) => {
    try {
      const stats = await stat(filePath);
      return {
        success: true,
        size: stats.size,
        mtime: stats.mtime.getTime()
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // PDF Export handler
  ipcMain.handle(IPC_CHANNELS.EXPORT_PDF, async (event, request: ExportRequest) => {
    const mainWindow = getMainWindow();
    
    const sendProgress = (progress: ExportProgress) => {
      mainWindow?.webContents.send(IPC_CHANNELS.EXPORT_PROGRESS, progress);
    };

    try {
      sendProgress({
        phase: 'loading',
        current: 0,
        total: request.pages.length,
        message: 'Starting export...'
      });

      // Create output document
      const outputDoc = await PDFDocument.create();
      const pdfCache = new Map<string, PDFDocument>();

      // Process each page
      for (let i = 0; i < request.pages.length; i++) {
        const pageInfo = request.pages[i];
        
        sendProgress({
          phase: 'processing',
          current: i + 1,
          total: request.pages.length,
          message: `Processing page ${i + 1} of ${request.pages.length}`
        });

        // Load source PDF (with caching)
        let srcDoc = pdfCache.get(pageInfo.filePath);
        if (!srcDoc) {
          const pdfBytes = await readFile(pageInfo.filePath);
          srcDoc = await PDFDocument.load(pdfBytes);
          pdfCache.set(pageInfo.filePath, srcDoc);
        }

        // Copy page
        const [copiedPage] = await outputDoc.copyPages(srcDoc, [pageInfo.pageIndex]);

        // Apply rotation if needed
        if (pageInfo.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + pageInfo.rotation));
        }

        outputDoc.addPage(copiedPage);
      }

      sendProgress({
        phase: 'saving',
        current: request.pages.length,
        total: request.pages.length,
        message: 'Saving PDF...'
      });

      // Save the output
      const pdfBytes = await outputDoc.save();
      await writeFile(request.outputPath, pdfBytes);

      sendProgress({
        phase: 'complete',
        current: request.pages.length,
        total: request.pages.length,
        message: 'Export complete!'
      });

      return { success: true, path: request.outputPath };
    } catch (error) {
      const errorMessage = (error as Error).message;
      sendProgress({
        phase: 'error',
        current: 0,
        total: request.pages.length,
        message: 'Export failed',
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  });

  // Recovery handlers
  ipcMain.handle(IPC_CHANNELS.GET_RECOVERY_DATA, () => {
    return recoveryService.getRecoveryData();
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_RECOVERY_DATA, (_, data: unknown) => {
    recoveryService.saveRecoveryData(data);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.CLEAR_RECOVERY_DATA, () => {
    recoveryService.clearRecoveryData();
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.MARK_CLEAN_EXIT, () => {
    recoveryService.markCleanExit();
    return { success: true };
  });

  // App close handler
  ipcMain.on('app-close-confirmed', () => {
    forceQuit();
  });
}
