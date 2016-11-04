setDataTable('table');

if(!mobileAndTabletcheck()){
    $('.seccion').css('left', '300px');
}
else {
    $('ul#slide-out').css('transform', 'translateX(-100%)');
    $('.seccion').css('left', '0px')
}


$('body').on('click', '.create-layer-btn', function(e){
    $('#new-layer').openModal();
});

$('body').on('click', '.create-baselayer-btn', function(e){
    $('#new-baselayer').openModal();
});


$('#upload-baselayer-form').submit(function(e){
    e.preventDefault();
    var xhr = new XMLHttpRequest();
    var self = this;
    $(this).find('button').attr('disabled', 'disabled');
    xhr.open('POST', '/admin/baselayers', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            $(self).find('button').attr('disabled', null);
            if(xhr.status >= 200 && xhr.status < 400){
                var baseLayer = JSON.parse(xhr.responseText);
                console.log(baseLayer, xhr.responseText);
                allBaseLayers.push(baseLayer);
                refreshCapasBase();
                $('#new-baselayer').closeModal();
                Materialize.toast('Servicio creado correctamente', 2500);
            } else {
                Materialize.toast('Error creando servicio : ' + xhr.responseText, 2500);
            }
        }
    }
    
    var selectedLayers = [];
    $('#select-capas-wms').find('option:selected').each(function(i){
        if($(this).val()) selectedLayers.push($(this).val());
    });
    console.log(selectedLayers);

    xhr.send(JSON.stringify({ 'service_url' : $('#url_servicio').val(), 'layers' : selectedLayers }));

});

$('body').on('click', '.delete-baselayer-btn', function(e){
    e.preventDefault();

    var xhr = new XMLHttpRequest();
    var self = this;
    var layerId = $(this).attr('baselayer-id');
    
    xhr.open('DELETE', '/admin/baselayers', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            $(self).find('input').val('');
            $(self).find('button').attr('disabled', null);
            if(xhr.status >= 200 && xhr.status < 400){
                removeBaseLayer(layerId);
                
                refreshCapasBase();
                Materialize.toast('Capa base eliminada correctamente', 2500);
            } else {
                Materialize.toast('Error al eliminar capa base : ' + xhr.responseText, 2500);
            }
        }
    }

    xhr.send( JSON.stringify({ id : layerId }) );
});

$('#get-layers-wms-form').submit(function(e){
    e.preventDefault();
    var xhr = new XMLHttpRequest();
    var self = this;
    $(this).find('button').attr('disabled', 'disabled');
    xhr.open('POST', '/usuarios/capas/wms/getCapabilities', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            $(self).find('button').attr('disabled', null);
            if(xhr.status >= 200 && xhr.status < 400){
                var layers = JSON.parse(xhr.responseText);
                console.log(layers);
                console.log($('#upload-baselayer-form').find('select'));
                $('#upload-baselayer-form').find('select')
                    .empty()
                    .append( $('<option>').attr('value', '').attr('disabled', '').attr('selected', '').html('Elige capas a añadir') ).material_select();
                layers.forEach(function(l){
                    $('#upload-baselayer-form').find('select').append( $('<option>').attr('value', l['Name']).html(l['Name']) ).material_select();
                });
                $('#upload-baselayer-form').find('button').attr('disabled', null);
                Materialize.toast('Capas obtenidas correctamente', 2500);
            } else {
                $('#upload-baselayer-form').find('select').empty().material_select();
                $('#upload-baselayer-form').find('button').attr('disabled', '');
                Materialize.toast('Error obteniendo capas : ' + xhr.responseText, 2500);
            }
        }
    }
    console.log($('#url_servicio').val());
    xhr.send('service_url=' + encodeURIComponent($('#url_servicio').val()));
});

$('#upload-layer-form').submit(function(e){
    e.preventDefault();
    var selectedFiles = $(this).find('[type="file"]').get(0).files;
    var xhr = new XMLHttpRequest();
    var self = this;
    $(this).find('button').attr('disabled', 'disabled');
    xhr.open('POST', '/admin/layers?layerName=' + $('#nombre_capa').val(), true);

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            $(self).find('input').val('');
            $(self).find('button').attr('disabled', null);
            if(xhr.status >= 200 && xhr.status < 400){
                var capa = JSON.parse(xhr.responseText);
                allLayers.push(capa);
                
                refreshCapas();
                $('#new-layer').closeModal();
                Materialize.toast('SHP subido correctamente', 2500);
            } else {
                Materialize.toast('Error subiendo SHP : ' + xhr.responseText, 2500);
            }
        }
    }
    var fd = new FormData();
    for(var i = 0; i < selectedFiles.length; i++){
        var f = selectedFiles[i];
        fd.append('shps[]', f, f.name);
    }

    xhr.send(fd);
});

