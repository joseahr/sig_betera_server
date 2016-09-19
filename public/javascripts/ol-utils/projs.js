// http://epsg.io/

proj4.defs("EPSG:4258","+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
proj4.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// [minX, minY, maxX, maxY]
var bounds25830 = [-138355.310720, 4097656.744290, 1145625.043311, 4831391.211958];
var proj25830 = ol.proj.get('EPSG:25830');
proj25830.setExtent(bounds25830);

var proyecciones = {
    "4258"  : ol.proj.get('EPSG:4258'),
    "25830" : proj25830
};