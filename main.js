const {app, BrowserWindow, Menu, dialog} = require('electron');

let mainWindow;

function createMainMenu() {
    let template = [
        {
            label: 'Map',
            submenu: [
                {
                    label: 'IP Address List',
                    click() {
                        mainWindow.webContents.send('ip-list');
                    }
                },
                {
                    label: 'Open',
                    click() {
                        dialog.showOpenDialog(
                            mainWindow, 
                            {
                                properties: [ 'openFile' ]
                            }, 
                            (filePaths) => {
                                if (filePaths.length === 0) {
                                    return;
                                }

                                mainWindow.webContents.send('open', filePaths[0]);
                            }
                        );
                    }
                },
                {
                    label: 'Save',
                    click() {
                        dialog.showSaveDialog(mainWindow, {}, (filename) => {
                            mainWindow.webContents.send('save', filename);
                        });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'close'
                }
            ]
        }  
    ];

    let menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'IP Mapper',
        show: false
    });

    createMainMenu();
    mainWindow.maximize();
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

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