$('body').on('click', '.delete-layer-btn', function(e){
    e.preventDefault();

    var xhr = new XMLHttpRequest();
    var self = this;
    var layerName = $(this).attr('layer-name');
    console.log(layerName);
    
    xhr.open('DELETE', '/admin/layers', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            $(self).find('input').val('');
            $(self).find('button').attr('disabled', null);
            if(xhr.status >= 200 && xhr.status < 400){
                removeLayer($(self).attr('layer-id'));
                
                refreshCapas();
                Materialize.toast('Tabla eliminada correctamente', 2500);
            } else {
                Materialize.toast('Error eliminando tabla : ' + xhr.responseText, 2500);
            }
        }
    }

    xhr.send( JSON.stringify({ tableName : layerName }) );
});




$('.user-detail-btn').click(function(e){
    var userId = +$(this).parent().attr('user-id');
    var user = findUser(userId);
    var list = $('<ul id="user-maps-' + userId + '" class="collapsible popout" data-collapsible="accordion"></ul>');
    var groups = $('<div class="col s12"><ul id="user-groups-list" class="collection with-header"></ul></div>');
    var groupSelect = $('<div class="input-field col s12"><select id="select-group"><option value="" disabled selected>Elige un grupo a añadir</option></select><label>Grupos</label></div>');
    var mna = $('<table id="not-assigned-' + userId + '" class="display highlight user-layer-table" cellspacing="0" width="100%"><thead><tr><th>id</th><th>nombre</th><th class="no-sort"></th></tr></thead><tbody></tbody></table>');
    
    $('#user-detail .modal-content').empty();

    (allGroups || []).forEach(function(g){
        if( (user.grupos || []).indexOf(g) == -1)
            groupSelect.find('select').append(
                '<option user-id="' + userId + '" value="' + g + '">' + g + '</option>'
            )
    });

    (user.grupos || []).forEach(function(g){
        groups.find('ul').append(
            '<li class="collection-item"><div>' + g + '<a href="#!" class="secondary-content"><i group ="' + g + '" user-id="' + userId + '" class="remove-user-group-btn material-icons red-text ">remove_circle_outline</i></a></div></li>'
        )
    });

    (user.not_assigned_maps || []).forEach(function(mapa){
        mna.find('tbody').append(
            '<tr><td>' + mapa.id + '</td><td>' + mapa.name + '</td><td><i style="cursor : pointer" class="material-icons green-text add-map-btn" user-id="' + user.id +'" map-id="' + mapa.id + '">add_circle</i></td></tr>'
        )
    });

    (user.maps || []).forEach(function(mapa){
        appendUserMapsDetail(list.get(0), user, mapa);
    });

    var capas = $('<table class="display highlight user-layer-table" cellspacing="0" width="100%"><thead><tr><th>Nombre de la capa</th><th>Rol del usuario</th><th class="no-sort"><i class="material-icons green-text" style="cursor : pointer;">edit_circle</i></th></tr></thead><tbody></tbody></table>');
    (user.layers_rol || []).forEach(function(capa){
        var rol = (capa.rol || 'r');
        capas.find('tbody').append(
            '<tr><td>' + capa.name + '</td><td>' + rol + '</td><td><i rol="' + rol + '" user-id="' + userId + '" layer-id="' + (capa.id || capa.id_layer) + '" class="edit-user-layer-role-btn material-icons green-text" style="cursor : pointer;">edit_circle</i></td></tr>'
        )
    });

    groups.append(groupSelect);
    appendTabUserDetail(list.prop('outerHTML'), mna.prop('outerHTML'), groups.prop('outerHTML'), capas.prop('outerHTML'));

    $('#select-group').on('change', function(e){
        var select = $(this);
        var option = $(this).find('option:selected');
        var userId = option.attr('user-id');
        var user = findUser(userId);
        var group = option.text();
        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/admin/user/group', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400 ){
                option.remove();
                select.val('').material_select();
                $('#user-groups-list').append(
                    '<li class="collection-item"><div>' + group + '<a href="#!" class="secondary-content"><i group ="' + group + '" user-id="' + userId + '" class="remove-user-group-btn material-icons red-text ">remove_circle_outline</i></a></div></li>'
                );
                addGroup(user, group);
                Materialize.toast('Grupo añadido correctamente al usuario', 2000);
            }
        }
        xhr.send('id_user=' + userId + '&group=' + group)
    });

    $('ul.tabs').tabs();
    setDataTable('.user-layer-table');
    $('select').material_select();
    $('.collapsible').collapsible();
    $('#user-detail').openModal();
});


/******************************************
 * EVENTOS ********************************
 ******************************************/
