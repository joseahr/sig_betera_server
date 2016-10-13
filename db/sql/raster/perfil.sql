-- http://blog.mathieu-leplatre.info/drape-lines-on-a-dem-with-postgis.html
WITH line AS
-- From an arbitrary line
(SELECT ${wkt}::geometry AS geom),
linemesure AS
-- Add a mesure dimension to extract steps
(SELECT ST_AddMeasure(line.geom, 0, ST_Length(line.geom)) as linem,
        generate_series(0, ST_Length(line.geom)::int, 1) as i
    FROM line),
points2d AS
(SELECT ST_GeometryN(ST_LocateAlong(linem, i), 1) AS geom, st_asText(ST_GeometryN(ST_LocateAlong(linem, i), 1)) FROM linemesure),
cells AS
-- Get DEM elevation for each
(SELECT p.geom AS geom, st_astext(p.geom), ST_Value(mdt.rast, 1, p.geom) AS val
    FROM capas.mdt, points2d p
    WHERE ST_Intersects(mdt.rast, p.geom)),
-- Instantiate 3D points
points3d AS
(SELECT ST_SetSRID(ST_MakePoint(ST_X(geom), ST_Y(geom), val), 25830) AS geom FROM cells)
-- Build 3D line from 3D points
SELECT ST_AsGeoJSON(ST_MakeLine(geom))::json as perfil FROM points3d;