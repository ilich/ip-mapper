const {ipcRenderer} = require('electron');
const maxmind = require('maxmind');

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
        var feature = map.forEachFeatureAtPixel(e.pixel, (feature) => { return feature; })
        if (feature) {
            var coordinates = feature.getGeometry().getCoordinates();
            popupOverlay.setPosition(coordinates);
            $popup.popover({
                'placement': 'top',
                'html': false,
                'content': feature.get('name')
            });
            
            $popup.popover('show');
        }
        else {
            $popup.popover('destroy');
        }
    });

    function addCity(ip, city) {
        let coordinates = [city.location.longitude, city.location.latitude];
        let location = ol.proj.fromLonLat(coordinates);

        let cityFeature = new ol.Feature({
            geometry: new ol.geom.Point(location),
            name: `${ip}, ${city.city.names['en']}, ${city.country.iso_code}`
        });

        cityFeature.setStyle(cityStyle);
        vectorSource.addFeature(cityFeature);

        mapView.setCenter(ol.proj.fromLonLat(coordinates));
    }

    function showOnMap(data) {
        // TODO


        maxmind.open(MAXMIND_DATA,  (err, cities) => {
            vectorSource.clear();

            if (err) {
                alert(err);
                return;
            }

            let ip = '8.8.8.8';
            let city = cities.get(ip);
            if (!city) {
                return;
            }

            console.log(ip, city);

            
            addCity(ip, city);

            
        });
    }

    return {
        openEditor: function () {
            $gialog.modal('show');
        },

        refresh: function () {
            $gialog.modal('hide');

            var ipText = $ipList.val();
            showOnMap(ipText);
        }
    };
}

let map = mapWidget();

ipcRenderer.on('command', (e, arg) => {
    switch(arg) {
        case 'ip-list':
            map.openEditor();
            break;

        case 'open':
            break;

        case 'save':
            break;
    }
});

$('#ip-update').click(function () {
    map.refresh();
});