$('body').on('click', '.edit-user-layer-role-btn', function(e){
    var parent = $(this).parent();
    var tdRol = parent.parent().find('td:eq(1)');

    var layerId = $(this).attr('layer-id');
    var userId = $(this).attr('user-id');

    var user = findUser(userId);
    var button = $(this);
    var rol = button.attr('rol');
    var select = $('<select class="select-new-role"><option value="' + rol + '" selected disabled>' + rol + '</option></select>');
    var posiblesRoles = ['r', 'e', 'd'].reduce(function(list, r){
        if(r != rol) list.push(r);
        return list;
    }, []);

    var closeEdit = function(){ parent.empty().append(button); parent.removeClass('valign-wrapper') };

    var closeEditBtn = $('<i class="valign material-icons red-text" style="float : right; cursor : pointer;">remove_circle_outline</i>');
        closeEditBtn.bind('click', closeEdit);
    
    posiblesRoles.forEach(function(r){
        select.append(
            '<option value="' + r + '">' + r + '</option>'
        );
    });
    
    parent.addClass('valign-wrapper');
    var container = $('<div class="input-field col s10">' + select.prop('outerHTML') + '</div>' );

    $(this).replaceWith(container);
    container.parent().append(closeEditBtn);
    select = parent.find('select').material_select();

    parent.find('select').change(function(e){

        var selectedRol = $(this).find('option:selected').val();
        var xhr = new XMLHttpRequest();
        var method = rol == 'r'
            ? 'POST' 
            : selectedRol == 'r' 
            ? 'DELETE'
            : 'PUT';

        xhr.open(method, '/admin/user/rol', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400 ){
                tdRol.html(selectedRol);
                button.attr('rol', selectedRol);
                closeEdit();

                changeUserLayerRole(user, layerId, selectedRol);
                Materialize.toast('Rol cambiado correctamente', 2000);
             }
        }
        xhr.send('id_user=' + userId + '&id_layer=' + layerId + '&rol=' + selectedRol);

    });
    
});

$('body').on('click', '.remove-user-group-btn', function(e){
    var item = $(this).parent().parent().parent();
    var userId = $(this).attr('user-id');
    var group = $(this).attr('group');
    var user = findUser(userId);
    var xhr = new XMLHttpRequest();

    xhr.open('DELETE', '/admin/user/group', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400 ){
            item.remove();
            $('#select-group').append(
                '<option user-id="' + userId + '" value="' + group + '">' + group + '</option>'
            )
            .val('')
            .material_select();
            removeGroup(user, group);
            Materialize.toast('Grupo eliminado correctamente al usuario', 2000);
        }
    }
    xhr.send('id_user=' + userId + '&group=' + group)

});

$('body').on('click', '.add-map-btn', function(e){
    var td = $(this).closest('tr');
    var id_user = +$(this).attr('user-id');
    var id_map = +$(this).attr('map-id');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/user/map', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                Materialize.toast('Mapa asignado correctamente', 2000);
                td.remove();

                var mapa = findMap(id_map);
                var user = findUser(id_user);
                var perms = findPerms(id_user, mapa.layers);
                //console.log('findMaps', findLayers(mapa.layers), mapa.layers);
                var layers = findLayers(mapa.layers);
                layers.forEach(function(l, index){ l.rol = perms[index] });
                mapa.layers = layers;
                mapa.id_map = mapa.id;
                user.maps.push(mapa);

                var capas = $('<table id="map-layers-table" class="display highlight user-layer-table" cellspacing="0" width="100%">' + 
                    '<thead><tr>' + 
                        '<th>Nombre de la capa</th>' + 
                        '<th>Rol del usuario</th>' + 
                        '<th class="no-sort"></th>' +
                    '</tr></thead><tbody></tbody></table>'
                );
                
                (mapa.layers || []).forEach(function(capa){
                    console.log(capa,'caaaap');
                    if( !isLayerIdInList(capa.id, user.layers_rol) ){
                        capas.find('tbody').append(
                            '<tr><td>' + capa.name + '</td><td>r</td><td><i rol="r" user-id="' + id_user + '" layer-id="' + capa.id + '" class="edit-user-layer-role-btn material-icons green-text" style="cursor : pointer;">edit_circle</i></td></tr>'
                        )
                        return;
                    }
                    user.layers_rol.forEach(function(lrol){
                        if(lrol.id_layer == capa.id){
                            var rol = lrol.rol || 'r';
                            capas.find('tbody').append(
                                '<tr><td>' + capa.name + '</td><td>' + rol + '</td><td><i rol="' + rol + '" user-id="' + id_user + '" layer-id="' + capa.id + '" class="edit-user-layer-role-btn material-icons green-text" style="cursor : pointer;">edit_circle</i></td></tr>'
                            )
                        }
                    });
                });

                appendUserMapsDetail('#user-maps-' + id_user, user, mapa, capas)
                setDataTable('#map-layers-table');
                if(!user.not_assigned_maps) user.not_assigned_maps = [];
                removeFromList(user.not_assigned_maps, +id_map);

            }
        }
    }
    xhr.send( $.param([ {name : 'id_map', value : id_map}, {name : 'id_user', value : id_user} ]) );
});

