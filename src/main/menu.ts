// Application menu
import { Menu, shell, BrowserWindow } from 'electron';

export function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open PDF...',
          accelerator: 'CmdOrCtrl+O',
          click: (_, window) => {
            window?.webContents.send('menu-open-file');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Merged PDF...',
          accelerator: 'CmdOrCtrl+E',
          click: (_, window) => {
            window?.webContents.send('menu-export');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: (_, window) => {
            window?.webContents.send('menu-undo');
          }
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Y',
          click: (_, window) => {
            window?.webContents.send('menu-redo');
          }
        },
        { type: 'separator' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          click: (_, window) => {
            window?.webContents.send('menu-select-all');
          }
        },
        {
          label: 'Deselect All',
          accelerator: 'Escape',
          click: (_, window) => {
            window?.webContents.send('menu-deselect-all');
          }
        },
        { type: 'separator' },
        {
          label: 'Delete Selected',
          accelerator: 'Delete',
          click: (_, window) => {
            window?.webContents.send('menu-delete-selected');
          }
        }
      ]
    },
    {
      label: 'Page',
      submenu: [
        {
          label: 'Rotate Clockwise',
          accelerator: 'CmdOrCtrl+R',
          click: (_, window) => {
            window?.webContents.send('menu-rotate-cw');
          }
        },
        {
          label: 'Rotate Counter-Clockwise',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: (_, window) => {
            window?.webContents.send('menu-rotate-ccw');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: (_, window) => {
            window?.webContents.send('menu-zoom-in');
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (_, window) => {
            window?.webContents.send('menu-zoom-out');
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: (_, window) => {
            window?.webContents.send('menu-zoom-reset');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: (_, window) => {
            window?.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PDF Organizer',
          click: (_, window) => {
            window?.webContents.send('menu-about');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/your-repo/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
