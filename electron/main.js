import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1100,
    minHeight: 780,
    backgroundColor: '#0d1117',
    title: 'Glass Marble Chess',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

ipcMain.handle('chess:export-pgn', async (_event, { pgn, filePath = null, defaultPath = 'glass-marble-chess.pgn' }) => {
  const targetPath = filePath ?? (await dialog.showSaveDialog({
    title: 'Export PGN',
    defaultPath,
    filters: [{ name: 'PGN Files', extensions: ['pgn'] }],
  })).filePath;
  if (!targetPath) return { canceled: true };
  await fs.writeFile(targetPath, pgn, 'utf8');
  return { canceled: false, filePath: targetPath };
});

ipcMain.handle('chess:import-pgn', async (_event, { filePath = null } = {}) => {
  const targetPath = filePath ?? (await dialog.showOpenDialog({
    title: 'Open PGN',
    properties: ['openFile'],
    filters: [{ name: 'PGN Files', extensions: ['pgn'] }],
  })).filePaths[0];
  if (!targetPath) return { canceled: true };
  const pgn = await fs.readFile(targetPath, 'utf8');
  return { canceled: false, filePath: targetPath, pgn };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