$('body').on('click', '.remove-map-btn', function(e){
    var div = $(this).parent().parent();
    var id_user = +$(this).attr('user-id');
    var id_map = +$(this).attr('map-id');

    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/admin/user/map', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                Materialize.toast('Mapa eliminado al usuario correctamente', 2000);
                div.remove();
                
                var mapa = findMap(+id_map);
                var user = findUser(+id_user);

                $('#not-assigned-' + id_user).find('tbody').append(
                    '<tr><td>' + mapa.id + '</td><td>' + mapa.name + '</td><td><i style="cursor : pointer" class="material-icons green-text add-map-btn" user-id="' + id_user +'" map-id="' + mapa.id + '">add_circle</i></td></tr>'
                );

                removeFromList(user.maps, +id_map);

                user.not_assigned_maps.push({ id : mapa.id, name : mapa.name });
            }
        }
    }
    xhr.send( $.param([ {name : 'id_map', value : id_map}, {name : 'id_user', value : id_user} ]) );
});


/**********************************
 * INICIO *************************
 **********************************/
$('#slide-out li a').click(function(e){
    e.preventDefault();
    $('#slide-out li.active').removeClass('active');
    $(this).parent().addClass('active');

    $('.visible_bet').removeClass('visible_bet').css('visibility', 'hidden');
    $( $(this).attr('data-href') ).addClass('visible_bet').css('visibility', 'visible').animateCss('bounceInDown');
});

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        var self = this;
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});


/***** MAPSSSSSSSSSSSSs
 */

$('body').on('click', '.delete-map-btn', function(e){
    var mapId = $(this).attr('map-id');
    var row = $(this).closest('tr');
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/admin/maps', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                row.remove();
                // TODO --> Eliminar mapa de todos los usuarios
                deleteUsersMap(mapId);
                $('#mapas-default-table').find('tbody').find('tr').each(function(index, tr){
                    var mapId_ = +$(tr).find('td:eq(0)').text();
                    if(mapId_ == mapId){
                        $(tr).remove();
                    }
                });
                $('#new-map-default').find('select').find('option').each(function(index, option){
                    var mapId_ = $(option).val();
                    if(mapId_ == mapId){
                        $(option).remove();
                    }
                });
                $('#new-map-default').find('select').material_select();
                Materialize.toast('Mapa eliminado correctamente', 2000);
            }
        }
    }
    xhr.send('id_map=' + mapId);
});

$('body').on('click', '.delete-map-default-btn', function(e){
    var mapId = $(this).attr('map-id');
    var map = findMap(mapId);
    var row = $(this).closest('tr');
    var xhr = new XMLHttpRequest();

    xhr.open('DELETE', '/admin/maps/defaults', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                row.remove();
                allDefaultMaps.forEach(function(m, index){
                    if(m.id == mapId){
                        allDefaultMaps.splice(index, 1);
                        return;
                    }
                });

                $('#new-map-default').find('select').append(
                    '<option value="' + mapId + '">' + map.name + '</option>'
                ).material_select();

                Materialize.toast('Mapa eliminado correctamente', 2000);
            }
        }
    }
    xhr.send('id_map=' + mapId);
});

$('body').on('click', '.create-map-btn', function(e){
    $('#new-map').openModal();
    $('#new-map').find('input').focus();
});

$('body').on('click', '.create-map-default-btn', function(e){
    $('#new-map-default').openModal();
});

$('#new-map-form').submit(function(e){
    e.preventDefault();
    var mapName = $(this.name).val();

    if(!mapName || mapName.length < 5) return Materialize.toast('El nombre del mapa debe tener al menos 5 caracteres', 2000);

    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/admin/maps', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                var map_ = JSON.parse(xhr.responseText)[0];
                addMap(map_);
                $('#new-map-default').find('select').append(
                    '<option value="' + map_.id + '">' + map_.name + '</option>'
                ).material_select();
                $('#new-map').closeModal();
                Materialize.toast('Mapa creado correctamente', 2000);
            }
        }
    }
    xhr.send('name=' + mapName);

});

$('#new-map-default').find('select').change(function(){
    var option = $(this).find('option:selected');
    var mapId = option.val();
    var select = $(this);
    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/admin/maps/defaults', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                addDefaultMap(mapId);
                option.remove();
                select.val("").material_select();
                Materialize.toast('Mapa añadido a default correctamente', 2000);
            }
        }
    }
    xhr.send('id_map=' + mapId);
});


