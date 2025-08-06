const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");
const os = require("os");
const child_process = require("child_process");
const pLimit = require("p-limit");
const pLimitDefault = require("p-limit").default
require("@electron/remote/main").initialize();
let activeProcesses = new Map()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
      // contextIsolation: false,
      // enableRemoteModule: true,
      // nodeIntegration: true,
    },
  });

  win.loadURL("http://localhost:5173");
};

const loadFolderData = (folderName) => {
  const folderPath = path.join(__dirname, folderName);
  const entries = fs.readdirSync(folderPath);
  return entries.map((name) => {
    const fullPath = path.join(folderPath, name);
    const stats = fs.statSync(fullPath);
    return {
      name,
      isDirectory: stats.isDirectory(),
      size: stats.size,
    };
  });
};

ipcMain.handle("get-wiki-paths", async () => {
  const resultsRaw = fs.readFileSync("./settings/wikiPaths.txt", "utf8");
  const result = resultsRaw.split("\n").filter(Boolean);
  return result;
});

ipcMain.handle("get-file", async (event, filePath) => fs.readFileSync(filePath, 'utf8'))

ipcMain.handle("read-audit-folder", async () =>
  loadFolderData("audits/audit-results")
);
ipcMain.handle("read-old-audit-folder", async () =>
  loadFolderData("audits/old-audit-results")
);
ipcMain.handle("read-comparison-folder", async () =>
  loadFolderData("audits/audit-comparisons")
);
ipcMain.handle("read-custom-audits", async () =>
  loadFolderData("audits/custom-audit-results")
);
ipcMain.handle("read-options-folder", async () => loadFolderData("settings"));

ipcMain.handle("get-audit-metadata", async (event, fileFolder, auditData) => {
  const jsonAuditRaw = fs.readFileSync(
    `./audits/${fileFolder}/${auditData}`,
    "utf8"
  );
  const jsonAudit = JSON.parse(jsonAuditRaw);
  let itemCount = 0;
  let subItemCount = 0;
  let accessibilityScore;

  if (jsonAudit.hasOwnProperty('stats1920pxWidth')) {
    return {
      itemCount:"All",
      subItemCount: "Sizes",
      score: "Audit",
      length: jsonAuditRaw.split("\n").length
    }
  }
  for (const [key, value] of Object.entries(jsonAudit)) {
    if (typeof value === "object") {
      for (let itemData of value["items"]) {
        itemCount++;
        for (const [itemKey, itemValue] of Object.entries(itemData)) {
          if (itemKey === "subItems") subItemCount++;
        }
      }
    } else if (key === "accessibilityScore") {
      accessibilityScore = value;
    }
  }

  const result = {
    itemCount: itemCount,
    subItemCount: subItemCount,
    score: accessibilityScore,
    length: jsonAuditRaw.split("\n").length,
  };

  return result;
});

ipcMain.handle("save-file", async (event, filePath, fileContent) => {
  try {

    await fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), "utf8");
    return { success: true, filePath: filePath, fileContent: fileContent };
  } catch (error) {
    console.error(`Failed to save file: ${error}`);
    return { success: false, error: error.message };
  }
})

