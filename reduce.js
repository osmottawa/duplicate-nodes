const turf = require('@turf/turf')
const invariant = require('@turf/invariant')

const days = global.mapOptions.days
const extent = global.mapOptions.extent
const users = global.mapOptions.users

module.exports = (data, tile, writeData, done) => {
  const features = []
  const timestamp = Date.now() / 1000 - days * 24 * 60 * 60
  const unique = {}

  for (let feature of data.qatiles.osm.features) {
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
      // Only find buildings
      if (!feature.properties.highway) { continue }

      // Filter by Date
      if (days > 0) { if (!(Number(feature.properties['@timestamp']) > timestamp)) { continue } }

      // Filter by Usernames
      if (users.length) { if (users.indexOf(feature.properties['@user']) === -1) { continue } }

      // Must intersect within extent
      if (turf.intersect(feature, extent)) {
        let duplicate = false
        feature = turf.truncate(feature)

        // Detect duplicate nodes (must intersect both previous & current)
        turf.coordReduce(feature, (previousCoord, currentCoord) => {
          if (unique[previousCoord.join(',')] && unique[currentCoord.join(',')]) duplicate = true
          return currentCoord
        })
        // Add coordinates to unique
        turf.coordEach(feature, coord => unique[coord.join(',')] = true)

        if (duplicate) features.push(feature)
      }
    }
  }
  done(null, features)
}