$('body').on('click', '.edit-map-btn', function(e){
    var container = $('<div class="row"></div>')
    var ul = $('<ul class="collection map-layers"></ul>').appendTo(container);
    var mapId = $(this).attr('map-id');
    var map = findMap(mapId);

    var orderedLayers = [];
    var order = map.orden || [];

    (map.layers || []).forEach(function(lid){
        var l = findLayer(lid);
        l.type = 'layer';
        orderedLayers.push(l);
    });  

    (map.baselayers || []).forEach(function(lid){
        var l = findBaseLayer(lid);
        l.type = 'base';
        orderedLayers.push(l);
    });  

    if(order.length){
        orderedLayers.sort(function(a, b){
            return findPositionInOrder(a.id, a.type, order) > findPositionInOrder(b.id, b.type, order)
        });
    }

    orderedLayers.forEach(function(l){
        if(l.type == 'layer'){
            ul.append(
                '<li class="collection-item avatar">' + 
                    '<i class="material-icons circle green">layers</i>' + 
                    '<span class="title">' + l.name + '</span>' + 
                    '<p>id : ' + l.id + '</br>oid : ' + l.oid + '</p>' +
                    '<a href="#!" class="secondary-content remove-map-layer-btn" map-id="' + mapId + '" layer-id="' + l.id + '" layer-type="layer">' + 
                        '<i class="material-icons red-text">remove_circle_outline</i></a>' + 
                '</li>'
            );
        } else {
            ul.append(
                '<li class="collection-item avatar">' + 
                    '<i class="material-icons circle green lighten-3">layers</i>' + 
                    '<span class="title">BaseLayer : ' + l.id + '</span>' + 
                    '<p>url : ' + l.service_url + '</br>capas : ' + l.name + '</p>' +
                    '<a href="#!" class="secondary-content remove-map-layer-btn" map-id="' + mapId + '" layer-id="' + l.id + '" layer-type="base">' +
                        '<i class="material-icons red-text">remove_circle_outline</i></a>' + 
                '</li>'
            );
        }
    });

    $('#edit-map').find('.modal-content').empty().append(ul);

    $('#edit-map').find('ul.map-layers').sortable({
        placeholder: "ui-state-highlight",
        update : function(event, ui){
            if($('#edit-map').find('#save-order').length) return;
            $('#edit-map').find('ul.map-layers').prepend(
                '<button id="save-order" map-id="' + mapId + '"class="btn waves-effect waves-light" name="action">Guardar orden<i class="material-icons right">send</i></button>'
            )
        },
        items : 'li'
    }).disableSelection();

    //if(!map.orden) $('#edit-map').find('.modal-content').prepend('<div>No existe orden para este mapa en la base de datos</div>');

    var selectNotMapLayers = $('<div class="input-field col s12"><select class="select-add-map-layer"><option value="" selected disabled>Elige capa a añadir</option></select></div>');
    var selectNotMapBaseLayers = $('<div class="input-field col s12"><select class="select-add-map-base-layer"><option value="" selected disabled>Elige capa base a añadir</option></select></div>');
    allLayers.forEach(function(ly){
        if( (map.layers || []).indexOf(ly.id) == -1){
            selectNotMapLayers.find('select').append(
                '<option value="' + ly.id + '">' + ly.name + '</option>'
            );
        }
    });

    allBaseLayers.forEach(function(bly){
        if( (map.baselayers || []).indexOf(bly.id) == -1){
            selectNotMapBaseLayers.find('select').append(
                '<option value="' + bly.id + '">' + bly.name + '; ' + bly.service_url + '</option>'
            ); 
        }
    });

    container.append('<div class="col s12 card-panel indigo white-text" style="padding : 10px;">Capas PostGIS</div>');
    container.append(selectNotMapLayers);
    container.append('<div class="col s12 card-panel indigo white-text" style="padding : 10px;">Capas Base</div>');
    container.append(selectNotMapBaseLayers);
    $('#edit-map').find('.modal-content').prepend(container);
    
    $('#edit-map').find('select').material_select();
    $('#edit-map').find('select.select-add-map-layer').change(function(){
        var select = $(this);
        var selectedOpt = $(this).find('option:selected');
        var layerId = selectedOpt.val();
        var l = findLayer(layerId);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/admin/maps/layers', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                console.log(xhr.responseText);
                if(xhr.status >= 200 && xhr.status < 400){
                    $('#edit-map').find('ul.map-layers').append(
                        '<li class="collection-item avatar">' + 
                            '<i class="material-icons circle green">layers</i>' + 
                            '<span class="title">' + l.name + '</span>' + 
                            '<p>id : ' + l.id + '</br>oid : ' + l.oid + '</p>' +
                            '<a href="#!" class="secondary-content remove-map-layer-btn" map-id="' + mapId + '" layer-id="' + l.id + '" layer-type="layer">' +
                                '<i class="material-icons red-text">remove_circle_outline</i></a>' + 
                        '</li>'
                    );
                    selectedOpt.remove();
                    if(!map.layers) map.layers = [];
                    map.layers.push(l.id);
                    select.val("").material_select();

                    Materialize.toast('Capa añadida correctamente', 2000);
                }
            }
        }
        xhr.send('id_map=' + mapId + '&id_layer=' + layerId);
    });
    $('#edit-map').find('select.select-add-map-base-layer').change(function(){
        var select = $(this);
        var selectedOpt = $(this).find('option:selected');
        var layerId = selectedOpt.val();
        var l = findBaseLayer(layerId);
        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/admin/maps/baselayers', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                //console.log(xhr.responseText);
                if(xhr.status >= 200 && xhr.status < 400){
                    $('#edit-map').find('ul.map-layers').append(
                        '<li class="collection-item avatar">' + 
                            '<i class="material-icons circle green">layers</i>' + 
                            '<span class="title">BaseLayer : ' + l.id + '</span>' + 
                            '<p>url : ' + l.service_url + '</br>capas : ' + l.name + '</p>' +
                            '<a href="#!" class="secondary-content remove-map-layer-btn" map-id="' + mapId + '" layer-id="' + l.id + '" layer-type="base">' + 
                                '<i class="material-icons red-text">remove_circle_outline</i></a>' + 
                        '</li>'
                    );
                    selectedOpt.remove();
                    map.baselayers.push(l.id);
                    select.val("").material_select();

                    Materialize.toast('Capa Base añadida correctamente', 2000);
                }
            }
        }
        xhr.send('id_map=' + mapId + '&id_layer=' + layerId);
    });

    $('#edit-map').openModal();
});

