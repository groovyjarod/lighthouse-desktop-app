const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
require('@electron/remote/main').initialize()


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
            // contextIsolation: false,
            // enableRemoteModule: true,
            // nodeIntegration: true,
        }
    })

    win.loadURL('http://localhost:5173')
}

const loadFolderData = (folderName) => {
    const folderPath = path.join(__dirname, folderName)
    const entries = fs.readdirSync(folderPath)
    return entries.map(name => {
        const fullPath = path.join(folderPath, name)
        const stats = fs.statSync(fullPath)
        return {
            name,
            isDirectory: stats.isDirectory(),
            size: stats.size
        }
    })
}

ipcMain.handle('read-audit-folder', async () => loadFolderData('audit-results'))
ipcMain.handle('read-old-audit-folder', async () => loadFolderData('old-audit-results'))
ipcMain.handle('read-comparison-folder', async () => loadFolderData('audit-comparisons'))
ipcMain.handle('read-options-folder', async () => loadFolderData('settings'))
ipcMain.handle('save-file', async (filename, newContent) => {
    const filePath = path.join(__dirname, 'settings', filename.name)

    try {
        await fs.writeFileSync(filePath, newContent, 'utf-8')
        return { success: true }
    } catch (error) {
        console.error(`Failed to save file: ${error}`)
        return { success: false, error: error.message}
    }
})
ipcMain.handle('get-current-filename', async () => {
    const auditDirectory = path.join(__dirname, 'settings')
    try {
        const files = fs.readdirSync(auditDirectory)

        if (files.length > 0) {
            return { success: true, filename: files[0] }
        } else {
            console.log(txtFile)
            console.log(files.length)
            console.log(auditDirectory)
            return { success: false, error: 'No .txt file found in folder.'}
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
ipcMain.handle('replace-file', async (destination) => {
    const result = await dialog.showOpenDialog({
        title: 'Select a .txt file',
        defaultPath: app.getPath('desktop'),
        filters: [{ name: 'Text files', extensions: ['txt'] }],
        properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'No File Selected' }
    }

    const sourcePath = result.filePaths[0]
    const destinationPath = path.join(__dirname, 'settings', destination)

    try {
        fs.copyFileSync(sourcePath, destinationPath)
        return { success: true }
    } catch (error) {
        console.error('Failed to  opy file:', error)
        return { success: false, error: error.message }
    }
})

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})