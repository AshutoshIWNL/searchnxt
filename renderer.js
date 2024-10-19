let indexedFiles = [];

async function indexFolder(folderPath) {
    indexedFiles = await window.electron.indexFolder(folderPath);
    displayResults(indexedFiles);
}

async function selectRootDirectory() {
    const folderPaths = await window.electron.openFolder();
    if (folderPaths && folderPaths.length > 0) {
        const folderPath = folderPaths[0];
        await indexFolder(folderPath);
    }
}

function searchFiles(query) {
    const results = indexedFiles.filter(file =>
        file.name.toLowerCase().includes(query.toLowerCase())
    );
    displayResults(results);
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.style.display = 'none'; // Hide if no results
        return;
    }

    results.forEach(file => {
        const item = document.createElement('div');
        item.classList.add('file-item');

        const fileInfo = document.createElement('div');
        fileInfo.classList.add('file-info');

        fileInfo.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-modified">Last Modified: ${new Date(file.lastModified).toLocaleString()}</span>
            <span class="file-size">Size: ${formatFileSize(file.size)}</span>
            <span class="file-path">${file.path}</span>
        `;

        // Add right-click context menu listener
        item.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent default context menu
            const filePath = file.path;
            window.electron.ipcRenderer.send('show-context-menu', filePath); // Send to main process
        });

        item.appendChild(fileInfo);
        resultsContainer.appendChild(item);
    });

    resultsContainer.style.display = 'block'; // Show if there are results
}



function formatFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }
    return `${size.toFixed(2)} ${units[index]}`;
}


document.getElementById('searchBox').addEventListener('input', (event) => {
    searchFiles(event.target.value);
});

document.getElementById('selectFolderButton').addEventListener('click', selectRootDirectory);