$('body').on('click', '.remove-map-layer-btn', function(e){
    e.preventDefault();
    //alert('aaaaaaaaa');
    var mapId = $(this).attr('map-id');
    var layerId = $(this).attr('layer-id');
    var layerType = $(this).attr('layer-type');
    var layer = layerType == 'layer' ? findLayer(layerId) : findBaseLayer(layerId);
    var map = findMap(mapId);

    var li = $(this).parent();

    var xhr = new XMLHttpRequest();
    var path = '/admin/maps/' + (layerType == 'layer' ? 'layers' : 'baselayers');

    xhr.open('DELETE', path, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                li.remove();

                ( layerType == 'layer' ? map.layers : map.baselayers ).forEach(function(lid, index, arr){
                    if(lid == layerId){ arr.splice(index, 1); return; }
                });

                var option = layerType == 'layer'
                    ? '<option value="' + layer.id + '">' + layer.name + '</option>'
                    : '<option value="' + layer.id + '">' + layer.name + '; ' + layer.service_url + '</option>';
                $('#edit-map')
                    .find( layerType == 'layer' ? 'select.select-add-map-layer' : 'select.select-add-map-base-layer')
                    .append(option)
                    .material_select();

                Materialize.toast('Capa eliminada correctamente del mapa', 2000);
            }
        }
    }
    xhr.send('id_map=' + mapId + '&id_layer=' + layerId);
});

$('body').on('click', '#save-order', function(e){
    var btn = $(this);
    var mapId = +btn.attr('map-id');
    var xhr = new XMLHttpRequest();
    btn.prop('disabled', 'disabled');

    var orderArray = [];

    $('#edit-map').find('ul.map-layers').find('li').each(function(idx, el){
        var btnremove = $(el).find('.remove-map-layer-btn');
        var layerId = btnremove.attr('layer-id');
        var layerType = btnremove.attr('layer-type');
        var obj = {
            id_layer : layerId,
            id_map : mapId,
            layer_type : layerType,
            position : idx
        }
        orderArray.push(obj);
    });

    xhr.open('POST', '/admin/maps/order', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                Materialize.toast('Orden guardado correctamente', 2000);
            }
            btn.prop('disabled', false);
            btn.remove();
        }
    }
    xhr.send('id_map=' + mapId + '&order=' + JSON.stringify(orderArray) );

});


$('.input-group').change(function(e){
    var group = $(this).attr('id');
    $('[group = "' + group + '"]').prop('checked', $(this).is(':checked'));
});

$('.input-user').change(function(e){
    var allChecked = true;
    $(this).closest('ul.collection').find('li').each(function(idx, el){
        if(!$(el).find('input').is(':checked')) allChecked = false;
    });

    $(this).parents('li.active').find('.collapsible-header').find('input').prop('checked', allChecked);

});

$('#send-mail').click(function(e){
    var titulo = $('#titulo-mail').val();
    var cuerpo = $('#cuerpo-mail').val();
    var emails = [];
    var xhr = new XMLHttpRequest();

    var btn = $(this);

    $('#mail')
    .find('ul.collapsible')
    .find('li')
    .find('.collapsible-body')
    .find('li')
    .each(function(idx, el){
        var input = $(el).find('input');
        var email = input.attr('email');
        console.log(input);
        if(input.is(':checked') && emails.indexOf(email) == -1){
            emails.push(email);
        }
    });

    if(!titulo || !cuerpo || !emails.length) return Materialize.toast('Faltan parámetros', 2000);

    btn.prop('disabled', false);
    $('#mail').append(
        '<div id="send-mail-progress" class="valign-wrapper" style="position : fixed; top : 0px; bottom : 0px; left : 0px; right : 0px; z-index : 1;">' + 
            '<div class="progress valign" style="margin : 0px auto;"><div class="indeterminate"></div></div>' +
        '</div>'
    );

    xhr.open('POST', '/admin/mail/send', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            btn.prop('disabled', false);
            $('#send-mail-progress').remove();
            if(xhr.status >= 200 && xhr.status < 400){
                $('#titulo-mail').val('');
                $('#cuerpo-mail').val('');

                $('#mail')
                .find('ul.collapsible')
                .find('li')
                .find('.collapsible-header')
                .find('input')
                .prop('checked', false);

                $('#mail')
                .find('ul.collapsible')
                .find('li')
                .find('.collapsible-body')
                .find('li')
                .each(function(idx, el){
                    $(el).find('input').prop('checked', false);
                });

                return Materialize.toast('Mail enviado correctamente', 2000);
            }
            Materialize.toast('Fallo al enviar email', 2000);
        }
    }
    xhr.send('titulo=' + titulo + '&cuerpo=' + cuerpo + '&destinatarios=' + JSON.stringify(emails) );

});


function mobileAndTabletcheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function refreshCapas(){
    $('#capas_table').DataTable().destroy(true);
    $('<table id="capas_table" class="display highlight" cellspacing="0" width="100%"><thead></thead><tbody></tbody></table>').insertAfter('#capas .card-panel:first');
    var tbody = $('#capas_table').find('tbody');
    var thead = $('#capas_table').find('thead');

    var tr = $('<tr>').appendTo(thead);
    ['id', 'name', 'oid'].forEach(function(k){
        $('<th>').html(k).appendTo(tr);
    });
    $('<th class="no-sort"><i class="material-icons" style="cursor : default;">remove_circle_outline</i></th>').appendTo(tr);

    allLayers.forEach(function(l){
        var tr = $('<tr>').appendTo(tbody);
        ['id', 'name', 'oid'].forEach(function(k){
            $('<td>').html(l[k]).appendTo(tr);
        });
        tr.append(
            $('<td>').html(
                '<i layer-id="' + l.id + '" layer-name="' + l.name + '" class="red-text delete-layer-btn material-icons" style="cursor : pointer;">remove_circle_outline</i>'
            )
        );
    });
    setDataTable('#capas_table');
}

function refreshCapasBase(){
    $('#capas_wms_table').DataTable().destroy(true);
    $('<table id="capas_wms_table" class="display highlight" cellspacing="0" width="100%"><thead></thead><tbody></tbody></table>')
        .insertAfter('#capas .card-panel:eq(1)');
    var tbody = $('#capas_wms_table').find('tbody');
    var thead = $('#capas_wms_table').find('thead');

    var tr = $('<tr>').appendTo(thead);
    ['id', 'service_url','name'].forEach(function(k){
        $('<th>').html(k).appendTo(tr);
    });
    $('<th class="no-sort"><i class="material-icons" style="cursor : default;">remove_circle_outline</i></th>').appendTo(tr);

    allBaseLayers.forEach(function(l){
        var tr = $('<tr>').appendTo(tbody);
        ['id', 'service_url','name'].forEach(function(k){
            $('<td>').html(l[k]).appendTo(tr);
        });
        tr.append(
            $('<td>').html(
                '<i baselayer-id="' + l.id + '" class="red-text delete-baselayer-btn material-icons" style="cursor : pointer;">remove_circle_outline</i>'
            )
        );
    });
    setDataTable('#capas_wms_table');
}

function findPositionInOrder(lid, ltype, orderList){
    return orderList.reduce(function(a, b){
        if(b.layer_type == ltype && lid === b.id_layer) a = b.position;
        return a;
    }, null);
}


function addMap(map_){
    var map = {
        id : map_.id,
        name : map_.name,
        layers : [],
        baselayers : []
    }
    allMaps.push(map);
    allUsers.forEach(function(u){
        u.not_assigned_maps
            ? u.not_assigned_maps.push(map)
            : u.not_assigned_maps = [map];
    });

    $('#mapas-table').find('tbody').append(
        '<tr>' + 
             '<td>' + map.id + '</td><td>' + map.name + '</td><td></td><td></td>' + 
             '<td><i class="green-text edit-map-btn material-icons" map-id="' + map.id + '" style="cursor : pointer;">mode_edit</i></td>' +
             '<td><i class="red-text delete-map-btn material-icons" map-id="' + map.id + '" style="cursor : pointer;">remove_circle_outline</i></td>' +
        '</tr>'
    );
    $('#new-map-default').find('tbody').append(
        '<option value="' + map.id + '">' + map.name + '</option>'
    ).material_select();
}

function addDefaultMap(mapId){
    var map = findMap(mapId);
    allDefaultMaps.push(map);
    var tr = $('<tr></tr>');
    ['id', 'name'].forEach(function(k){
        tr.append(
            '<td>' + map[k] + '</td>'
        );
    });
    tr.append(
        '<td><i class="red-text delete-map-default-btn material-icons" map-id="' + map.id + '" style="cursor : pointer;">remove_circle_outline</i></td>'
    );
    $('#mapas-default-table').find('tbody').append(tr);
}

function deleteUsersMap(mapId){
    allUsers.forEach(function(u){
        (u.maps || []).forEach(function(m, index){
            console.log(m, mapId, 'maaap');
            if(m.id_map == mapId){
                console.log(m, mapId, 'maaapsii');
                u.maps.splice(index, 1);
                return;
            }
        });

        (u.not_assigned_maps || []).forEach(function(m, index){
            if(m.id == mapId){
                u.not_assigned_maps.splice(index, 1);
                return;
            }
        });

        allMaps.forEach(function(m, index){
            if(m.id_map == mapId){
                allMaps.splice(index, 1);
                return;
            }          
        });

    });
}


