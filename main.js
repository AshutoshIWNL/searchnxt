const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const fs = require('fs'); 
const path = require('path');
const Filehound = require('filehound'); 


function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + '/preload.js',
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    win.loadFile('index.html');
}

let currentFilePath = '';

const contextMenu = Menu.buildFromTemplate([
    {
        label: 'Open File',
        click: () => {
            shell.openPath(currentFilePath).then((result) => {
                if (result) {
                    console.error('Error opening file:', result);
                }
            });
        }
    },
    {
        label: 'Open Containing Folder',
        click: () => {
            shell.showItemInFolder(currentFilePath);
        }
    },
    {
        label: 'Delete',
        click: () => {
            fs.unlink(currentFilePath, (err) => {
                if (err) {
                    console.error('Failed to delete file:', err);
                } else {
                    console.log('File deleted:', currentFilePath);
                }
            });
        }
    },
    { type: 'separator' },
    {
        label: 'Cancel',
        role: 'cancel'
    }
]);

ipcMain.on('show-context-menu', (event, filePath) => {
    currentFilePath = filePath;
    contextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return result.filePaths;
});

ipcMain.handle('folder:index', async (event, folderPath) => {
    try {
        const indexedFiles = await Filehound.create()
            .path(folderPath)
            //.depth(5)
            .find();

        const fileDetails = await Promise.all(indexedFiles.map(async (file) => {
            const stats = await fs.promises.stat(file);
            return {
                name: path.basename(file),
                lastModified: stats.mtime,
                size: stats.size,
                path: file
            };
        }));

        return fileDetails;
    } catch (error) {
        console.error('Error indexing folder:', error);
        throw error;
    }
});

app.whenReady().then(createWindow);
