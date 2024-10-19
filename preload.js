const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => {
            const validChannels = ['show-context-menu'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        invoke: (channel, data) => {
            const validChannels = ['dialog:openFolder', 'folder:index'];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, data);
            }
            throw new Error(`Invalid channel: ${channel}`);
        }
    },
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    indexFolder: (folderPath) => ipcRenderer.invoke('folder:index', folderPath)
});
