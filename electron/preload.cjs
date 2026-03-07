const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chessDesktop', {
  exportPgn: (payload) => ipcRenderer.invoke('chess:export-pgn', payload),
  importPgn: (payload) => ipcRenderer.invoke('chess:import-pgn', payload),
});
