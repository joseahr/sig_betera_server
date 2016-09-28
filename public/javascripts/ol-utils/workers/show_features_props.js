self.addEventListener('message', function(e){
    var window = self;
    window.map.getLayers().forEach(function(ll){
        if(ll instanceof ol.layer.Group){
            ll.getLayers().forEach(function(l){
                if(l.get('name') === e.data){
                    self.postMessage(l.getProperties());
                }
            });
        }
    });
});