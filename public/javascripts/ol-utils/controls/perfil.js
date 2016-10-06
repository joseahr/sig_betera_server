function PerfilControl(mapController){

    var map = mapController.map;
    var mainbar = mapController.mainbar;

    // Show freature profile when loaded
    var pt;

    // Draw a point on the map when mouse fly over profil
    function drawPoint(e){	
        if (!pt) return;
        if (e.type=="over") {	
            // Show point at coord
            pt.setGeometry(new ol.geom.Point(e.coord));
            pt.setStyle(stylePointPerfil);
        } else {	
            // hide point
            pt.setStyle([]);
        }
    };

    function resizeFn(){
        //console.log('resize', $('#perfil-container').innerWidth());
        if(!profile) return;
        console.log('resizeFn');
        // Eliminamos el control anterior de perfil
        map.removeControl(profile);
        // Vaciamos el contenedor del perfil
        $('#perfil-container').empty();
        //Creamos el objeto perfil
        profile = new ol.control.Profil({
            target : $('#perfil-container').get(0),
            width : $('#perfil-container').innerWidth() - 20, 
            height : $(window).innerHeight()/5,
            info : {
                zmin : 'Zmin', zmax : 'Zmax', altitude : 'Z', distance : 'Distancia'
            },
            units : 'm'
        });
        // Añadimos el control al mapa
        map.addControl(profile);
        // Le añadimos la Feature actual
        profile.setGeometry(profileFeature);
        // Y los eventos que dispara
        profile.on(["over","out"], drawPoint);
    };

    $('#map').on('sizeupdated', resizeFn);

    $('#download-perfil').bind('click', function(){
        download(profile.getImage(), 'perfil.png');
        //window.open(profile.getImage().replace("image/png", "image/octet-stream"));
    });

    $('#download-perfil-geojson').bind('click', function(){
        var parser = new ol.format.GeoJSON();
        var geojson = parser.writeFeature(profileFeature);
        var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));
        download(dataStr, 'perfil.json');
        //window.open(dataStr);
    });

    function download(data, fileName){
        var a = document.createElement('a');
        a.href = data;    
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);   
    }

    // Variable perfil
    var profile;

    // Almacena la feature del Perfil para hacer un set geometry
    var profileFeature;

    // Capa que almacenará el lineString del perfil dibujado
    var vectorDibujarPerfil = new ol.layer.Vector({ 
        source: new ol.source.Vector(),
        displayInLayerSwitcher : false,
        allwaysOnTop : true,
        name : 'Dibujo Perfil'
    });

    // Estilo del lineString
    var styleLineStringZ = [	
        new ol.style.Style({	
            stroke: new ol.style.Stroke({	
                color: [0,0,0],
                width: 3,
                lineDash: [.5, 10]
            })
        })
    ];

    var stylePointPerfil = [
        new ol.style.Style({
            image : new ol.style.FontSymbol({	
                form: 'marker',
                gradient: false,
                glyph: 'fa-map-marker', 
                fontSize: 0,
                radius: 16, 
                //offsetX: -15,
                rotation: 0,
                rotateWithView: true,
                offsetY: -17,
                color: '#303f9f',
                fill: new ol.style.Fill(
                {	color: '#fff'
                }),
                stroke: new ol.style.Stroke(
                {	color: '#303f9f',
                    width: 1,
                })
            }),
            stroke: new ol.style.Stroke(
            {	width: 2,
                color: '#f80'
            }),
            fill: new ol.style.Fill(
            {	color: [255, 136, 0, 0.6]
            })
        })
    ];

    // Control en la barra principal
    var controlPerfil = new ol.control.Toggle({
        name : 'perfil',
        html: '<i class="material-icons">terrain</i>',
        interaction : new ol.interaction.Draw({	
            type: 'LineString',
            source: vectorDibujarPerfil.getSource()
        }),
        onToggle : function(){
            vectorProfile.getSource().clear();
            vectorProfile.getSource().changed();
            $('#modal-perfil').closeModal();

            mapController.updateSize('bottom', '0px');

            if(!this.getActive()) return;
            /*if(isEditingMode()) {
                this.setActive(false);
                this.onToggle.call(this);
                Materialize.toast('No puede usar este control cuando está editando una capa', 2500);
                return;
            }*/

            mainbar.getControls().forEach(function(control){
                if(control.name !== 'perfil' && control.name){
                    console.log('control', control.name);
                    control.setActive(false);
                    control.onToggle.call(control);
                }
            });
        },
        tooltip : {
            text : 'Herramienta de perfil',
            delay : 50,
            position : 'right'
        }
    });

    // Vector layer, almacenará el lineStringZ
    // devuelto por el servidor
    var sourceProfile = new ol.source.Vector({	
        format: new ol.format.GeoJSON()
    });

    var vectorProfile = new ol.layer.Vector({	
        source: sourceProfile,
        style: styleLineStringZ,
        displayInLayerSwitcher : false,
        allwaysOnTop : true,
        name : 'Perfil LineStringZ'
    });
    // Añadimos al mapa
    map.addLayer(vectorProfile);

    // Lo añadimos a la barra principal
    mainbar.addControl (controlPerfil,    
        // barra de opciones asociada al control
        new ol.control.Bar({	
            controls:[ 
                new ol.control.Toggle({	
                    html: '<i class="material-icons">backspace</i>',
                    tooltip : {
                        text : 'Eliminar punto anterior',
                        delay : 50,
                        position : 'left'
                    },
                    className: "noToggle",
                    onToggle: function(){
                        var interaction = controlPerfil.getInteraction();
                        interaction.removeLastPoint();
                    }
                }),
                new ol.control.Toggle({	
                    html: '<i class="material-icons">done</i>',
                    tooltip : {
                        text : 'Finalizar',
                        delay : 50,
                        position : 'right'
                    },
                    className: "noToggle",
                    onToggle: function(){
                        controlPerfil.getInteraction().finishDrawing();
                    }
                })
            ]
        })
    );

    // Cuando acabemos de dibujar el lineString en el mapa
    controlPerfil.getInteraction().on('drawend', function(e){
        if(!e.feature.getGeometry().getLength())
            return Materialize.toast('Debe dibujar un perfil',  1000);
        // parser WKT de Openlayers
        var parser = new ol.format.WKT();
        // Obtenemos el String WKT de la geometría dibujada
        var wkt = parser.writeFeature(e.feature);
        // Obtenemos su extensión
        var extent = e.feature.getGeometry().getExtent();
        // Modificamos la Ymin de la extensión de la geometría
        console.log(extent);
        //extent[1] -= 2000;
        // Tamaño del map
        var size = map.getSize();
        // Hacemos que el mapa se centre sobre esa extensión
        map.once('postrender', function(){
            map.getView().fit( extent, map.getSize() );
        });
        // Obtenemos el perfil del server
        getProfileOfLineString(wkt);
        // ELiminamos todo lo que hayamos dibujado en la capa
        vectorDibujarPerfil.getSource().clear();
        vectorDibujarPerfil.getSource().changed();
        // Desactivamos el control
        controlPerfil.setActive(false);
    });

    // Círculo de Cargando
    $('body').append(
        '<div id="loading" class="valign-wrapper" style="position : absolute; top: 0px; bottom: 0px; left : 0px; right: 0px; visibility : hidden;">' +
            '<div class="preloader-wrapper big active" style="margin : 0px auto;">' +
                '<div class="spinner-layer spinner-blue-only">' +
                    '<div class="circle-clipper left">' +
                        '<div class="circle"></div>' +
                    '</div><div class="gap-patch">' +
                        '<div class="circle"></div>' +
                    '</div><div class="circle-clipper right">' +
                        '<div class="circle"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    /*
    #### Enviamos la petición al Servidor para que nos devuelva 
    #### el lineString con la coordenada Z y compuesto por una mayor
    #### densidad de puntos que el que enviamos
    */
    function getProfileOfLineString(lineString){
        var req = new XMLHttpRequest();
        // METHOD GET ,, URL /raster/perfil?wkt=LINESTRING(...)
        req.open('GET', '/raster/perfil?wkt=' + lineString, true);
        // Función de escucha a eventos de la petición
        req.onreadystatechange = function (string) {
            // Ha finalizado la petición
            if (req.readyState == 4) {
                // Status entre 200 - 399
                if(req.status < 400){
                    // Obtenemos el lineStringZ en formato GeoJSON
                    var lineStringZ = JSON.parse(req.responseText);
                    // Llamamos a la función que gestiona los perfiles
                    // pasándole el lineStringZ
                    addPerfil(lineStringZ);
                    // Mostramos el perfil
                    showProfile();
                    // Eliminamos el círculo de cargando
                    $('#loading').css('visibility', 'hidden');
                }
                else{
                    // Ha habido un Error

                    // Eliminamos el circulo de cargando
                    $('#loading').css('visibility', 'hidden');
                    Materialize.toast('Error al obtener el perfil : ' /* + error*/, 4000 );
                    console.log("Error cargando JSON\n");
                    map.getView().setZoom(10);
                }
            }
        };
        req.send(null);
        $('#loading').css('visibility', 'visible');
    }

    /* Muestra el perfil en un menú modal*/
    function showProfile(){
        $('<a href="#modal-perfil">').leanModal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
            opacity: 0, // Opacity of modal background
            complete: function() {
                vectorProfile.getSource().clear();
                vectorDibujarPerfil.getSource().changed();
                mapController.updateSize('bottom', '0px');
            } // Callback for Modal close
        }).trigger('click');
        $('.modal').css('padding-left', $('#map').css('padding-left') + 'px');
        mapController.updateSize('bottom', $('#modal-perfil').height() - 10);
        // Eliminamos el efecto de overlay (Así podemos interactuar con el mapa sin cerrar el perfil)
        // Las propiedades dissmisable y opacity dejan de surtir efecto con esta acción
        $('.lean-overlay').remove();
    }

    // Función para añadir perfil
    function addPerfil(lineString){

        // Nos aseguramos de que no haya nada dibujado
        vectorProfile.getSource().clear();
        // Ni haya un perfil en el menú modal
        $('#perfil-container').empty();

        // Formateamos las coordenadas para que tengan 3 decimales
        lineString.coordinates = lineString.coordinates.map(function(coords){
            coords[2] = coords[2].toFixed(3);
            return coords;
        })

        // Creamos un parser de GeoJSON
        var parser = new ol.format.GeoJSON();

        // Leemos el lineString y obetenemos un objeto ol.Feature
        var feature = profileFeature = new ol.Feature({
            geometry : new ol.geom.LineString(lineString.coordinates, 'XYZ')
        })


        // Hacemos que el contenedor del perfil tenga un zoom inicial
        // importante ya que el canvas que se pinte cogerá la propiedad 
        // width de este div contenedor
        $('#perfil-container').css('width', $(window).innerWidth() -20);
        
        // Creamos el perfil, esto añadirá la feature al mapa
        // y el perfil al contenedor del perfil
        profile = new ol.control.Profil({
            target : $('#perfil-container').get(0),
            width : $('#perfil-container').innerWidth(), 
            height : $(window).innerHeight()/5,
            info : {
                zmin : 'Zmin', zmax : 'Zmax', altitude : 'Z', distance : 'Distancia'
            },
            units : 'm'
        });

        // Añadimos el control al mapa
        map.addControl(profile);

        sourceProfile.once('change',function(e){
            if (sourceProfile.getState() === 'ready'){	
                profile.setGeometry(sourceProfile.getFeatures()[0]);
                pt = new ol.Feature(new ol.geom.Point([0,0]));
                pt.setStyle(stylePointPerfil);
                sourceProfile.addFeature(pt);
            }
        });
        // Añadimos la feature - Se dispara evente soureceProfile.once('change');
        feature.setStyle(styleLineStringZ);
        sourceProfile.addFeature(feature);

        // Nos aseguramos de que solo se disparé un evento resize
        // Así que si ya existe uno de otro perfil anterior, lo eliminamos
        $(window).off('resize');

        // Creamos un nuevo evento que escuha cuando la pantalla cambia sus
        // proporciones, lo que hacemos es crear otra vez el objeto perfil
        // ajustándolo al width actual del contendor
        $(window).on('resize', resizeFn);
        // Hacemos que el container sea responsive
        $('#perfil-container').css('width', '100%');
        // Eventos
        profile.on(["over","out"], drawPoint);
    }
}