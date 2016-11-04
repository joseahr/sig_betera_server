if (($("[data-animation-effect]").length>0) && !Modernizr.touch) {
    $("[data-animation-effect]").each(function() {
        var $this = $(this),
        animationEffect = $this.attr("data-animation-effect");
        if(Modernizr.csstransitions) {
            $this.appear(function() {
                setTimeout(function() {
                    $this.removeClass('animated').addClass('animated object-visible ' + animationEffect);
                }, 400);
            }, {accX: 0, accY: -130});
        } else {
            $this.addClass('object-visible');
        }
    });
};