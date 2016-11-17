const {app, BrowserWindow} = require('electron');

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow();

    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
