const {ipcRenderer} = require('electron');

ipcRenderer.on('command', (e, arg) => {
    alert(arg);
});