ipcMain.handle("get-current-filename", async () => {
  const auditDirectory = path.join(__dirname, "settings");
  try {
    const files = fs.readdirSync(auditDirectory);
    return files.length > 0
      ? { success: true, filename: files[0] }
      : { success: false, error: "No .txt file found in folder." };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("replace-file", async (event, newData, newPath) => {
  const filePath = path.join(__dirname, newPath);
  if (typeof(newData) === 'object') {
    const parsedNewData = newData.join('\n')
    fs.writeFileSync(filePath, parsedNewData, 'utf8')
  } else {
    fs.writeFileSync(filePath, newData, "utf8");
  }
});

ipcMain.handle("access-os-data", async () => {
  const cores = os.cpus().length;
  const totalMemGB = os.totalmem() / 1024 ** 3;
  const safeMemoryUsage = totalMemGB * 0.8;

  const maxMemory = Math.floor(safeMemoryUsage / 0.5);
  const maxCpu = Math.floor(cores * 0.8);

  const concurrency = Math.max(1, Math.min(maxCpu, maxMemory));

  return concurrency;
});

ipcMain.handle("get-spawn", async (event, urlPath, outputPath, testing_method, user_agent, viewport, processId) => {
    let timeoutId
    const spawnPromise = new Promise((resolve, reject) => {
      const child = child_process.spawn(
        "node",
        [
          "runAndWriteAudit.mjs",
          urlPath,
          outputPath,
          testing_method,
          user_agent,
          viewport
        ],
        { stdio: ["ignore", "pipe", "pipe"] }
      );

      activeProcesses.set(processId, child)

      let output = ''
      let errorOutput = ''

      child.stdout.on('data', data => output += data.toString())

      child.stderr.on('data', data => errorOutput += data.toString())

      child.on("close", (code) => {
        clearTimeout(timeoutId)
        if (code === 0) {
            try {
                const result = JSON.parse(output.trim())
                console.log(result)
                resolve(result)
            } catch (err) {
                resolve(output.trim())
            }
        } else {
            reject(new Error(`Child exited with code ${code}: ${errorOutput}`))
        }
      });

      child.on("error", (err) => {
        clearTimeout(timeoutId)
        activeProcesses.delete(processId)
        console.error(`Spawn error for ${urlPath}: ${err}`);
        reject(err);
      });
    });

    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn(`Audit timeout for ${urlPath}`)
        activeProcesses.delete(processId)
        child.kill('SIGTERM')
        resolve(null)
      }, 30000);
    })

    return Promise.race([spawnPromise, timeoutPromise])
});

ipcMain.handle('cancel-audit', async () => {
  try {
    for (const [id, process] of activeProcesses) {
      process.kill('SIGTERM');
      activeProcesses.delete(id);
    }

    const folderPath = './audits/all-audit-sizes';
    try {
      const files = await fsPromise.readdir(folderPath);
      await Promise.all(files.map(file => fsPromise.unlink(path.join(folderPath, file))));
    } catch (error) {
      console.warn('Failed to clean up temporary files:', error);
    }
    return { success: true, message: 'All active audits cancelled and temporary files cleaned.' };
  } catch (error) {
    console.error('Failed to cancel audits:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('move-audit-files', async () => {
    const sourceDir = path.join(__dirname, 'audits/audit-results')
    const destinationDir = path.join(__dirname, 'audits/old-audit-results')

    const limit = pLimitDefault(5)

    try {
        await fsPromise.mkdir(destinationDir, { recursive: true })

        const existingFiles = await fsPromise.readdir(destinationDir)
        await Promise.all(existingFiles.map(file => {
          limit(() =>
            fsPromise.rm(path.join(destinationDir, file), { recursive: true, force: true })
          )
        }))

        const filesToMove = await fsPromise.readdir(sourceDir)
        await Promise.all(filesToMove.map(async (file) => {
          limit(async () => {
            const sourcePath = path.join(sourceDir, file)
            const destinationPath = path.join(destinationDir, file)

            await fsPromise.copyFile(sourcePath, destinationPath)
            await fsPromise.rm(sourcePath)
          })
        }))

        return { success: true, message: 'Files moved successfully.' }
    } catch (err) {
        console.error('Error moving audit files:', err)
        return { success: false, message: 'Failed to move files.', error: err.message }
    }
})

ipcMain.handle('clear-all-sized-audits-folder', async () => {
    const limit = pLimitDefault(1)
    try {
      const destination = path.join(__dirname, 'audits/all-audit-sizes')
      const existingFiles = await fsPromise.readdir(destination)
      await Promise.all(existingFiles.map(file => {
        limit(() => fsPromise.rm(path.join(destination, file), { recursive: true, force: true }))
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err }
    }
})

ipcMain.handle("get-p-limit", async () => pLimit);

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
