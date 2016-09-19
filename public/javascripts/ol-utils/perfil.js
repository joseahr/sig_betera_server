/* Depende de bar.js y map.js*/

// Variable perfil
var profile;

// Capa que almacenará el lineString del perfil dibujado
var vectorDibujarPerfil = new ol.layer.Vector( { source: new ol.source.Vector() });

// Control en la barra principal
var controlPerfil = new ol.control.Toggle({	
    html: '<i class="fa fa-area-chart"></i>',
    title: "Perfil",
    interaction : new ol.interaction.Draw({	
        type: 'LineString',
        source: vectorDibujarPerfil.getSource()
    })
});

// Vector layer, almacenará el lineStringZ
// devuelto por el servidor
var sourceProfile = new ol.source.Vector({	
    format: new ol.format.GeoJSON()
});

var vectorProfile = new ol.layer.Vector({	
    source: sourceProfile,
    style: style
});
// Añadimos al mapa
map.addLayer(vectorProfile);

// Estilo del lineString
var style = [	
    new ol.style.Style({	
        image: new ol.style.RegularShape({	
            radius: 10,
            radius2: 5,
            points: 5,
            fill: new ol.style.Fill({ color: 'blue' })
        }),
        stroke: new ol.style.Stroke({	
            color: [0,0,255],
            width: 2
        }),
        fill: new ol.style.Fill({	
            color: [0,0,255,0.3]
        })
    })
];


// Lo añadimos a la barra principal
mainbar.addControl (controlPerfil,    
    // barra de opciones asociada al control
    new ol.control.Bar({	
        controls:[ 
            new ol.control.Toggle({	
                html: 'undo',//'<i class="fa fa-mail-reply"></i>',
                title: "Delete last point",
                className: "noToggle ol-text-button",
                onToggle: function(){	
                    controlPerfil.getInteraction().removeLastPoint();
                }
            }),
            new ol.control.Toggle({	
                html: 'Finish',
                title: "finish",
                className: "noToggle ol-text-button",
                onToggle: function(){	
                    controlPerfil.getInteraction().finishDrawing();
                }
            })
        ]
    })
);

// Cuando acabemos de dibujar el lineString en el mapa
controlPerfil.getInteraction().on('drawend', function(e){
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
    map.getView().fit( extent, map.getSize() );
    // Obtenemos el perfil del server
    getProfileOfLineString(wkt);
    // ELiminamos todo lo que hayamos dibujado en la capa
    vectorDibujarPerfil.getSource().refresh();
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

function getProfileOfLineString(lineString){
    var req = new XMLHttpRequest();
    req.open('GET', '/raster/perfil?wkt=' + lineString, true);
    req.onreadystatechange = function (string) {
        if (req.readyState == 4) {
            if(req.status < 400){
                var lineStringZ = JSON.parse(req.responseText);
                addPerfil(lineStringZ);
                showProfile();
                $('#loading').css('visibility', 'hidden');
            }
            else{
                $('#loading').css('visibility', 'hidden');
                console.log("Error cargando JSON\n");
            }
        }
    };
    req.send(null);
    $('#loading').css('visibility', 'visible');
}

function showProfile(){
    $('<a href="#modal-perfil">').leanModal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: 0, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
        starting_top: '4%', // Starting top style attribute
        ending_top: '10%', // Ending top style attribute
        ready: function() {
        }, // Callback for Modal open
        complete: function() {
            vectorProfile.getSource().clear();
            vectorDibujarPerfil.getSource().changed();
        } // Callback for Modal close
    }).trigger('click');
    // Eliminamos el efecto de overlay (Así podemos interactuar con el mapa sin cerrar el perfil)
    // Las propiedades dissmisable y opacity dejan de surtir efecto con esta acción
    $('.lean-overlay').remove();
}

// Función para añadir perfil
function addPerfil(lineString){

    vectorProfile.getSource().clear();
    $('#perfil-container').empty();

    //$('#wkt-profile').text(JSON.stringify(lineString));

    lineString.coordinates = lineString.coordinates.map(function(coords){
        coords[2] = coords[2].toFixed(3);
        return coords;
    })

    var parser = new ol.format.GeoJSON();

    var feature = new ol.Feature({
        geometry : new ol.geom.LineString(lineString.coordinates, 'XYZ')
    })

	// New profil in the map
	profil = new ol.control.Profil({
        target : $('#perfil-container').get(0),
        width : $(window).innerWidth() -20, 
        //height : $(window).height()/4,
        info : {
            zmin : 'Zmin', zmax : 'Zmax', altitude : 'Altitud', distance : 'Distancia'
        },
        units : 'm'
    });

	map.addControl(profil);

	// Vector style
	var style = 
	[	new ol.style.Style(
			{	image: new ol.style.RegularShape(
				{	radius: 10,
					radius2: 5,
					points: 5,
					fill: new ol.style.Fill({ color: 'blue' })
				}),
			stroke: new ol.style.Stroke(
				{	color: [0,0,255],
					width: 2
				}),
			fill: new ol.style.Fill(
				{	color: [0,0,255,0.3]
				})
			})
	];

	// Show freature profile when loaded
	var pt;
	sourceProfile.once('change',function(e)
	{
    	if (sourceProfile.getState() === 'ready') 
		{	profil.setGeometry(sourceProfile.getFeatures()[0]);
			pt = new ol.Feature(new ol.geom.Point([0,0]));
			pt.setStyle([]);
			sourceProfile.addFeature(pt);
		}
	});
    sourceProfile.addFeature(feature);

	// Draw a point on the map when mouse fly over profil
	function drawPoint(e)
	{	if (!pt) return;
		if (e.type=="over") 
		{	// Show point at coord
			pt.setGeometry(new ol.geom.Point(e.coord));
			pt.setStyle(null);
		}
		else 
		{	// hide point
			pt.setStyle([]);
		}
	};
	profil.on(["over","out"], drawPoint);
}