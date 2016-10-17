ol.control.SideMenu = function(opts){
    var self = this;
    var sideMenuOpened = false;
    var element = $('<a href="#" data-tooltip="Menú" data-delay="50" data-position="top">')
        .addClass('card-panel collection row tooltiped valign-wrapper')
        .css('position', 'absolute')
        .css('background', 'rgba(0,0,0,0)')
        .css('margin', '0px')
        .css('padding', '0px')
        .css('bottom', '0.5em')
        .css('border', 'none')
        .css('left', '0.5em');
    var icon = $('<i>')
        .addClass('material-icons valign indigo-text darken-2')
        .css('font-size', '2.5em')
        .html('arrow_back')
        .appendTo(element);
    
    ol.control.Control.call(this, {
        element : element.get(0)
    });

    this.opened = opts.mapController.mobileAndTabletcheck()
        ? false
        : true;
    this.opened 
        ? icon.addClass('red-text').removeClass('indigo-text') : null;

    element.bind('click', function(e){
        e.preventDefault();
        //console.log(self.opened);
        var paddingLeft;
        var step = 0;
        if(self.opened) {
            $('#slide-out').stop(true, true).animate({ fake : 0}, 0).animate({ fake : 300 }, {
                step : function(now, fx){
                    $(this).css('transform', 'translateX(' + (-now)+ 'px)');
                    opts.mapController.updateSize('left', (300 - now) + 'px');
                },
                duration : 400
            });
            icon.removeClass('red-text').addClass('indigo-text').html('arrow_forward');
            
            if(+$('#map').css('padding-bottom').replace('px', '') > 0){
                $('.modal').css('left', '0px');
                $('.modal').css('width', 'auto');
                $('.modal').css('max-width', '');
                $('.modal').css('right', '0px');
            }
            if( +($('.modal.open').css('left') || '0px').replace('px', '') == 300){
                $('.modal').css('left', '0px');
                $('.modal').css('max-width', $('#map').width() );
            }
        }
        else {
            $('#slide-out').stop(true, true).animate({ fake : 0}, 0).animate({ fake : 300 }, {
                step : function(now, fx){
                    $(this).css('transform', 'translateX(' + (-300 + now) + 'px)');
                    opts.mapController.updateSize('left', now + 'px');
                },
                duration : 400
            });
            icon.removeClass('indigo-text').addClass('red-text').html('arrow_back');
            if(+$('#map').css('padding-bottom').replace('px', '') > 0){
                $('.modal').css('left', '300px');
                $('.modal').css('width', 'auto');
                //alert($(window).width() - 300);
                $('.modal').css('max-width', '');
                $('.modal').css('right', '0px');
            }
            if(+($('.modal.open').css('left') || '300px').replace('px', '') < 300){
                //alert($(window).width() - 300);
                $('.modal').css('left', '300px');
                if($('.modal.open').width() > $(window).width() - 300 ){
                    $('.modal').css('right', '0px');
                    $('.modal').css('width', 'auto');
                    $('.modal').css('max-width', $(window).width() - 300 );
                }
            }

        }
        self.opened = !self.opened;
    });

    $('#close-sidenav').bind('click', function(e){
        e.preventDefault();
        //console.log('close sidenav');
        element.click();
    });

    $('body').on('click', '#sidenav-overlay', function(){
        opts.mapController.updateSize('left', '0px')
    });
}

ol.inherits(ol.control.SideMenu, ol.control.Control);