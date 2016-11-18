const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;

function createMainMenu() {
    let template = [
        {
            label: 'Map',
            submenu: [
                {
                    label: 'IP Address List',
                    click() {
                        mainWindow.webContents.send('command', 'ip-list');
                    }
                },
                {
                    label: 'Open',
                    click() {
                        mainWindow.webContents.send('command', 'open');
                    }
                },
                {
                    label: 'Save',
                    click() {
                        mainWindow.webContents.send('command', 'save');
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

    mainWindow.webContents.openDevTools();

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