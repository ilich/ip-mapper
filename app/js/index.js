const {ipcRenderer, dialog} = require('electron');
const maxmind = require('maxmind');
const fs = require('fs');

function mapWidget() {
    const NEW_YORK = [-73.93, 40.73];
    const MAXMIND_DATA = './app/data/GeoLite2-City.mmdb';

    let $gialog = $('#ip-dialog');
    let $ipList = $('#ip-list');
    
    // Map styles and overlays

    let popup = document.getElementById('popup');
    let $popup = $(popup);
    let popupOverlay = new ol.Overlay({
        element: document.getElementById('popup')
    });

    let cityStyle = new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(0, 100, 0, 0.5)'
            }),
            stroke:  new ol.style.Stroke({
                color: 'black',
                width: 1
            }),
            radius: 10
        })
    });

    // Setup map layers

    let osmSource = new ol.source.OSM({
        attributions: [
            ol.source.OSM.ATTRIBUTION,
            new ol.Attribution({
                html: '<a href="https://www.openstreetmap.org/fixthemap">https://www.openstreetmap.org/fixthemap</a>.'
            }),
            new ol.Attribution({
                html: 'This product includes GeoLite2 data created by MaxMind, available from <a href="http://www.maxmind.com">http://www.maxmind.com</a>.'
            })
        ]
    });

    let tileLayer = new ol.layer.Tile({
        source: osmSource
    });

    let vectorSource = new ol.source.Vector({});

    let vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    // Setup map view and the map

    let mapView = new ol.View({
        center: ol.proj.fromLonLat(NEW_YORK),
        zoom: 6
    });

    let map = new ol.Map({
        target: 'map',
        layers: [ tileLayer, vectorLayer ],
        view: mapView
    });

    map.addOverlay(popupOverlay);

    map.on('click', function (e) {
        let feature = map.forEachFeatureAtPixel(e.pixel, (f) => f)
        if (feature) {
            let coordinates = feature.getGeometry().getCoordinates();
            popupOverlay.setPosition(coordinates);

            let msg = feature.get('name');
            if ($popup.data('bs.popover')) {
                let popverControl = $popup.data('bs.popover')
                popverControl.options.content = msg;
                popverControl.setContent();
            }
            else {
                $popup.popover({
                    'placement': 'top',
                    'html': false,
                    'content': msg
                });
                
                $popup.popover('show');
            }
        }
        else {
            $popup.popover('destroy');
        }
    });

    function addCity(ip, city) {
        let coordinates = [city.location.longitude, city.location.latitude];
        let location = ol.proj.fromLonLat(coordinates);

        let info = [ ip ];
        if (city.city && city.city.names) {
            info.push(city.city.names['en']);
        }

        if (city.country) {
            info.push(city.country.iso_code);
        }

        let cityFeature = new ol.Feature({
            geometry: new ol.geom.Point(location),
            name: info.join(', ').trim()
        });

        cityFeature.setStyle(cityStyle);
        vectorSource.addFeature(cityFeature);

        return location;
    }

    function showOnMap(data) {
        vectorSource.clear();

        if (!data) {
            return;
        }

        data = data.trim();
        if (data === '') {
            return;
        }

        maxmind.open(MAXMIND_DATA,  (err, cities) => {
            if (err) {
                alert(err);
                return;
            }

            let list = data.split(/[\n,;]/);
            let notFound = [];
            let lastLocation = null;
            for (let ip of list) {
                ip = ip.trim();
                let city = cities.get(ip);
                if (!city) {
                    notFound.push(ip);
                    continue;
                }

                lastLocation = addCity(ip, city);
            }

            if (lastLocation) {
                mapView.setCenter(lastLocation);
            }

            if (notFound.length > 0) {
                notFound.splice(0, 0, "The following IP addresses were not found:");
                let msg = notFound.join('\n');
                alert(msg);
            }            
        });
    }

    return {
        open(filename) {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    alert(err);
                    return;
                }

                $ipList.val(data);
                showOnMap(data);
            });
        },

        save(filename) {
            var addresses = $ipList.val().trim();
            if (addresses === '') {
                alert('Please add IP addresses to the map first.');
                return;
            }

            fs.writeFile(filename, addresses, (err) => {
                alert(err ? err : "IP address list has been stored.");
            });
        },

        openEditor() {
            $gialog.modal('show');
        },

        refresh() {
            $gialog.modal('hide');

            var addresses = $ipList.val();
            showOnMap(addresses);
        }
    };
}

let map = mapWidget();

ipcRenderer.on('ip-list', () => {
    map.openEditor();
});

ipcRenderer.on('save', (e, filename) => {
    map.save(filename);
});

ipcRenderer.on('open', (e, filename) => {
    map.open(filename);
});

$('#ip-update').click(function () {
    map.refresh();
});