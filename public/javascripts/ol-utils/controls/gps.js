/**************GEOLOC */
function GeolocationControl(mapController){
    var mainbar = mapController.mainbar;
    var map = mapController.map;
    var geolocation = mapController.geolocation;
    geolocation.on('error', function(err){
        try{
            alert(err);
            logDeep(err);

            function logDeep(obj){
                Object.keys(obj).forEach(function(k){
                    if(typeof obj[k] == 'object') return logDeep(obj[k]);
                    alert('ld ' + k + ' ' + obj[k]);
                });
            }
            console.log(err);
        } catch(e){
            alert('eeeeerror geoloc');
        }
        geolocation.setTracking(true);
    });
    geolocation.on('change', function(evt) {
        alert('changed' + geolocation.getPosition())
        addPosition(geolocation.getPosition());
    });
    var positionSource = new ol.source.Vector();
    var positionVector = new ol.layer.Vector({
        source : positionSource,
        displayInLayerSwitcher : false,
        name : 'position'
    });

    // LineString to store the different geolocation positions. This LineString
    // is time aware.
    // The Z dimension is actually used to store the rotation (heading).
    var positions = new ol.geom.LineString([],
        /** @type {ol.geom.GeometryLayout} */ ('XYZM'));
    // Geolocation marker
    var markerEl = document.createElement('img');
    markerEl.id = 'geolocation_marker';
    var marker = new ol.Overlay({
        positioning: 'center-center',
        element: markerEl,
        stopEvent: false
    });

    var previousM = 0;
    var deltaMean = 500;

    map.addOverlay(marker);
    map.addLayer(positionVector);

    var gpsControl = new ol.control.Toggle({
        name : 'gps',	
        html: '<i class="material-icons" style="font-size : 20px;">gps_off</i>',
        tooltip : {
            text : 'GPS',
            delay : 50,
            position : 'bottom'
        },
        onToggle : function(){
            geolocation.setTracking(false);
            geolocation.un('change');
            if(!this.getActive()) return;
            geolocation.setTracking(true);
            // listen to changes in position
            geolocation.on('change', function(evt) {
                alert('changed' + geolocation.getPosition())
                addPosition(geolocation.getPosition());
            });
        }
    });

    mainbar.addControl(gpsControl);

    // convert radians to degrees
    function radToDeg(rad) {
        return rad * 360 / (Math.PI * 2);
    }
    // convert degrees to radians
    function degToRad(deg) {
        return deg * Math.PI * 2 / 360;
    }
    // modulo for negative values
    function mod(n) {
        return ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    }

    function addPosition(position, heading, m, speed) {
        var x = position[0];
        var y = position[1];
        var fCoords = positions.getCoordinates();
        var previous = fCoords[fCoords.length - 1];
        var prevHeading = previous && previous[2];
        if (prevHeading) {
            var headingDiff = heading - mod(prevHeading);

            // force the rotation change to be less than 180°
            if (Math.abs(headingDiff) > Math.PI) {
            var sign = (headingDiff >= 0) ? 1 : -1;
            headingDiff = -sign * (2 * Math.PI - Math.abs(headingDiff));
            }
            heading = prevHeading + headingDiff;
        }
        positions.appendCoordinate([x, y, heading, m]);

        // only keep the 20 last coordinates
        positions.setCoordinates(positions.getCoordinates().slice(-20));

        // FIXME use speed instead
        if (heading && speed) {
            markerEl.src = 'http://openlayers.org/en/latest/examples/data/geolocation_marker_heading.png';
        } else {
            markerEl.src = 'http://openlayers.org/en/latest/examples/data/geolocation_marker.png';
        }
        var c = [x,y, heading, m];
        map.getView().setCenter([x, y]);
        map.getView().rotation = heading;
        marker.setPosition([x, y]);
    }

    // recenters the view by putting the given coordinates at 3/4 from the top or
    // the screen
    function getCenterWithHeading(position, rotation, resolution) {
        var size = map.getSize();
        var height = size[1];

        return [
            position[0] - Math.sin(rotation) * height * resolution * 1 / 4,
            position[1] + Math.cos(rotation) * height * resolution * 1 / 4
        ];
    }

    // postcompose callback
    function render() {
        map.render();
    }
    map.on('postcompose', render);
}


