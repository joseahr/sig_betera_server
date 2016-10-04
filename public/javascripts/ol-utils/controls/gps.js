

/**************GEOLOC */
var geolocation = new ol.Geolocation({
    // take the projection to use from the map's view
    projection: map.getView().getProjection()
});
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
            alert('position', geolocation.getPosition());
        });
    }
});

mainbar.addControl(gpsControl);