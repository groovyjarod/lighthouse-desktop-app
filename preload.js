const { contextBridge, ipcRenderer, shell } = require('electron')
const path = require('path')

contextBridge.exposeInMainWorld('electronAPI', {
    accessOsData: () => ipcRenderer.invoke('access-os-data'),
    cancelAudit: () => ipcRenderer.invoke('cancel-audit'),
    clearAllSizedAuditsFolder: () => ipcRenderer.invoke('clear-all-sized-audits-folder'),
    getAuditComparisons: () => ipcRenderer.invoke('read-comparison-folder'),
    getAuditResults: () => ipcRenderer.invoke('read-audit-folder'),
    getAuditMetadata: (fileFolder, auditPath) => ipcRenderer.invoke('get-audit-metadata', fileFolder, auditPath),
    getCurrentFile: () => ipcRenderer.invoke('get-current-filename'),
    getCustomAudits: () => ipcRenderer.invoke('read-custom-audits'),
    getEditableFiles: () => ipcRenderer.invoke('read-options-folder'),
    getFile: (filename) => ipcRenderer.invoke('get-file', filename),
    getPLimit: () => ipcRenderer.invoke('get-p-limit'),
    getSpawn: (urlPath, outputPath, testing_method, user_agent, viewport) => ipcRenderer.invoke('get-spawn', urlPath, outputPath, testing_method, user_agent, viewport),
    getWikiPathsData: () => ipcRenderer.invoke('get-wiki-paths'),
    getOldAudits: () => ipcRenderer.invoke('read-old-audit-folder'),
    moveAuditFiles: () => ipcRenderer.invoke('move-audit-files'),
    openResultsFile: (filename, folder) => {
        const fullPath = path.join(__dirname, `./audits/${folder}`, filename)
        shell.openPath(fullPath)
        shell.showItemInFolder(fullPath)
    },
    replaceFile: (newData, newPath, isWikiPaths=false) => ipcRenderer.invoke('replace-file', newData, newPath, isWikiPaths),
    saveFile: (filePath, fileContent) => ipcRenderer.invoke('save-file', filePath, fileContent),
    onLighthouseLog: (callback) => ipcRenderer.on('lighthouse-log', (event, message) => callback(message))
})
