const {ipcRenderer} = require('electron');

ipcRenderer.on('command', (e, arg) => {
    alert(arg);
});

const NEW_YORK = [-73.93, 40.73];
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat(NEW_YORK),
        zoom: 4
    })
});