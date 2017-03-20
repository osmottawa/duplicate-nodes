# Duplicate Nodes

> Tile Reduce script to detect duplicate nodes from OSM Roads

## Download QA-Tile

```bash
$ aws s3 cp s3://mapbox/osm-qa-tiles/latest.country/thailand.mbtiles.gz thailand.mbtiles.gz
$ gzip -d thailand.mbtiles.gz
```

## Quickstart

```bash
npm install
npm start
```

## Results

```bash
Extent: ./extents/thailand.geojson
Past days: 200
QA Tiles: thailand.mbtiles
Duplicate roads total: 10
Users:
- [2] RobbyB99
- [2] opelgrove
- [2] Rodrigo_cdlv
- [1] BALTHUS★MC
- [1] Russ McD
- [1] RVR007
- [1] stephankn
```