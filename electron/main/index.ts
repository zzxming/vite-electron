#!/usr/bin/env node
import os from 'node:os';
import path from 'node:path';
import { app, BrowserWindow, Menu, shell } from 'electron';
import { indexHtml, isDev, preloadBundle, publicPath } from './constants';
import { checkUpdate } from './update';
import './ipcMainEvents';

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWin: BrowserWindow;

async function createWindow() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    title: 'Main window',
    width: 1516,
    height: 800,
    icon: path.join(publicPath, 'favicon.ico'),
    show: false,
    webPreferences: {
      preload: preloadBundle,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  }
  else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('ready-to-show', () => {
    win!.webContents.send('window-ready', new Date().toLocaleString());
    win!.show();
  });

  win.on('show', () => {
    if (isDev) {
      win!.webContents.openDevTools();
    }
  });

  win.maximize();
  return win;
}

app.whenReady().then(async () => {
  mainWin = await createWindow();
  mainWin.on('show', () => {
    // wait for window full show
    setTimeout(async () => {
      checkUpdate(mainWin);
    }, 2000);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (mainWin) {
    // Focus on the main window if the user tried to open another
    if (mainWin.isMinimized()) mainWin.restore();
    mainWin.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length > 0) {
    allWindows[0].focus();
  }
  else {
    createWindow();
  }
});
