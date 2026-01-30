// Electron main process entry point
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { setupIpcHandlers } from './ipc-handlers';
import { createMenu } from './menu';
import { RecoveryService } from './recovery-service';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let recoveryService: RecoveryService;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'PDF Organizer',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Close handler for unsaved changes - only in production
  mainWindow.on('close', (event) => {
    // In development, allow immediate close for faster iteration
    if (process.env.NODE_ENV === 'development') {
      return; // Allow close without confirmation
    }
    
    // In production, allow renderer to handle unsaved changes
    if (mainWindow) {
      event.preventDefault();
      mainWindow.webContents.send('app-close-requested');
    }
  });
}

function initialize(): void {
  // Initialize recovery service
  recoveryService = new RecoveryService();

  // Setup IPC handlers
  setupIpcHandlers(recoveryService);

  // Create application menu
  createMenu();
}

// App lifecycle
app.whenReady().then(async () => {
  initialize();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app-will-quit');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', `An unexpected error occurred: ${error.message}`);
});

// Export for IPC handlers
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function forceQuit(): void {
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
  app.quit();
}
