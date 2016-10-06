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
        .css('font-size', '3em')
        .html('menu')
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
        console.log(self.opened);
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
            icon.addClass('indigo-text').removeClass('red-text');
        }
        else {
            $('#slide-out').stop(true, true).animate({ fake : 0}, 0).animate({ fake : 300 }, {
                step : function(now, fx){
                    $(this).css('transform', 'translateX(' + (-300 + now) + 'px)');
                    opts.mapController.updateSize('left', now + 'px');
                },
                duration : 400
            });
            icon.addClass('red-text').removeClass('indigo-text');
        }
        self.opened = !self.opened;
    });

    $('#close-sidenav').bind('click', function(e){
        e.preventDefault();
        console.log('close sidenav');
        element.click();
    });

    $('body').on('click', '#sidenav-overlay', function(){
        opts.mapController.updateSize('left', '0px')
    });
}

ol.inherits(ol.control.SideMenu, ol.control.Control);