function findUser(id_user){
    return allUsers.reduce(function(a, user){
        if(user.id == id_user) return user;
        else return a;
    }, {});
}

function findMap(id_map){
    return allMaps.reduce(function(a, map){
        if(map.id == id_map) return map;
        else return a;
    }, {});
}

function findLayer(id_layer){
    return allLayers.reduce(function(a, layer){
        if(layer.id == id_layer) return layer;
        return a;
    }, {});  
}

function findBaseLayer(id_layer){
    return allBaseLayers.reduce(function(a, layer){
        if(layer.id == id_layer) return layer;
        return a;
    }, {});    
}

function findLayers(layerIds){
    if(!layerIds) return [];
    return layerIds.map(function(lid){
        return allLayers.reduce(function(a, l){
            if(l.id == lid){
                return l;
            }
            return a;
        });
    });
}

function findPerms(id_user, layerIds){
    if(!layerIds) return [];
    var user = findUser(id_user);
    return layerIds.map(function(lid){
        return (user.layers_rol || []).reduce(function(a, lr){
            if(lr.id_layer == lid) return lr.rol;
            return a;
        }, 'r');
    })
}

function findPerm(id_user, id_layer){
    var user = findUser(id_user);
    return (user.layers_rol || []).reduce(function(a, lr){
        if(lr.id_layer == id_layer) return lr.rol;
        return a;
    }, 'r');
}

function removeLayer(layerId){
    (allLayers || []).forEach(function(l, idx){
        if(l.id == layerId)
            allLayers.splice(idx, 1);
    });
}

function removeBaseLayer(layerId){
    (allBaseLayers || []).forEach(function(l, idx){
        if(l.id == +layerId)
            allBaseLayers.splice(idx, 1);
    });
}

function removeGroup(user, group){
    (user.grupos || []).forEach(function(g, idx){
        if(g == group)
            user.grupos.splice(idx, 1);
    });
}

function addGroup(user, group){
    if(!user.grupos) user.grupos = [];
    user.grupos.push(group);
}

function changeUserLayerRole(user, layerId, rol){
    user.maps.forEach(function(m){
        m.layers.forEach(function(l){
            if(l.id_layer == layerId){
                l.rol = rol;
            }
        });
    });
    user.layers_rol.forEach(function(lr){
        if(lr.id_layer == layerId){
            lr.rol = rol;
        }
    });
}


function appendTabUserDetail(assigned, notAssigned, groups, permisos){
    $('#user-detail .modal-content')
    .append(
        '<div class="row">'+
            '<div class="col s12">'+
                '<ul class="tabs">'+
                    '<li class="tab col s6"><a class="active" href="#mapas-usuario">Mapas</a></li>'+
                    '<li class="tab col s6"><a href="#assign-mapas">Asignar Mapas</a></li>'+
                    '<li class="tab col s6"><a href="#grupos">Grupos</a></li>'+
                    '<li class="tab col s6"><a href="#permisos">Permisos</a></li>'+
                '</ul>'+
            '</div>'+
            '<div id="mapas-usuario" class="col s12">' + assigned + '</div>'+
            '<div id="assign-mapas" class="col s12">' + notAssigned + '</div>'+
            '<div id="grupos" class="col s12">' + groups + '</div>'+
            '<div id="permisos" class="col s12">' + permisos + '</div>'+
        '</div>'
    );
}

function appendUserMapsDetail(selector, user, mapa){
    $(selector).append(
        '<li>' + 
            '<div class="collapsible-header">' + 
                '<i class="material-icons">map</i>' +
                '<i style="float: right; pointer : cursor;" class="remove-map-btn red-text material-icons" user-id="' 
                        + user.id +'" map-id="' + (mapa.id_map || mapa.id) + '">' + 
                    'remove_circle_outline' +
                '</i>' 
                + mapa.name + 
            '</div>' +
        '</li>'
    );
}

function removeFromList (na, id_map){
    na.forEach(function(map, idx){
        if( (map.id || map.id_map) == id_map){
            na.splice(idx, 1);
            return;
        }
    });
}

function isLayerIdInList(id_layer, list){
    for(var i = 0; i < list.length; i++){
        if(list[i].id_layer == id_layer)
            return true;
    }
    return false;
}

function setDataTable(selector){
    var table = $(selector).DataTable({
        order : [],
        "columnDefs": [ {
            "targets": 'no-sort',
            "orderable": false
        } ],
        "language": {
            "sProcessing":     "Procesando...",
            "sLengthMenu":     "Mostrar _MENU_ registros",
            "sZeroRecords":    "No se encontraron resultados",
            "sEmptyTable":     "Ningún dato disponible en esta tabla",
            "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix":    "",
            "sSearch":         "Buscar:",
            "sUrl":            "",
            "sInfoThousands":  ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst":    "Primero",
                "sLast":     "Último",
                "sNext":     "Siguiente",
                "sPrevious": "Anterior"
            },
            "oAria": {
            "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        }
    });
    $(selector).parent().find('select').material_select();
}