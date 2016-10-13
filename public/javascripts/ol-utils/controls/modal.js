function ModalBetera(selector, opts){

    var self = this;

    this.modalFire = $('<a href="' + selector + '">').leanModal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: 0, // Opacity of modal background
        ready : function(){
            if(opts.ready) opts.ready.call(this);
            
            self.modalFS = false;
            self.fullScreenPerfilAnchor.html('fullscreen');

            $(selector).css('z-index', '0');

            $(selector).resizable().resizable("disable");
            $(selector).draggable({
                handle : '.modal-header',
                cursor : 'crosshair',
                containment: "#map", scroll: false,
                start : function(){

                    self.modalFS = false;
                    self.fullScreenPerfilAnchor.html('fullscreen');
                    
                    $(selector).resizable("enable");

                    $(selector).css('bottom', 'auto');
                    $(selector).css('left', 'auto');
                    $(selector).css('right', 'auto');
                    $(selector).css('top', 'auto');

                    if($(selector).width() == $('#map').width() )
                        $(selector).css('width', $(selector).css('min-width'));
                    if($(selector).height() > $('#map').height()/2 )
                        $(selector).css('height', $(selector).css('min-height'));
                    //$(selector).css('height', $(selector).css('min-height'));

                    //alert($('#map').width());
                    $(selector).css('max-width', $('#map').width() );
                    if(+$('#map').css('padding-bottom').replace('px', '') > 0){
                        $('#map').css('padding-bottom', '0px');
                        mapController.map.updateSize();
                    }
                }
            });

            $('#map').css('padding-bottom', $(selector).outerHeight());
            mapController.map.updateSize();
            mapController.map.changed();
            $(selector).css('left', $('#map').css('padding-left'));
            $(selector).css('right', '0px');
            $(selector).css('width', 'auto');
            $(selector).css('max-width', $('#map').width() );
        },
        complete: function() {
            if(opts.complete) opts.complete.call(this);
            $(selector).draggable( "destroy" );
            $(selector).css('z-index', '-1');
            $(selector).css('height', $(selector).css('min-height'));
            $(selector).css('width', $(selector).css('min-width'));
            $(selector).css('position', 'absolute');
            $(selector).css('top', 'auto');
            $(selector).css('bottom', '0px');
            $(selector).css('left', '300px');
        } // Callback for Modal close
    });

    this.minimizeAnchor = $('<i class="material-icons white-text" style="font-size : 1.5em;float : right; cursor : pointer; background : rgba(0,0,0,0.3); border-radius : 40px; margin : 3px;">remove</i>')
        .on('click', function(){
            self.modalFS = false;
            self.fullScreenPerfilAnchor.html('fullscreen');

            $(selector).css('max-width', $('#map').width() );

            $(selector).css('position', 'absolute');
            $(selector).css('top', 'auto');
            $(selector).css('bottom', '0px');
            $(selector).css('right', '0px');
            $(selector).css('width', 'auto');
            $(selector).css('left', $('#map').css('padding-left') );

            $(selector).css('height', $(selector).css('min-height') )

            $(selector).resizable("disable");
            $(selector).draggable("enable");

            $('#map').css('padding-bottom', $(selector).outerHeight());
            mapController.map.updateSize();
        });
    this.closeAnchor = $('<a class="modal-action modal-close" style="float : right;"><i class="material-icons red-text" style="font-size : 1.5em;background : rgba(0,0,0,0.3); border-radius : 40px; margin : 3px;">clear</i></a>');
    this.modalFS = false;
    this.fullScreenPerfilAnchor = $('<i class="material-icons white-text" style="font-size : 1.5em; float : right; cursor : pointer; background : rgba(0,0,0,0.3); border-radius : 40px; margin : 3px;">fullscreen</i>')
        .on('click', function(){
            if(self.modalFS){
                $(this).html('fullscreen');

                $(selector).css('max-width', $('#map').width() );

                $(selector).css('position', 'absolute');
                $(selector).css('top', 'auto');
                $(selector).css('bottom', '0px');
                $(selector).css('right', '0px');
                $(selector).css('width', 'auto');
                $(selector).css('left', $('#map').css('padding-left') );

                $(selector).css('height', $(selector).css('min-height') )

                $(selector).resizable("disable");
                $(selector).draggable("enable");

                $('#map').css('padding-bottom', $(selector).outerHeight());
                mapController.map.updateSize();

            } else {
                
                $(selector).css('max-width', $('#map').width() );

                $(this).html('fullscreen_exit');
                $(selector).css('position', 'absolute');

                $(selector).css('top', '0px');
                $(selector).css('right', '0px');
                $(selector).css('left', $('#map').css('padding-left'));

                $(selector).css('width', '');
                $(selector).css('height', '50%');

                $(selector).resizable("enable");
                //$(selector).draggable('disable');
                //$(selector).find('.modal-header').css('cursor', 'auto');

                $('#map').css('padding-bottom', '0px');
                mapController.map.updateSize();
            }
            self.modalFS = !self.modalFS;
        });
    $(selector + ' .modal-header').before(this.closeAnchor);
    $(selector + ' .modal-header').before(this.fullScreenPerfilAnchor);
    $(selector + ' .modal-header').before(this.minimizeAnchor);
    $(selector + ' .modal-header').find('h4').css('margin-left', '81px');
}

ModalBetera.prototype.getDisparador = function(){
    return this.modalFire;
}

ModalBetera.prototype.closeModal = function(){
    this.closeAnchor.trigger('click');
}