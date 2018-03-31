// @flow


/**
 * Notes to self:
 * 1.   modify cordova-googlemaps-plugin/www/Map.js:1013 to support getTile returing 
 *      a promise
 * 2.   Modify cordova-googlemaps-plugin/src/ios/GoogleMaps/PluginTileProvider.m:103
 *      to check and see if the result URL is a base64 url string
 * 3.   Modify cordova-googlemaps-plugin/src/android/plugin/google/maps/PluginTileProvider.java:161
 *      to check and see if the result URL is a base64 url string
 * 4.   Add ability to invalidate?
 */

class App {
    /*:: mapper: Mapper */
    init() {
        this.mapper = new Mapper();
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    }
    onDeviceReady() {
        this.mapper.init(); 
    }
}

class Mapper {
    /*:: canvas: HTMLCanvasElement */
    /*:: imgType: 'disk' | 'base64' */
    /*:: map: any */
    /*:: tileOverlay: any */
    constructor() {
        this.imgType = 'disk'; 
        this.canvas = document.createElement('canvas');
        this.canvas.height = 512;
        this.canvas.width = 512;
    }

    init() {
        attachHandler('disk', 'click', () => {
            this.imgType = 'disk';
            //this.tileOverlay.invalidate();
        });
        attachHandler('base64', 'click', () => {
            this.imgType = 'base64';
            //this.tileOverlay.invalidate();
        });

        let mapDiv = document.getElementById('map');
        this.map = window.plugin.google.maps.Map.getMap(mapDiv);

        this.map.one(window.plugin.google.maps.event.MAP_READY, () => this.mapReady());
    }

    mapReady() {
        this.map.addTileOverlay({
            getTile: (x, y, z) => this.getTile(x, y, z)
        }, (overlay) => {
            this.tileOverlay = overlay;
        });
    }

    getTile(x, y, zoom) {
        console.log(x, y, zoom);
        if(this.imgType === 'disk') {
            return 'file://img/logo.png';
        } else {
            return new Promise((r) => {
                r(createImage(this.canvas, x, y, zoom));
            });
        }
    }
}

function createImage(canvas, x, y, z) {

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    // circle
    ctx.fillStyle = `rgb(${(x*z)%256}, ${(y*z)%256}, ${(z*z)%256})`;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.arc(256, 256, 100, 0, Math.PI*2);
    ctx.fill();

    return canvas.toDataURL();
}

function attachHandler(id, on, cb) {
    let button = document.getElementById(id);
    if(button) {
        button.addEventListener(on, cb);
    } else {
        throw new Error(`could not find element with id: ${id}`);
    }
}

(new App()).init();
