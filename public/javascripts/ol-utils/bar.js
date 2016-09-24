//  Vector layer
//var vector = new ol.layer.Vector( { source: new ol.source.Vector() });
//map.addLayer(vector);

// Barra de control principal -- Alamcenará todos los controles
var mainbar = new ol.control.Bar();
map.addControl(mainbar);

/*
#### Control creado para editar features que se estén dibujando
#### sobre una capa
*/
/*var editbar = new ol.control.Bar({	
    toggleOne: true,	// one control active at the same time
    group:false			// group controls together
});

mainbar.addControl(editbar);

// ol.control.Toggle (ol3-ext) sirve para añadir opciones 
// a los botones (debajo)
var selectCtrl = new ol.control.Toggle({	
    html: '<i class="fa fa-hand-pointer-o"></i>',
    title: "Select",
    interaction: new ol.interaction.Select (),
    active:false
});

var sbar = new ol.control.Bar();
sbar.addControl (new ol.control.Toggle({	
    html: '<i class="fa fa-times"></i>',
    title: "Elminar",
    className: "noToggle",
    onToggle: function(){	
        var features = selectCtrl.getInteraction().getFeatures();
        if (!features.getLength()) console.log("Select an object first...");
        else console.log(features.getLength() + " object(s) deleted.");
        for (var i=0, f; f=features.item(i); i++) {	
            vector.getSource().removeFeature(f);
        }
        selectCtrl.getInteraction().getFeatures().clear();
    }
}));
sbar.addControl (new ol.control.Toggle({	
    html: '<i class="fa fa-info"></i>',
    title: "Show informations",
    className: "noToggle",
    onToggle: function() {	
        switch (selectCtrl.getInteraction().getFeatures().getLength()){	
            case 0: console.log("Select an object first...");break;
            case 1:
                var f = selectCtrl.getInteraction().getFeatures().item(0);
                console.log("Selection is a "+f.getGeometry().getType());
                break;
            default:
                console.log(selectCtrl.getInteraction().getFeatures().getLength()+ " objects seleted.");
                break;
        }
    }
}));

editbar.addControl ( selectCtrl, sbar);

// Add editing tools
var pedit = new ol.control.Toggle({	
    html: '<i class="fa fa-map-marker" ></i>',
    title: 'Point',
    interaction: new ol.interaction.Draw({	
        type: 'Point',
        source: vector.getSource()
    })
});
editbar.addControl ( pedit );

var ledit = new ol.control.Toggle({	
    html: '<i class="fa fa-share-alt" ></i>',
    title: 'LineString',
    interaction: new ol.interaction.Draw({	
        type: 'LineString',
        source: vector.getSource()
    })
});
editbar.addControl(
    ledit, 
    // Options bar ssociated with the control
    new ol.control.Bar({	
        controls:[ 
            new ol.control.Toggle({	
                html: 'undo',//'<i class="fa fa-mail-reply"></i>',
                title: "Delete last point",
                className: "noToggle ol-text-button",
                onToggle: function(){	
                    ledit.getInteraction().removeLastPoint();
                }
            }),
            new ol.control.Toggle({	
                html: 'Finish',
                title: "finish",
                className: "noToggle ol-text-button",
                onToggle: function(){	
                    ledit.getInteraction().finishDrawing();
                }
            })
        ]
    }) 
);

var fedit = new ol.control.Toggle({	
    html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
    title: 'Polygon',
    interaction: new ol.interaction.Draw({	
        type: 'Polygon',
        source: vector.getSource()
    })
});
editbar.addControl(
    fedit, 
    // Options bar ssociated with the control
    new ol.control.Bar({	
        controls:[ 
            new ol.control.Toggle({	
                html: 'undo',//'<i class="fa fa-mail-reply"></i>',
                title: "undo last point",
                className: "noToggle ol-text-button",
                onToggle: function(){	
                    fedit.getInteraction().removeLastPoint();
                }
            }),
            new ol.control.Toggle({	
                html: 'finish',
                title: "finish",
                className: "noToggle ol-text-button",
                onToggle: function(){	
                    fedit.getInteraction().finishDrawing();
                }
            })
        ]
    }) 
);

// Prevent null objects on finishDrawing
vector.getSource().on('addfeature', function(e){	
    switch (e.feature.getGeometry().getType()){	
        case 'Polygon': 
            if (e.feature.getGeometry().getCoordinates()[0].length < 4) 
                vector.getSource().removeFeature(e.feature);
            break;
        case 'LineString': 
            if (e.feature.getGeometry().getCoordinates().length < 2) 
                vector.getSource().removeFeature(e.feature);
            break;
        default: break;
    }
    console.log(vector.getSource().getFeatures().length)
});

// Add a custom push button with onToggle function
/*
mainbar.addControl ( new ol.control.Toggle({	
    html: '<i class="fa fa-smile-o"></i>',
    title: "Hello world!",
    onToggle: function(active){	
        if (active) console.log("Hello, I'm active"); 
        else console.log("Hello, I'm not active"); 
    }
}));
*/
        
// Add a save button with on active event
/*
var save = new ol.control.Toggle({	
    html: '<i class="fa fa-download"></i>',
    title: "Save",
    className: "noToggle"
});
mainbar.addControl ( save );

save.on("change:active", function(e){	
    var json= new ol.format.GeoJSON().writeFeatures(vector.getSource().getFeatures());
    $("#export").text(json);
});
*/