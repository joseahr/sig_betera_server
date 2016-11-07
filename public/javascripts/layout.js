$("[data-animation-effect]").each(function() {
    var $this = $(this),
    animationEffect = $this.attr("data-animation-effect");

    $this.css('opacity', 0);

    $this.appear(function() {
        setTimeout(function() {
            $this.removeClass('object-non-visible');
            $this.removeClass('animated').addClass('animated object-visible ' + animationEffect);
        }, 400);
    }, {accX: 0, accY: -130});
});