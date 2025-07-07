const { contextBridge, ipcRenderer, shell } = require('electron')
const path = require('path')

contextBridge.exposeInMainWorld('electronAPI', {
    getAuditResults: () => ipcRenderer.invoke('read-audit-folder'),
    getOldAuditResults: () => ipcRenderer.invoke('read-old-audit-folder'),
    getAuditComparisons: () => ipcRenderer.invoke('read-comparison-folder'),
    getEditableFiles: () => ipcRenderer.invoke('read-options-folder'),
    openResultsFile: (filename, folder) => {
        const fullPath = path.join(__dirname, folder, filename)
        shell.openPath(fullPath)
        shell.showItemInFolder(fullPath)
    },
    saveFile: (filename, newContent) => ipcRenderer.invoke('save-file', filename, newContent),
    getCurrentFile: () => ipcRenderer.invoke('get-current-filename'),
    replaceAuditFile: (destination) => ipcRenderer.invoke('replace-file', destination),
})
